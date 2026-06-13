'use client';

import React from 'react';
import { 
  DynamicProductGrid, 
  DynamicCategoryCircles,
  FeaturesBlock,
  TopSellersBlock,
  CountdownPromoBlock,
  BentoPromoGridBlock,
  TestimonialsBlock
} from '@/components/storefront/SaadaBlocks';

// Prevent Next.js tree-shaking from removing React which is needed by Puck internally
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const distributionToClass: Record<string, string> = {
  "1fr": "grid-cols-1",
  "1fr 1fr": "grid-cols-1 md:grid-cols-2",
  "1fr 1fr 1fr": "grid-cols-1 md:grid-cols-3",
  "1fr 3fr": "grid-cols-1 md:grid-cols-4 [&>*:first-child]:md:col-span-1 [&>*:last-child]:md:col-span-3",
  "3fr 1fr": "grid-cols-1 md:grid-cols-4 [&>*:first-child]:md:col-span-3 [&>*:last-child]:md:col-span-1",
};

export const getSaadaConfig = (locale: string) => {
  const isAr = locale === 'ar';
  
  return {
    categories: {
      layout: { title: isAr ? 'تخطيط الصفحة (Layout)' : 'Layout', components: ['Columns', 'PaddingWrapper'] },
      content: { title: isAr ? 'المحتوى (Content)' : 'Content', components: ['HeroSlider', 'Heading', 'Text', 'CustomBanner', 'FeaturesBlock', 'BentoPromoGridBlock', 'TestimonialsBlock', 'CountdownPromoBlock'] },
      dynamic: { title: isAr ? 'أقسام المتجر الديناميكية' : 'Dynamic Store Sections', components: ['DynamicProductGrid', 'DynamicCategoryCircles', 'TopSellersBlock'] },
    },
    components: {
      PaddingWrapper: {
        fields: {
          padding: {
            type: "radio",
            options: [
              { label: isAr ? "صغير (Small)" : "Small", value: "py-4" },
              { label: isAr ? "متوسط (Medium)" : "Medium", value: "py-8" },
              { label: isAr ? "كبير (Large)" : "Large", value: "py-16" },
            ]
          },
          bgColor: {
            type: "radio",
            options: [
              { label: isAr ? "شفاف (Transparent)" : "Transparent", value: "bg-transparent" },
              { label: isAr ? "أبيض (White)" : "White", value: "bg-white dark:bg-slate-950" },
              { label: isAr ? "رمادي (Gray)" : "Gray", value: "bg-slate-50 dark:bg-slate-900" },
            ]
          }
        },
        defaultProps: { padding: "py-8", bgColor: "bg-transparent" },
        render: ({ padding, bgColor, puck: { renderDropZone } }: any) => (
          <div className={`w-full ${padding} ${bgColor}`}>
            <div className="container-platform">{renderDropZone({ zone: "content" })}</div>
          </div>
        )
      },
      Columns: {
        fields: {
          distribution: {
            type: "radio",
            options: [
              { label: isAr ? "عمود واحد" : "1 Column", value: "1fr" },
              { label: isAr ? "عمودين متساويين" : "2 Columns", value: "1fr 1fr" },
              { label: isAr ? "3 أعمدة متساوية" : "3 Columns", value: "1fr 1fr 1fr" },
              { label: isAr ? "ربع + ثلاثة أرباع" : "1/4 + 3/4", value: "1fr 3fr" },
              { label: isAr ? "ثلاثة أرباع + ربع" : "3/4 + 1/4", value: "3fr 1fr" },
            ],
          },
          gap: {
            type: "radio",
            options: [
              { label: isAr ? "صغير" : "Small", value: "gap-2" },
              { label: isAr ? "متوسط" : "Medium", value: "gap-4" },
              { label: isAr ? "كبير" : "Large", value: "gap-8" },
            ]
          }
        },
        defaultProps: { distribution: "1fr 1fr", gap: "gap-4" },
        render: ({ distribution, gap, puck: { renderDropZone } }: any) => {
          const gridClass = distributionToClass[distribution] || "grid-cols-1";
          return (
            <div className={`w-full grid ${gridClass} ${gap} my-4`}>
              {distribution.split(" ").map((_: any, i: number) => (
                <div key={i} className="min-h-[120px] rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/20 outline-dashed outline-2 outline-transparent hover:outline-slate-200 transition-all">
                  {renderDropZone({ zone: `column-${i}` })}
                </div>
              ))}
            </div>
          );
        },
      },
      HeroSlider: {
        fields: {
          title: { type: "text" },
          subtitle: { type: "text" },
          imageUrl: { type: "text" },
          ctaText: { type: "text" },
          ctaLink: { type: "text" },
          alignment: {
            type: "radio",
            options: [
              { label: isAr ? "يمين (Right)" : "Right", value: "text-right items-end" },
              { label: isAr ? "وسط (Center)" : "Center", value: "text-center items-center" },
              { label: isAr ? "يسار (Left)" : "Left", value: "text-left items-start" },
            ]
          },
          bgOverlay: {
            type: "radio",
            options: [
              { label: isAr ? "فاتح" : "Light", value: "bg-black/20" },
              { label: isAr ? "متوسط" : "Medium", value: "bg-black/40" },
              { label: isAr ? "غامق" : "Dark", value: "bg-black/60" },
            ]
          }
        },
        defaultProps: {
          title: isAr ? "اكتشف تشكيلتنا الجديدة" : "Discover our new collection",
          subtitle: isAr ? "أفضل المنتجات بأسعار لا تقاوم" : "Best products at irresistible prices",
          imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000",
          ctaText: isAr ? "تسوق الآن" : "Shop Now",
          ctaLink: "/store",
          alignment: "text-center items-center",
          bgOverlay: "bg-black/40"
        },
        render: ({ title, subtitle, imageUrl, ctaText, ctaLink, alignment, bgOverlay }: any) => (
          <div className="relative w-full h-[400px] md:h-[500px] rounded-[24px] overflow-hidden my-4 group">
            <div className="absolute inset-0">
              <img src={imageUrl} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 ${bgOverlay}`} />
            </div>
            <div className={`relative h-full flex flex-col justify-center px-8 md:px-16 ${alignment}`}>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-md font-cairo">
                {title}
              </h1>
              <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow">
                {subtitle}
              </p>
              {ctaText && (
                <a href={ctaLink}>
                  <button className="text-lg px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:shadow-2xl transition-all font-bold">
                    {ctaText}
                  </button>
                </a>
              )}
            </div>
          </div>
        )
      },
      Heading: {
        fields: {
          title: { type: "text" },
          alignment: {
            type: "radio",
            options: [
              { label: isAr ? "يمين (Right)" : "Right", value: "text-right" },
              { label: isAr ? "وسط (Center)" : "Center", value: "text-center" },
              { label: isAr ? "يسار (Left)" : "Left", value: "text-left" },
            ]
          },
          size: {
            type: "radio",
            options: [
              { label: "H3", value: "text-2xl" },
              { label: "H2", value: "text-3xl md:text-4xl" },
              { label: "H1", value: "text-4xl md:text-5xl" },
            ]
          }
        },
        defaultProps: { title: isAr ? "عنوان القسم" : "Section Title", alignment: "text-right", size: "text-3xl md:text-4xl" },
        render: ({ title, alignment, size }: any) => (
          <h2 className={`${size} font-black text-slate-800 dark:text-white ${alignment} my-6 font-cairo`}>{title}</h2>
        ),
      },
      CustomBanner: {
        fields: { imageUrl: { type: "text" }, link: { type: "text" } },
        defaultProps: { imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200", link: "#" },
        render: ({ imageUrl, link }: any) => (
          <a href={link} className="block w-full rounded-[20px] overflow-hidden my-4 hover:opacity-90 transition shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800">
            <img src={imageUrl} alt="banner" className="w-full h-auto object-cover max-h-[300px]" />
          </a>
        )
      },
      Text: {
        fields: { content: { type: "textarea" } },
        defaultProps: { content: isAr ? "أدخل النص هنا..." : "Enter text here..." },
        render: ({ content }: any) => (
          <div className="prose dark:prose-invert max-w-none my-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{content}</div>
        ),
      },
      DynamicProductGrid: {
        fields: {
          title: { type: "text" },
          categoryId: { type: "text" },
          filterType: {
            type: "radio",
            options: [
              { label: isAr ? "الأحدث" : "Newest", value: "newest" },
              { label: isAr ? "الأكثر مبيعاً" : "Most Sold", value: "most_sold" },
              { label: isAr ? "الأعلى تقييماً" : "Highest Rated", value: "highest_rated" },
            ]
          },
          layoutStyle: {
            type: "radio",
            options: [
              { label: isAr ? "شريط تمرير (Carousel)" : "Carousel", value: "carousel" },
              { label: isAr ? "شبكة (Grid)" : "Grid", value: "grid" },
            ]
          },
          limit: { type: "number" }
        },
        defaultProps: { title: isAr ? "المنتجات المميزة" : "Featured Products", categoryId: "all", filterType: "newest", layoutStyle: "carousel", limit: 10 },
        render: (props: any) => <DynamicProductGrid {...props} />
      },
      DynamicCategoryCircles: {
        fields: { title: { type: "text" }, parentId: { type: "text" } },
        defaultProps: { title: isAr ? "التصنيفات الشائعة" : "Popular Categories", parentId: "main" },
        render: (props: any) => <DynamicCategoryCircles {...props} />
      },
      FeaturesBlock: {
        fields: {
          features: {
            type: "array",
            arrayFields: {
              title: { type: "text" },
              desc: { type: "text" },
              icon: { type: "text" }
            }
          }
        },
        defaultProps: {
          features: [
            { title: isAr ? "شحن سريع" : "Fast Shipping", desc: isAr ? "توصيل في نفس اليوم" : "Same day delivery", icon: "🚀" },
            { title: isAr ? "دفع آمن" : "Secure Payment", desc: isAr ? "طرق دفع متعددة" : "Multiple payment methods", icon: "🔒" },
          ]
        },
        render: (props: any) => <FeaturesBlock {...props} />
      },
      TopSellersBlock: {
        fields: {
          title: { type: "text" },
          limit: { type: "number" }
        },
        defaultProps: { title: isAr ? "أفضل المتاجر والتجار" : "Top Sellers", limit: 5 },
        render: (props: any) => <TopSellersBlock {...props} />
      },
      CountdownPromoBlock: {
        fields: {
          title: { type: "text" },
          subtitle: { type: "text" },
          targetDate: { type: "text", placeholder: "YYYY-MM-DDTHH:mm:ss" },
          bgOverlay: {
            type: "radio",
            options: [
              { label: isAr ? "أحمر" : "Red", value: "bg-rose-600" },
              { label: isAr ? "أسود" : "Black", value: "bg-slate-900" },
              { label: isAr ? "برتقالي" : "Orange", value: "bg-amber-600" },
            ]
          },
          imageUrl: { type: "text" }
        },
        defaultProps: {
          title: isAr ? "عروض كبرى" : "Mega Sale",
          subtitle: isAr ? "عروض حصرية تنتهي قريباً، تسوق الآن!" : "Exclusive offers ending soon, shop now!",
          targetDate: "2026-12-31T23:59:59",
          bgOverlay: "bg-rose-600",
          imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200"
        },
        render: (props: any) => <CountdownPromoBlock {...props} />
      },
      BentoPromoGridBlock: {
        fields: {
          badge: { type: "text" },
          title1: { type: "text" }, link1: { type: "text" }, image1: { type: "text" },
          title2: { type: "text" }, link2: { type: "text" }, image2: { type: "text" },
          title3: { type: "text" }, link3: { type: "text" }, image3: { type: "text" }
        },
        defaultProps: {
          badge: isAr ? "عروض حصرية" : "Exclusive Offers",
          title1: isAr ? "تخفيضات 50%" : "50% Off", link1: "/store", image1: "",
          title2: isAr ? "أجهزة ذكية" : "Smart Devices", link2: "/store", image2: "",
          title3: isAr ? "أزياء الموسم" : "Season Fashion", link3: "/store", image3: ""
        },
        render: (props: any) => <BentoPromoGridBlock {...props} />
      },
      TestimonialsBlock: {
        fields: {
          title: { type: "text" },
          testimonials: {
            type: "array",
            arrayFields: {
              content: { type: "textarea" },
              author: { type: "text" },
              rating: { type: "number" }
            }
          }
        },
        defaultProps: {
          title: isAr ? "آراء عملائنا" : "Customer Reviews",
          testimonials: [
            { content: isAr ? "خدمة ممتازة وتوصيل سريع جداً" : "Excellent service and fast delivery", author: "أحمد المصلح", rating: 5 },
            { content: isAr ? "المنتجات أصلية والأسعار منافسة" : "Original products and competitive prices", author: "سارة محمد", rating: 5 }
          ]
        },
        render: (props: any) => <TestimonialsBlock {...props} />
      }
    },
  };
};

export const saadaConfig = getSaadaConfig('ar');
