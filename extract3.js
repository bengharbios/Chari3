const fs = require('fs');
let newComponents = `

export function SectionHeader({ section, isAr, locale, t, children }: any) {
  const title = isAr ? section.titleAr : (section.titleEn || section.titleAr);
  const metadata = section.metadata || {};
  const hasBackground = metadata.backgroundColor && metadata.backgroundColor !== 'transparent';
  return (
    <div className="flex justify-between items-end mb-5">
      <div className="flex items-center gap-3">
        {hasBackground && (
          <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-2">
            {title}
          </h2>
          {metadata.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{metadata.subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CategoryCirclesRowBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const displayCats = (data?.categories ?? []).filter((c: any) => c && c.id).slice(0, 12);
  const [filterCategory, setFilterCategory] = useState('');

  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t}>
        {filterCategory && (
          <Button variant="ghost" size="sm" className="text-destructive gap-1 text-xs" onClick={() => setFilterCategory('')}>
            <X className="size-3" />
            {t('مسح التصفية', 'Clear Filter')}
          </Button>
        )}
      </SectionHeader>
      {displayCats.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-[24px] border border-border/60">
          <ShoppingBag className="size-10 mx-auto mb-2 opacity-25" />
          <p className="text-sm">{t('لا توجد أقسام متاحة حتى الآن', 'No categories available yet')}</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {displayCats.map((cat: any) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(isActive ? '' : cat.id)}
                className={\`flex flex-col items-center justify-center gap-2 p-3.5 rounded-[22px] transition-all duration-300 shrink-0 snap-start select-none \${
                  isActive
                    ? 'bg-amber-500 text-slate-950 scale-105 shadow-md font-bold'
                    : 'bg-white/70 dark:bg-slate-950/70 border border-border/80 hover:border-amber-500/30 hover:scale-105 hover:bg-white dark:hover:bg-slate-900'
                }\`}
                style={{ minWidth: '92px' }}
              >
                <span className="text-2xl drop-shadow-sm select-none">{cat.icon || '📦'}</span>
                <span className="text-[10px] font-bold text-center leading-tight line-clamp-1 max-w-[80px]">
                  {isAr ? cat.name : (cat.nameEn || cat.name)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function BentoOffersBlock({ section, data, locale }: SectionProps) {
  const { t: globalT } = useTranslation();
  const isAr = locale === 'ar';
  const router = useRouter();

  const getLocalizedField = (section: any, field: string, locale: string) => {
    if (!section?.metadata) return null;
    if (locale === 'ar') return section.metadata[\`\${field}Ar\`] || section.metadata[field];
    if (locale === 'fr') return section.metadata[\`\${field}Fr\`] || section.metadata[\`\${field}En\`] || section.metadata[field];
    return section.metadata[\`\${field}En\`] || section.metadata[field];
  };

  const hasCountdown = section.metadata?.enableTimer || data?.countdownConfig?.enabled || false;
  const bentoLimit = section.limit || 8;
  const timerProducts = (data?.bentoCenterProducts?.length ?? 0) > 0 
    ? data!.bentoCenterProducts!.slice(0, bentoLimit)
    : (data?.featuredProducts || []).slice(0, bentoLimit);
  
  const rightCardProducts = (data?.bentoRightProducts?.length ?? 0) > 0 
    ? data!.bentoRightProducts!.slice(0, 4) 
    : (data?.featuredProducts || []).slice(2, 6);
    
  const leftCardProducts = (data?.bentoLeftProducts?.length ?? 0) > 0 
    ? data!.bentoLeftProducts!.slice(0, 2) 
    : (data?.featuredProducts || []).slice(6, 8);

  const rightCardType = section.metadata?.rightCardType || 'products';
  const rightCardAdImage = getLocalizedField(section, 'rightCardAdImage', locale);
  const rightCardAdLink = section.metadata?.rightCardAdLink || '#';

  const centerCardType = section.metadata?.centerCardType || 'products';
  const centerCardAdImage = getLocalizedField(section, 'centerCardAdImage', locale);
  const centerCardAdLink = section.metadata?.centerCardAdLink || '#';

  const leftCardType = section.metadata?.leftCardType || 'products';
  const leftCardAdImage = getLocalizedField(section, 'leftCardAdImage', locale);
  const leftCardAdLink = section.metadata?.leftCardAdLink || '#';

  const customText1 = getLocalizedField(section, 'customText1', locale)
    || (locale === 'ar' ? (globalT('homepage.noonItMore') || 'نزلنا الأسعار وتوفر أكثر! تسوق من تشكيلة واسعة') : 'Shop more & save on what you love');
    
  const customText2 = getLocalizedField(section, 'customText2', locale)
    || (locale === 'ar' ? (globalT('homepage.onSale') || 'تنزيلات كبرى') : 'Hot Deals');

  const sectionBadge = getLocalizedField(section, 'badge', locale);

  return (
    <section className="container-platform py-6 font-cairo">
      {sectionBadge && (
        <div className="flex justify-center mb-4">
          <Badge className="bg-amber-500 text-white text-xs font-bold py-1 px-3 shadow-md border-0">{sectionBadge}</Badge>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5 h-auto xl:h-[460px]">
        {/* Banner Side 1: Yellow/Amber */}
        <div className="w-full xl:w-[260px] flex flex-row xl:flex-col gap-4 shrink-0">
          <div 
            className="flex-1 rounded-[24px] bg-amber-300 flex items-center justify-center text-amber-900 border border-amber-400 overflow-hidden relative group hover:scale-[1.02] transition-transform cursor-pointer"
            onClick={() => router.push(rightCardType === 'ad' ? rightCardAdLink : '#')}
          >
            {rightCardType === 'ad' && rightCardAdImage ? (
              <img src={rightCardAdImage} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="p-4 text-center">
                <h4 className="text-xl font-black uppercase tracking-wider">{customText2}</h4>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {rightCardProducts.slice(0,4).map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl p-1 shadow-sm aspect-square">
                      <img src={(Array.isArray(p.images) ? p.images[0] : p.images) || ''} className="w-full h-full object-cover rounded-lg" alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Mega Offers with Timer */}
        <div className="flex-1 rounded-[24px] bg-white dark:bg-slate-900 border border-border overflow-hidden flex flex-col xl:flex-row">
          <div className="w-full xl:w-[280px] bg-amber-50 dark:bg-slate-950 p-6 flex flex-col justify-center border-b xl:border-b-0 xl:border-e border-border/60">
            <h3 className="text-2xl font-black mb-2 text-slate-800 dark:text-slate-100">{isAr ? section.titleAr || 'عروض ميجا' : section.titleEn || 'Mega Offers'}</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">{customText1}</p>
            {hasCountdown && data?.countdownConfig?.endDate && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  {isAr ? data.countdownConfig.titleAr : data.countdownConfig.titleEn}
                </p>
                <CountdownTimer targetDate={data.countdownConfig.endDate} />
              </div>
            )}
            <Button className="w-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded-xl font-bold">
              {isAr ? 'عرض الكل' : 'View All'}
            </Button>
          </div>
          <div className="flex-1 p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
              {timerProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Banner Side 2: Dark indigo glassmorphism */}
        <div className="w-full xl:w-[260px] flex flex-row xl:flex-col gap-4 shrink-0">
          <div 
            className="flex-1 rounded-[24px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between border border-white/5 shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer" 
            onClick={() => router.push(leftCardType === 'ad' ? leftCardAdLink : '#')}
          >
            {leftCardType === 'ad' && leftCardAdImage ? (
              <>
                <img src={leftCardAdImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/10 hover:bg-black/25 transition-colors" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/5 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                <div className="z-10 p-5 text-start">
                  <Badge className="bg-white/10 text-white border-white/10 text-[8px] font-bold py-0.5 px-2 mb-1.5 select-none">{sectionBadge}</Badge>
                  <h4 className="text-sm font-black leading-snug">{customText2}</h4>
                </div>
                <div className="z-10 flex justify-between items-center p-5 mt-3">
                  <span className="text-[10px] font-black underline text-amber-400">{isAr ? 'تسوق الآن' : 'Shop Now'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
fs.appendFileSync('src/components/storefront/SaadaBlocks.tsx', newComponents);
console.log('Appended section 2');
