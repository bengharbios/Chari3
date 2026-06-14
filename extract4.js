const fs = require('fs');

let newComponents = `
export function CategoryProductsRowBlock({ section, data, locale, categoryId, storeId, sellerId, filterType, layoutStyle }: any) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  
  // Logic to fetch and show products based on props, fallback to data.featuredProducts
  const products = data?.featuredProducts || [];
  
  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.slice(0, section.limit || 10).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedProductsGridBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const products = data?.featuredProducts || [];
  
  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.slice(0, section.limit || 10).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function TopSellersBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const stores = (data?.topStores || []).slice(0, section.limit || 8);
  const sellers = (data?.topSellers || []).slice(0, section.limit || 8);
  const [activeTab, setActiveTab] = useState<'stores'|'sellers'>('stores');
  
  const getLocalizedField = (s: any, field: string, l: string) => {
    if (!s?.metadata) return null;
    return s.metadata[\`\${field}\${l === 'ar' ? 'Ar' : 'En'}\`] || s.metadata[field];
  };

  return (
    <section className="bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950 text-white py-16 mt-12 relative overflow-hidden border-y border-white/5">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
      </div>
      <div className="container-platform relative z-10">
        <div className="text-center mb-10 px-4 max-w-2xl mx-auto">
          <Badge className="mb-3.5 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs px-3.5 py-1.5 rounded-full select-none">
            {getLocalizedField(section, 'badge', locale) || t('أفضل المتاجر', 'Top Stores')}
          </Badge>
          <h3 className="text-2xl md:text-4xl font-black mb-3.5 leading-tight tracking-tight font-cairo">
            {getLocalizedField(section, 'title', locale) || t('تسوق من شركائنا', 'Shop from Partners')}
          </h3>
          <div className="inline-flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-8 gap-1.5 font-cairo select-none">
            <button
              onClick={() => setActiveTab('stores')}
              className={\`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all \${
                activeTab === 'stores' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
              }\`}
            >
              🏢 {t('المتاجر', 'Stores')}
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={\`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all \${
                activeTab === 'sellers' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
              }\`}
            >
              👤 {t('التجار', 'Sellers')}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 font-cairo">
          {(activeTab === 'stores' ? stores : sellers).map((item: any) => (
            <Link key={item.id} href={\`/\${activeTab === 'stores' ? 'store' : 'seller'}/\${item.slug}\`} className="group block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1 h-full flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-500 p-0.5 mb-3">
                  <img src={item.logo || item.image || ''} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{item.name || item.storeName}</h4>
                <div className="flex items-center gap-1.5 mb-2 bg-black/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold">{item.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const testimonials = data?.testimonials?.length > 0 ? data.testimonials : DEFAULT_TESTIMONIALS;
  
  return (
    <section className="container-platform py-12">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((item: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-border/80 rounded-2xl p-6 shadow-sm">
            <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
            <p className="text-sm font-medium mb-6 text-slate-700 dark:text-slate-300">
              {isAr ? item.text : item.textEn || item.text}
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold">
                {(isAr ? item.name : item.nameEn || item.name).charAt(0)}
              </div>
              <div>
                <h5 className="font-bold text-sm">{isAr ? item.name : item.nameEn || item.name}</h5>
                <StarRating rating={item.rating || 5} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  
  return (
    <section className="container-platform py-8">
      <div className="bg-amber-500 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-slate-950 md:w-2/3">
          <h3 className="text-3xl md:text-4xl font-black mb-4">{isAr ? section.titleAr || 'ابدأ البيع الآن!' : section.titleEn || 'Start Selling Now!'}</h3>
          <p className="text-sm md:text-base font-medium opacity-80 max-w-xl">
            {t('انضم إلى آلاف البائعين', 'Join thousands of sellers')}
          </p>
        </div>
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
          <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-800 rounded-xl w-full md:w-auto">
            {t('سجل الآن', 'Register Now')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CustomBannerBlock({ section, data, locale }: SectionProps) {
  const isAr = locale === 'ar';
  const imgUrl = isAr ? section.imageArUrl : (section.imageEnUrl || section.imageArUrl);
  if (!imgUrl) return null;
  
  return (
    <section className="container-platform py-4">
      <Link href={section.linkUrl || '#'} className="block rounded-2xl overflow-hidden group">
        <img src={imgUrl} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" alt="" />
      </Link>
    </section>
  );
}
`;

fs.appendFileSync('src/components/storefront/SaadaBlocks.tsx', newComponents);
console.log('Appended final components');
