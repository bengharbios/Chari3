const fs = require('fs');

let code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');

// 1. Add editingTargetSectId state and currentSlides memo
const stateStr = `
  const [activeTab, setActiveTab] = useState('layout');
  const [editingTargetSectId, setEditingTargetSectId] = useState<string | null>(null);

  const currentSlides = React.useMemo(() => {
    if (editingTargetSectId === null) return heroSlides;
    const sect = layout.find(s => s.id === editingTargetSectId);
    return sect?.metadata?.slides || [];
  }, [editingTargetSectId, heroSlides, layout]);

  const updateCurrentSlides = async (updatedSlides: any[]) => {
    if (editingTargetSectId === null) {
      setHeroSlides(updatedSlides);
      await persistConfig(layout, pinned, countdown, updatedSlides);
    } else {
      const newLayout = layout.map(s => s.id === editingTargetSectId ? { ...s, metadata: { ...s.metadata, slides: updatedSlides } } : s);
      setLayout(newLayout);
      await persistConfig(newLayout, pinned, countdown, heroSlides);
    }
  };
`;
code = code.replace(/const \[activeTab, setActiveTab\] = useState\('layout'\);/, stateStr.trim());

// 2. Modify handleStartAddSlide
const addSlideOriginal = `
  const handleStartAddSlide = () => {
    const initialSlide: HeroSlide = {
      id: String(Date.now()),
      title: '', subtitle: '', badge: '', cta: '', linkUrl: '', imageUrl: '', bgGradient: 'from-blue-950 to-slate-900',
    };
    languages.forEach((lang: any) => {
      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
      const isArabic = lang.code === 'ar';
      (initialSlide as any)[\`title\${codeSuffix}\`] = '';
      (initialSlide as any)[\`subtitle\${codeSuffix}\`] = '';
      (initialSlide as any)[\`badge\${codeSuffix}\`] = '';
      (initialSlide as any)[\`cta\${codeSuffix}\`] = '';
    });
    setEditSlideData(initialSlide);
    setEditingSlideIndex(heroSlides.length);
  };
`;
code = code.replace(/setEditingSlideIndex\(heroSlides.length\);/, 'setEditingSlideIndex(currentSlides.length);');


// 3. Modify handleStartEditSlide
code = code.replace(/const slide = heroSlides\[index\];/, 'const slide = currentSlides[index];');


// 4. Modify handleSaveSlide
const handleSaveSlideReplacement = `
  const handleSaveSlide = async () => {
    if (editingSlideIndex === null) return;
    const updated = [...currentSlides];
    if (editingSlideIndex === currentSlides.length) {
      updated.push({ ...editSlideData, id: String(Date.now()) });
    } else {
      updated[editingSlideIndex] = { ...updated[editingSlideIndex], ...editSlideData };
    }
    setEditingSlideIndex(null);
    await updateCurrentSlides(updated);
  };
`;
code = code.replace(/const handleSaveSlide = async \(\) => \{[\s\S]*?await persistConfig\(layout, pinned, countdown, updated\);\n\s*\};/, handleSaveSlideReplacement.trim());


// 5. Modify handleDeleteSlide
const handleDeleteSlideReplacement = `
  const handleDeleteSlide = async (index: number) => {
    const updated = currentSlides.filter((_, i) => i !== index);
    if (editingSlideIndex === index) {
      setEditingSlideIndex(null);
    } else if (editingSlideIndex !== null && editingSlideIndex > index) {
      setEditingSlideIndex(editingSlideIndex - 1);
    }
    await updateCurrentSlides(updated);
  };
`;
code = code.replace(/const handleDeleteSlide = async \(index: number\) => \{[\s\S]*?await persistConfig\(layout, pinned, countdown, updated\);\n\s*\};/, handleDeleteSlideReplacement.trim());


// 6. Modify moveSlide
const moveSlideReplacement = `
  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= currentSlides.length) return;
    const updated = [...currentSlides];
    const temp = updated[index];
    updated[index] = updated[nextIndex]!;
    updated[nextIndex] = temp!;
    if (editingSlideIndex === index) {
      setEditingSlideIndex(nextIndex);
    } else if (editingSlideIndex === nextIndex) {
      setEditingSlideIndex(index);
    }
    await updateCurrentSlides(updated);
  };
`;
code = code.replace(/const moveSlide = async \(index: number, direction: 'up' \| 'down'\) => \{[\s\S]*?await persistConfig\(layout, pinned, countdown, updated\);\n\s*\};/, moveSlideReplacement.trim());

// 7. Inject the UI dropdown inside the slides tab (line 2461ish)
const dropdownUI = `
                  <div className="mb-4">
                    <Label className="text-xs font-bold mb-2 block">{t('homepage.selectSliderToEdit', 'اختر السلايدر لتعديله')}</Label>
                    <select
                      value={editingTargetSectId || ''}
                      onChange={(e) => {
                        setEditingTargetSectId(e.target.value === '' ? null : e.target.value);
                        setEditingSlideIndex(null);
                      }}
                      className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full max-w-sm"
                    >
                      <option value="">{t('homepage.mainSliderDefault', 'السلايدر الرئيسي (الافتراضي)')}</option>
                      {layout.filter(s => s.type === 'hero').map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          {t('homepage.sliderForSection', 'سلايدر قسم:')} {isAr ? s.title : (s.titleEn || s.title || \`Hero \${idx + 1}\`)}
                        </option>
                      ))}
                    </select>
                  </div>
`;

code = code.replace(/<CardContent className="space-y-4">/, '<CardContent className="space-y-4">' + dropdownUI);

// 8. Replace heroSlides.length and heroSlides.map in the slides tab UI
code = code.replace(/\{heroSlides.length === 0 \? \(/g, '{currentSlides.length === 0 ? (');
code = code.replace(/\{heroSlides\.map\(\(s, idx\) => \(/g, '{currentSlides.map((s, idx) => (');
code = code.replace(/disabled=\{idx === heroSlides.length - 1\}/g, 'disabled={idx === currentSlides.length - 1}');
code = code.replace(/editingSlideIndex === heroSlides.length/g, 'editingSlideIndex === currentSlides.length');


fs.writeFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', code);
console.log("Done");
