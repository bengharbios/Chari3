'use client';

import React from 'react';
import { DynamicProductGrid, DynamicCategoryCircles } from '@/components/storefront/SaadaBlocks';

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

export const saadaConfig = {
  categories: {
    layout: { title: 'تخطيط الصفحة (Layout)', components: ['Columns', 'PaddingWrapper'] },
    content: { title: 'المحتوى (Content)', components: ['HeroSlider', 'Heading', 'Text', 'CustomBanner'] },
    dynamic: { title: 'أقسام المتجر الديناميكية', components: ['DynamicProductGrid', 'DynamicCategoryCircles'] },
  },
  components: {
    PaddingWrapper: {
      fields: {
        padding: {
          type: "radio",
          options: [
            { label: "صغير (Small)", value: "py-4" },
            { label: "متوسط (Medium)", value: "py-8" },
            { label: "كبير (Large)", value: "py-16" },
          ]
        },
        bgColor: {
          type: "radio",
          options: [
            { label: "شفاف (Transparent)", value: "bg-transparent" },
            { label: "أبيض (White)", value: "bg-white dark:bg-slate-950" },
            { label: "رمادي (Gray)", value: "bg-slate-50 dark:bg-slate-900" },
          ]
        }
      },
      defaultProps: {
        padding: "py-8",
        bgColor: "bg-transparent"
      },
      render: ({ padding, bgColor, puck: { renderDropZone } }: any) => {
        return (
          <div className={`w-full ${padding} ${bgColor}`}>
            <div className="container-platform">
              {renderDropZone({ zone: "content" })}
            </div>
          </div>
        );
      }
    },
    Columns: {
      fields: {
        distribution: {
          type: "radio",
          options: [
            { label: "عمود واحد", value: "1fr" },
            { label: "عمودين متساويين", value: "1fr 1fr" },
            { label: "3 أعمدة متساوية", value: "1fr 1fr 1fr" },
            { label: "ربع + ثلاثة أرباع", value: "1fr 3fr" },
            { label: "ثلاثة أرباع + ربع", value: "3fr 1fr" },
          ],
        },
        gap: {
          type: "radio",
          options: [
            { label: "صغير", value: "gap-2" },
            { label: "متوسط", value: "gap-4" },
            { label: "كبير", value: "gap-8" },
          ]
        }
      },
      defaultProps: {
        distribution: "1fr 1fr",
        gap: "gap-4"
      },
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
            { label: "يمين (Right)", value: "text-right items-end" },
            { label: "وسط (Center)", value: "text-center items-center" },
            { label: "يسار (Left)", value: "text-left items-start" },
          ]
        },
        bgOverlay: {
          type: "radio",
          options: [
            { label: "فاتح", value: "bg-black/20" },
            { label: "متوسط", value: "bg-black/40" },
            { label: "غامق", value: "bg-black/60" },
          ]
        }
      },
      defaultProps: {
        title: "اكتشف تشكيلتنا الجديدة",
        subtitle: "أفضل المنتجات بأسعار لا تقاوم",
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000",
        ctaText: "تسوق الآن",
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
            { label: "يمين (Right)", value: "text-right" },
            { label: "وسط (Center)", value: "text-center" },
            { label: "يسار (Left)", value: "text-left" },
          ]
        },
        size: {
          type: "radio",
          options: [
            { label: "صغير (H3)", value: "text-2xl" },
            { label: "متوسط (H2)", value: "text-3xl md:text-4xl" },
            { label: "كبير (H1)", value: "text-4xl md:text-5xl" },
          ]
        }
      },
      defaultProps: {
        title: "عنوان القسم",
        alignment: "text-right",
        size: "text-3xl md:text-4xl"
      },
      render: ({ title, alignment, size }: any) => (
        <h2 className={`${size} font-black text-slate-800 dark:text-white ${alignment} my-6 font-cairo`}>
          {title}
        </h2>
      ),
    },
    CustomBanner: {
      fields: {
        imageUrl: { type: "text" },
        link: { type: "text" },
      },
      defaultProps: {
        imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200",
        link: "#"
      },
      render: ({ imageUrl, link }: any) => (
        <a href={link} className="block w-full rounded-[20px] overflow-hidden my-4 hover:opacity-90 transition shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800">
          <img src={imageUrl} alt="banner" className="w-full h-auto object-cover max-h-[300px]" />
        </a>
      )
    },
    Text: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: {
        content: "أدخل النص هنا...",
      },
      render: ({ content }: any) => (
        <div className="prose dark:prose-invert max-w-none my-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
          {content}
        </div>
      ),
    },
    DynamicProductGrid: {
      fields: {
        title: { type: "text" },
        categoryId: { type: "text" },
        filterType: {
          type: "radio",
          options: [
            { label: "الأحدث", value: "newest" },
            { label: "الأكثر مبيعاً", value: "most_sold" },
            { label: "الأعلى تقييماً", value: "highest_rated" },
          ]
        },
        layoutStyle: {
          type: "radio",
          options: [
            { label: "شريط تمرير (Carousel)", value: "carousel" },
            { label: "شبكة (Grid)", value: "grid" },
          ]
        },
        limit: { type: "number" }
      },
      defaultProps: {
        title: "المنتجات المميزة",
        categoryId: "all",
        filterType: "newest",
        layoutStyle: "carousel",
        limit: 10
      },
      render: (props: any) => {
        return <DynamicProductGrid {...props} />;
      }
    },
    DynamicCategoryCircles: {
      fields: {
        title: { type: "text" },
        parentId: { type: "text" }
      },
      defaultProps: {
        title: "التصنيفات الشائعة",
        parentId: "main"
      },
      render: (props: any) => {
        return <DynamicCategoryCircles {...props} />;
      }
    }
  },
};
