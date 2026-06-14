const fs = require('fs');
const homepageCode = fs.readFileSync('src/components/storefront/HomepagePage.tsx', 'utf8');

// I will extract the renderSection function body from HomepagePage.tsx and write components inside SaadaBlocks.tsx
const switchStart = homepageCode.indexOf('switch (section.type) {');
const switchEnd = homepageCode.indexOf('default:', switchStart);
const switchBody = homepageCode.substring(switchStart, switchEnd);

let newComponents = `

// --- EXTRACTED COMPONENTS --- //

export function HeroSliderBlock({ section, data, locale }: SectionProps) {
  const isAr = locale === 'ar';
  const rawSlides = data?.heroSlides ?? [];
  const validSlides = Array.isArray(rawSlides)
    ? rawSlides.filter((s: any) => s && typeof s === 'object' && (s.title || s.titleEn))
    : [];
  const currentHeroSlides = validSlides.length > 0 ? validSlides : DEFAULT_HERO_SLIDES;
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!currentHeroSlides.length) return;
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % currentHeroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [currentHeroSlides]);

  if (currentHeroSlides.length === 0) return null;
  const slide = currentHeroSlides[heroIndex];
  
  return (
    <section className="container-platform py-6 overflow-hidden relative font-cairo">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden group shadow-2xl">
        <div className={\`absolute inset-0 bg-gradient-to-br \${slide.bg || 'from-slate-900 to-indigo-950'} opacity-100 transition-colors duration-1000\`} />
        {slide.image && (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 md:w-2/3">
          <Badge className="w-fit mb-6 bg-white/10 text-white hover:bg-white/20 border-white/20 px-4 py-1.5 text-xs md:text-sm shadow-xl backdrop-blur-md">
            {locale === 'ar' ? slide.badge : (slide.badgeFr || slide.badgeEn || slide.badge)}
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg tracking-tight">
            {locale === 'ar' ? slide.title : (slide.titleFr || slide.titleEn || slide.title)}
          </h2>
          <p className="text-base md:text-2xl text-slate-200 mb-10 max-w-xl font-medium leading-relaxed drop-shadow">
            {locale === 'ar' ? slide.subtitle : (slide.subtitleFr || slide.subtitleEn || slide.subtitle)}
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-1 text-base">
              {locale === 'ar' ? slide.cta : (slide.ctaFr || slide.ctaEn || slide.cta)}
              <ArrowLeft className="ml-2 size-5 rtl:hidden" />
              <ArrowRight className="mr-2 size-5 ltr:hidden" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {currentHeroSlides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={\`h-1.5 rounded-full transition-all duration-500 \${idx === heroIndex ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'}\`}
              aria-label={\`Go to slide \${idx + 1}\`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesBlock({ section, data, locale }: SectionProps) {
  return (
    <section className="container-platform py-2">
      <div className="bg-white/50 dark:bg-slate-900/50 border border-border/80 rounded-[24px] backdrop-blur-md p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                <f.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{locale === 'ar' ? f.title : locale === 'fr' ? (f.titleFr || f.titleEn || f.title) : (f.titleEn || f.title)}</p>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">{locale === 'ar' ? f.desc : locale === 'fr' ? (f.descFr || f.descEn || f.desc) : (f.descEn || f.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

// Read the previously created SaadaBlocks.tsx and append to it
fs.appendFileSync('src/components/storefront/SaadaBlocks.tsx', newComponents);
console.log('Appended first components');
