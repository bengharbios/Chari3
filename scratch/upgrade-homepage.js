const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/admin-secure-internal/settings/homepage/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Imports
if (!content.includes('@dnd-kit/core')) {
  content = content.replace(
    `import { ImageUploader } from '@/components/ui/ImageUploader';`,
    `import { ImageUploader } from '@/components/ui/ImageUploader';\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';\nimport { SortableSectionItem } from './_components/SortableSectionItem';`
  );
}

// 2. Add Sensors and DragEnd handler
if (!content.includes('const sensors = useSensors(')) {
  const adminComponentStart = content.indexOf('export default function AdminHomepageManager() {');
  const hookInjectionPoint = content.indexOf('const [isMounted, setIsMounted] = useState(false);', adminComponentStart);
  
  const dndHooks = `
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layout.findIndex((item) => item.id === active.id);
      const newIndex = layout.findIndex((item) => item.id === over.id);
      const updatedLayout = arrayMove(layout, oldIndex, newIndex);
      setLayout(updatedLayout);
      await persistConfig(updatedLayout, pinned, countdown, heroSlides);
    }
  };

  `;
  
  content = content.slice(0, hookInjectionPoint) + dndHooks + content.slice(hookInjectionPoint);
}

// 3. Update the Layout List Render
// Find the start of the layout list
const listStartMatch = `<div className="border border-border/85 rounded-[20px] divide-y overflow-hidden bg-background shadow-inner">`;
if (content.includes(listStartMatch)) {
  content = content.replace(
    listStartMatch,
    `<div className="border border-border/85 rounded-[20px] overflow-hidden bg-background shadow-inner">\n                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>\n                      <SortableContext items={layout.map(s => s.id)} strategy={verticalListSortingStrategy}>`
  );
  
  // Wrap the map return
  const returnMatch = `return (\n                        <div key={sect.id} className={\`flex items-center`;
  if (content.includes(returnMatch)) {
    content = content.replace(
      /return \(\s*<div key={sect\.id} className=\{`flex items-center/g,
      `return (\n                        <SortableSectionItem key={sect.id} id={sect.id}>\n                          <div className={\`flex items-center`
    );
  }
  
  // Find the end of the map to close DndContext
  content = content.replace(
    /}\)\}\n                  <\/div>\n\n                  \{\/\* Add New Section Block \*\/\}/g,
    `})}</SortableContext></DndContext>\n                  </div>\n\n                  {/* Add New Section Block */}`
  );
}

// 4. Add Advanced Style Control Options to Metadata
// Specifically, adding paddingTop, paddingBottom, backgroundColor, isMobileHidden, isDesktopHidden
const metadataDefaultObjMatch = `adZone: 'banner_mid',\n      },\n    };`;
if (content.includes(metadataDefaultObjMatch)) {
  content = content.replace(
    metadataDefaultObjMatch,
    `adZone: 'banner_mid',\n        paddingTop: 'py-8', paddingBottom: 'pb-8', backgroundColor: 'transparent', isMobileHidden: false, isDesktopHidden: false,\n      },\n    };`
  );
}

// 5. Inject the UI for these new settings inside the Edit panel
// We'll append it right before the "Cancel/Confirm" buttons.
const confirmButtonsMatch = `<div className="flex justify-end gap-2 pt-4 border-t border-border/60">\n                        <Button variant="ghost" onClick={() => setEditingSectId(null)}`;
if (content.includes(confirmButtonsMatch) && !content.includes('إعدادات مظهر القسم (Styling)')) {
  const stylingSettingsUI = `
                      {/* Advanced Styling & Visibility Control */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-xs font-bold text-teal-500 uppercase flex items-center gap-1.5">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          {t('إعدادات مظهر القسم (Styling & Visibility)', 'Section Styling & Visibility')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('المسافة العلوية (Padding Top)', 'Padding Top')}</Label>
                            <select
                              value={editSectData.metadata?.paddingTop || 'py-8'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, paddingTop: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="pt-0">بدون مسافة (0px)</option>
                              <option value="pt-4">صغيرة (16px)</option>
                              <option value="pt-8">متوسطة (32px)</option>
                              <option value="pt-12">كبيرة (48px)</option>
                              <option value="pt-16">كبيرة جداً (64px)</option>
                            </select>
                          </div>
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('المسافة السفلية (Padding Bottom)', 'Padding Bottom')}</Label>
                            <select
                              value={editSectData.metadata?.paddingBottom || 'pb-8'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, paddingBottom: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="pb-0">بدون مسافة (0px)</option>
                              <option value="pb-4">صغيرة (16px)</option>
                              <option value="pb-8">متوسطة (32px)</option>
                              <option value="pb-12">كبيرة (48px)</option>
                              <option value="pb-16">كبيرة جداً (64px)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('لون الخلفية', 'Background Color')}</Label>
                            <select
                              value={editSectData.metadata?.backgroundColor || 'transparent'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, backgroundColor: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="transparent">شفاف (افتراضي)</option>
                              <option value="bg-slate-50 dark:bg-slate-900/50">رمادي فاتح (Section BG)</option>
                              <option value="bg-brand/5">لون الهوية (خفيف)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('الظهور في الجوال', 'Mobile Visibility')}</Label>
                            <select
                              value={editSectData.metadata?.isMobileHidden ? 'hidden' : 'visible'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, isMobileHidden: e.target.value === 'hidden' } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="visible">إظهار (مرئي)</option>
                              <option value="hidden">إخفاء في الجوال</option>
                            </select>
                          </div>

                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('الظهور في الكمبيوتر', 'Desktop Visibility')}</Label>
                            <select
                              value={editSectData.metadata?.isDesktopHidden ? 'hidden' : 'visible'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, isDesktopHidden: e.target.value === 'hidden' } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="visible">إظهار (مرئي)</option>
                              <option value="hidden">إخفاء في الكمبيوتر</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
`;
  content = content.replace(confirmButtonsMatch, stylingSettingsUI + confirmButtonsMatch);
}


fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully upgraded homepage admin page');
