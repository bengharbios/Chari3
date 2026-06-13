'use client';

import React from 'react';
import { 
  FeaturesBlock,
  CategoryCirclesRowBlock,
  HeroSliderBlock,
  BentoOffersBlock,
  CategoryProductsRowBlock,
  FeaturedProductsGridBlock,
  TopSellersBlock,
  TestimonialsBlock,
  CtaBlock,
  CustomBannerBlock
} from '@/components/storefront/SaadaBlocks';

if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const distributionToClass: Record<string, string> = {
  "1fr": "grid-cols-1",
  "1fr 1fr": "grid-cols-1 md:grid-cols-2",
  "1fr 1fr 1fr": "grid-cols-1 md:grid-cols-3",
};

// Common fields shared across legacy components
const getCommonFields = (isAr: boolean) => ({
  titleAr: { type: "text", label: isAr ? "العنوان (عربي)" : "Title (Ar)" },
  titleEn: { type: "text", label: isAr ? "العنوان (إنجليزي)" : "Title (En)" },
  metadata_paddingTop: { type: "text", label: isAr ? "المسافة العلوية (Tailwind Classes)" : "Padding Top", default: "py-6" },
  metadata_paddingBottom: { type: "text", label: isAr ? "المسافة السفلية" : "Padding Bottom", default: "" },
  metadata_backgroundColor: { 
    type: "radio", 
    label: isAr ? "لون الخلفية" : "Background",
    options: [
      { label: isAr ? "شفاف" : "Transparent", value: "transparent" },
      { label: isAr ? "أبيض" : "White", value: "bg-white dark:bg-slate-900" },
      { label: isAr ? "رمادي" : "Gray", value: "bg-slate-50 dark:bg-slate-950" }
    ]
  },
  metadata_isMobileHidden: { type: "radio", options: [{label: "Yes", value: "true"}, {label: "No", value: "false"}], label: isAr ? "إخفاء في الجوال" : "Hidden Mobile" },
  metadata_isDesktopHidden: { type: "radio", options: [{label: "Yes", value: "true"}, {label: "No", value: "false"}], label: isAr ? "إخفاء في الكمبيوتر" : "Hidden Desktop" },
});

// Helper to construct section object from Puck props to match legacy section format
const constructSection = (props: any) => {
  return {
    ...props,
    metadata: {
      ...props.metadata,
      paddingTop: props.metadata_paddingTop,
      paddingBottom: props.metadata_paddingBottom,
      backgroundColor: props.metadata_backgroundColor,
      isMobileHidden: props.metadata_isMobileHidden === 'true',
      isDesktopHidden: props.metadata_isDesktopHidden === 'true',
    }
  };
};

export const getSaadaConfig = (locale: string, storeData: any = {}) => {
  const isAr = locale === 'ar';
  const commonFields = getCommonFields(isAr);
  
  return {
    categories: {
      legacy: { title: isAr ? 'أقسام الصفحة الرئيسية الأصلية' : 'Legacy Homepage Sections', components: ['HeroSlider', 'Features', 'CategoryCircles', 'BentoOffers', 'CategoryProducts', 'FeaturedProducts', 'TopSellers', 'Testimonials', 'CTA', 'CustomBanner'] },
      layout: { title: isAr ? 'تخطيط الصفحة (Layout)' : 'Layout', components: ['Columns', 'PaddingWrapper'] },
    },
    components: {
      // Legacy Mapped Blocks
      HeroSlider: {
        fields: { ...commonFields },
        defaultProps: { titleAr: "", titleEn: "", metadata_backgroundColor: "transparent" },
        render: (props: any) => <HeroSliderBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      Features: {
        fields: { ...commonFields },
        defaultProps: { titleAr: "", titleEn: "", metadata_backgroundColor: "transparent" },
        render: (props: any) => <FeaturesBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      CategoryCircles: {
        fields: { ...commonFields, categoryId: { type: "text", label: isAr ? "معرف القسم" : "Category ID" } },
        defaultProps: { titleAr: "تصنيفات", titleEn: "Categories", metadata_backgroundColor: "transparent", categoryId: "" },
        render: (props: any) => <CategoryCirclesRowBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      BentoOffers: {
        fields: { ...commonFields, badge: { type: "text" }, limit: { type: "number" } },
        defaultProps: { titleAr: "", titleEn: "", metadata_backgroundColor: "transparent", limit: 8 },
        render: (props: any) => <BentoOffersBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      CategoryProducts: {
        fields: { 
          ...commonFields, 
          categoryId: { type: "text" }, 
          layoutStyle: { type: "radio", options: [{label: "Carousel", value: "carousel"}, {label: "Grid", value: "grid"}] },
          filterType: { type: "radio", options: [{label: "Newest", value: "newest"}, {label: "Top", value: "top_rated"}] }
        },
        defaultProps: { titleAr: "أفضل الإلكترونيات", titleEn: "Top Electronics", categoryId: "", layoutStyle: "carousel", filterType: "newest", metadata_backgroundColor: "transparent" },
        render: (props: any) => <CategoryProductsRowBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      FeaturedProducts: {
        fields: { ...commonFields, limit: { type: "number" } },
        defaultProps: { titleAr: "منتجات مميزة", titleEn: "Featured Products", limit: 10, metadata_backgroundColor: "transparent" },
        render: (props: any) => <FeaturedProductsGridBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      TopSellers: {
        fields: { ...commonFields, limit: { type: "number" }, badge: { type: "text" } },
        defaultProps: { titleAr: "أفضل التجار", titleEn: "Top Sellers", limit: 8, metadata_backgroundColor: "transparent" },
        render: (props: any) => <TopSellersBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      Testimonials: {
        fields: { ...commonFields },
        defaultProps: { titleAr: "آراء العملاء", titleEn: "Testimonials", metadata_backgroundColor: "transparent" },
        render: (props: any) => <TestimonialsBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      CTA: {
        fields: { ...commonFields },
        defaultProps: { titleAr: "سجل كتاجر", titleEn: "Register as Seller", metadata_backgroundColor: "transparent" },
        render: (props: any) => <CtaBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      CustomBanner: {
        fields: { ...commonFields, imageArUrl: { type: "text" }, imageEnUrl: { type: "text" }, linkUrl: { type: "text" } },
        defaultProps: { titleAr: "", titleEn: "", imageArUrl: "", imageEnUrl: "", linkUrl: "", metadata_backgroundColor: "transparent" },
        render: (props: any) => <CustomBannerBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      // Layout Wrappers
      PaddingWrapper: {
        fields: { padding: { type: "text" }, bgColor: { type: "text" } },
        defaultProps: { padding: "py-8", bgColor: "bg-transparent" },
        render: ({ padding, bgColor, puck: { renderDropZone } }: any) => (
          <div className={`w-full ${padding} ${bgColor}`}>
            <div className="container-platform">{renderDropZone({ zone: "content" })}</div>
          </div>
        )
      },
      Columns: {
        fields: { distribution: { type: "text" }, gap: { type: "text" } },
        defaultProps: { distribution: "1fr 1fr", gap: "gap-4" },
        render: ({ distribution, gap, puck: { renderDropZone } }: any) => {
          const gridClass = distributionToClass[distribution] || "grid-cols-1";
          return (
            <div className={`w-full grid ${gridClass} ${gap} my-4`}>
              {distribution.split(" ").map((_: any, i: number) => (
                <div key={i} className="min-h-[120px] rounded-lg p-2 bg-slate-50/50 outline-dashed outline-2 outline-transparent hover:outline-slate-200 transition-all">
                  {renderDropZone({ zone: `column-${i}` })}
                </div>
              ))}
            </div>
          );
        },
      },
    },
  };
};
