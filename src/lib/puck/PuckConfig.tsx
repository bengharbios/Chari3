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
  "1fr 1fr 1fr 1fr": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  "1fr 1fr 1fr 1fr 1fr": "grid-cols-2 md:grid-cols-5",
  "1fr 1fr 1fr 1fr 1fr 1fr": "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  "auto": "grid-cols-1 sm:grid-cols-2 md:grid-cols-auto-fit",
};

// Common fields shared across legacy components
const getCommonFields = (isAr: boolean, activeLanguages: any[] = [{code: 'ar', nameAr: 'العربية'}, {code: 'en', nameAr: 'English'}]) => {
  const fields: any = {};
  
  activeLanguages.forEach(l => {
    const capitalized = l.code.charAt(0).toUpperCase() + l.code.slice(1);
    fields[`title${capitalized}`] = { 
      type: "text", 
      label: isAr ? `العنوان (${l.nameAr || l.code})` : `Title (${l.code})` 
    };
  });

  fields.metadata_paddingTop = { type: "text", label: isAr ? "المسافة العلوية" : "Padding Top", default: "py-6" };
  fields.metadata_paddingBottom = { type: "text", label: isAr ? "المسافة السفلية" : "Padding Bottom", default: "" };
  fields.metadata_backgroundColor = { 
    type: "radio", 
    label: isAr ? "لون الخلفية" : "Background",
    options: [
      { label: isAr ? "شفاف" : "Transparent", value: "transparent" },
      { label: isAr ? "أبيض" : "White", value: "bg-white dark:bg-slate-900" },
      { label: isAr ? "رمادي" : "Gray", value: "bg-slate-50 dark:bg-slate-950" }
    ]
  };
  fields.metadata_isMobileHidden = { type: "radio", options: [{label: "Yes", value: "true"}, {label: "No", value: "false"}], label: isAr ? "إخفاء في الجوال" : "Hidden Mobile" };
  fields.metadata_isDesktopHidden = { type: "radio", options: [{label: "Yes", value: "true"}, {label: "No", value: "false"}], label: isAr ? "إخفاء في الكمبيوتر" : "Hidden Desktop" };
  
  return fields;
};

const constructSection = (props: any) => {
  const metadata: any = { ...props.metadata };
  for (const key in props) {
    if (key.startsWith('metadata_')) {
      const actualKey = key.replace('metadata_', '');
      let val = props[key];
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      metadata[actualKey] = val;
    }
  }
  return { ...props, metadata };
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
        fields: { 
          ...commonFields, 
          limit: { type: "number", label: "Limit" },
          metadata_badgeAr: { type: "text", label: "Badge (Ar)" },
          metadata_badgeEn: { type: "text", label: "Badge (En)" },
          metadata_enableTimer: { type: "radio", options: [{label: "Yes", value: "true"}, {label: "No", value: "false"}], label: "Enable Timer" },
          metadata_timerEndDate: { type: "text", label: "Timer End Date (YYYY-MM-DD)" },
          metadata_rightCategory: { type: "text", label: "Right Card Category ID" },
          metadata_rightStore: { type: "text", label: "Right Card Store ID" },
          metadata_rightSeller: { type: "text", label: "Right Card Seller ID" },
          metadata_customText1Ar: { type: "text", label: "Right Card Text (Ar)" },
          metadata_customText1En: { type: "text", label: "Right Card Text (En)" },
          metadata_subFilter1: { type: "radio", options: [{label: "Smart", value: "smart"}, {label: "Most Sold", value: "most_sold"}, {label: "Highest Rated", value: "highest_rated"}, {label: "Newest", value: "newest"}], label: "Right Card Filter" },
          metadata_centerCategory: { type: "text", label: "Center Card Category ID" },
          metadata_centerStore: { type: "text", label: "Center Card Store ID" },
          metadata_centerSeller: { type: "text", label: "Center Card Seller ID" },
          metadata_customTextCenterAr: { type: "text", label: "Center Card Text (Ar)" },
          metadata_customTextCenterEn: { type: "text", label: "Center Card Text (En)" },
          metadata_subFilterCenter: { type: "radio", options: [{label: "Smart", value: "smart"}, {label: "Most Sold", value: "most_sold"}, {label: "Highest Rated", value: "highest_rated"}, {label: "Newest", value: "newest"}], label: "Center Card Filter" },
          metadata_leftCategory: { type: "text", label: "Left Card Category ID" },
          metadata_leftStore: { type: "text", label: "Left Card Store ID" },
          metadata_leftSeller: { type: "text", label: "Left Card Seller ID" },
          metadata_customText2Ar: { type: "text", label: "Left Card Text (Ar)" },
          metadata_customText2En: { type: "text", label: "Left Card Text (En)" },
          metadata_subFilter2: { type: "radio", options: [{label: "Smart", value: "smart"}, {label: "Most Sold", value: "most_sold"}, {label: "Highest Rated", value: "highest_rated"}, {label: "Newest", value: "newest"}], label: "Left Card Filter" }
        },
        defaultProps: { titleAr: "", titleEn: "", metadata_backgroundColor: "transparent", limit: 8 },
        render: (props: any) => <BentoOffersBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      CategoryProducts: {
        fields: { 
          ...commonFields, 
          categoryId: { type: "text", label: "Category ID" }, 
          storeId: { type: "text", label: "Store ID" },
          sellerId: { type: "text", label: "Seller ID" },
          layoutStyle: { type: "radio", options: [{label: "Carousel", value: "carousel"}, {label: "Grid", value: "grid"}], label: "Layout Style" },
          filterType: { type: "radio", options: [{label: "Smart", value: "smart"}, {label: "Newest", value: "newest"}, {label: "Top Rated", value: "top_rated"}, {label: "Most Sold", value: "most_sold"}, {label: "Highest Rated", value: "highest_rated"}, {label: "Has Coupons", value: "has_coupons"}], label: "Filter Type" },
          limit: { type: "number", label: "Limit" }
        },
        defaultProps: { titleAr: "أفضل الإلكترونيات", titleEn: "Top Electronics", categoryId: "", layoutStyle: "carousel", filterType: "newest", limit: 10, metadata_backgroundColor: "transparent" },
        render: (props: any) => <CategoryProductsRowBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      FeaturedProducts: {
        fields: { 
          ...commonFields, 
          categoryId: { type: "text", label: "Category ID" },
          storeId: { type: "text", label: "Store ID" },
          sellerId: { type: "text", label: "Seller ID" },
          filterType: { type: "radio", options: [{label: "Smart", value: "smart"}, {label: "Newest", value: "newest"}, {label: "Most Sold", value: "most_sold"}, {label: "Most Viewed", value: "most_viewed"}], label: "Filter Type" },
          limit: { type: "number", label: "Limit" },
          metadata_badgeAr: { type: "text", label: "Badge (Ar)" },
          metadata_badgeEn: { type: "text", label: "Badge (En)" }
        },
        defaultProps: { titleAr: "منتجات مميزة", titleEn: "Featured Products", limit: 10, filterType: "smart", metadata_backgroundColor: "transparent" },
        render: (props: any) => <FeaturedProductsGridBlock section={constructSection(props)} data={storeData} locale={locale} />
      },
      TopSellers: {
        fields: { 
          ...commonFields, 
          limit: { type: "number", label: "Limit" },
          metadata_badgeAr: { type: "text", label: "Badge (Ar)" },
          metadata_badgeEn: { type: "text", label: "Badge (En)" }
        },
        defaultProps: { titleAr: "أفضل البائعين", titleEn: "Top Sellers", limit: 8, metadata_backgroundColor: "transparent" },
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
        fields: { 
          padding: { type: "text", label: "Padding (Y)" }, 
          bgColor: { type: "radio", options: [{label: "Transparent", value: "bg-transparent"}, {label: "White", value: "bg-white dark:bg-slate-900"}, {label: "Gray", value: "bg-slate-50 dark:bg-slate-950"}], label: "Background" },
          borderRadius: { type: "radio", options: [{label: "None", value: "rounded-none"}, {label: "Medium", value: "rounded-md"}, {label: "Large", value: "rounded-xl"}, {label: "2XL", value: "rounded-2xl"}], label: "Border Radius" },
          shadow: { type: "radio", options: [{label: "None", value: "shadow-none"}, {label: "Small", value: "shadow-sm"}, {label: "Medium", value: "shadow-md"}, {label: "Large", value: "shadow-lg"}], label: "Shadow" }
        },
        defaultProps: { padding: "py-8", bgColor: "bg-transparent", borderRadius: "rounded-none", shadow: "shadow-none" },
        render: ({ padding, bgColor, borderRadius, shadow, puck: { renderDropZone } }: any) => (
          <div className={`w-full ${padding} ${bgColor} ${borderRadius} ${shadow}`}>
            <div className="container-platform">{renderDropZone({ zone: "content" })}</div>
          </div>
        )
      },
      Columns: {
        fields: { 
          distribution: { 
            type: "radio", 
            options: [
              { value: "1fr", label: "1 Col" },
              { value: "1fr 1fr", label: "2 Cols" },
              { value: "1fr 1fr 1fr", label: "3 Cols" },
              { value: "1fr 1fr 1fr 1fr", label: "4 Cols" },
              { value: "1fr 1fr 1fr 1fr 1fr", label: "5 Cols" },
              { value: "1fr 1fr 1fr 1fr 1fr 1fr", label: "6 Cols" },
              { value: "auto", label: "Auto Fit" },
            ]
          },
          gap: { 
            type: "radio", 
            options: [
              { value: "gap-0", label: "None" },
              { value: "gap-2", label: "Small" },
              { value: "gap-4", label: "Medium" },
              { value: "gap-6", label: "Large" },
              { value: "gap-8", label: "X-Large" }
            ],
            label: "Gap Size"
          },
          alignItems: {
            type: "radio",
            options: [{label: "Start", value: "items-start"}, {label: "Center", value: "items-center"}, {label: "Stretch", value: "items-stretch"}],
            label: "Align Items"
          }
        },
        defaultProps: { distribution: "1fr 1fr", gap: "gap-4", alignItems: "items-start" },
        render: ({ distribution, gap, alignItems, puck: { renderDropZone } }: any) => (
          <div className={`grid ${distributionToClass[distribution] || "grid-cols-1"} ${gap} ${alignItems}`}>
            {distribution.split(" ").map((_: any, idx: number) => (
              <div key={idx}>{renderDropZone({ zone: `col-${idx}` })}</div>
            ))}
            {distribution === "auto" && (
               <div key="auto">{renderDropZone({ zone: `col-auto` })}</div>
            )}
          </div>
        )
      }
    }
  };
};
