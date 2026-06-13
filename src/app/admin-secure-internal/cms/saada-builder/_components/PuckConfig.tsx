'use client';

import React from 'react';
import { Button } from "@/components/ui/button";

// Basic responsive tailwind grid
const distributionToClass: Record<string, string> = {
  "1fr": "grid-cols-1",
  "1fr 1fr": "grid-cols-1 md:grid-cols-2",
  "1fr 1fr 1fr": "grid-cols-1 md:grid-cols-3",
  "1fr 3fr": "grid-cols-1 md:grid-cols-4 [&>*:first-child]:md:col-span-1 [&>*:last-child]:md:col-span-3",
  "3fr 1fr": "grid-cols-1 md:grid-cols-4 [&>*:first-child]:md:col-span-3 [&>*:last-child]:md:col-span-1",
};

export const getSaadaConfig = (t: Function, isRTL: boolean) => ({
  categories: {
    layout: { title: t('saada.blocks.columns') || 'Layout', components: ['Columns'] },
    content: { title: t('saada.blocks.text') || 'Content', components: ['Hero', 'Heading', 'Text', 'CustomBanner', 'ProductGrid'] },
  },
  components: {
    Columns: {
      fields: {
        distribution: {
          type: "radio",
          options: [
            { label: "1 Column", value: "1fr" },
            { label: "2 Columns", value: "1fr 1fr" },
            { label: "3 Columns", value: "1fr 1fr 1fr" },
            { label: "1/4 + 3/4", value: "1fr 3fr" },
            { label: "3/4 + 1/4", value: "3fr 1fr" },
          ],
        },
      },
      defaultProps: {
        distribution: "1fr 1fr",
      },
      render: ({ distribution, puck: { renderDropZone } }: any) => {
        const gridClass = distributionToClass[distribution] || "grid-cols-1";
        return (
          <div className={`w-full grid ${gridClass} gap-4 my-4`} dir={isRTL ? 'rtl' : 'ltr'}>
            {distribution.split(" ").map((_: any, i: number) => (
              <div key={i} className="min-h-[120px] rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50 outline-dashed outline-2 outline-transparent hover:outline-gray-200 transition-all">
                {renderDropZone({ zone: `column-${i}` })}
              </div>
            ))}
          </div>
        );
      },
    },
    Hero: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        imageUrl: { type: "text" },
        ctaText: { type: "text" },
        ctaLink: { type: "text" },
        alignment: {
          type: "radio",
          options: [
            { label: "Right", value: "text-right items-end" },
            { label: "Center", value: "text-center items-center" },
            { label: "Left", value: "text-left items-start" },
          ]
        }
      },
      defaultProps: {
        title: "اكتشف تشكيلتنا الجديدة",
        subtitle: "أفضل المنتجات بأسعار لا تقاوم",
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000",
        ctaText: "تسوق الآن",
        ctaLink: "/store",
        alignment: "text-center items-center"
      },
      render: ({ title, subtitle, imageUrl, ctaText, ctaLink, alignment }: any) => (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden my-4 group" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="absolute inset-0">
            <img src={imageUrl} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className={`relative h-full flex flex-col justify-center px-8 md:px-16 ${alignment}`}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-md">
              {title}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow">
              {subtitle}
            </p>
            <a href={ctaLink}>
              <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-brand hover:bg-brand/90 text-white shadow-xl hover:shadow-2xl transition-all">
                {ctaText}
              </Button>
            </a>
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
            { label: "Right", value: "text-right" },
            { label: "Center", value: "text-center" },
            { label: "Left", value: "text-left" },
          ]
        }
      },
      defaultProps: {
        title: "عنوان القسم",
        alignment: "text-right"
      },
      render: ({ title, alignment }: any) => (
        <h2 className={`text-3xl md:text-4xl font-bold text-slate-800 dark:text-white ${alignment} my-6`} dir={isRTL ? 'rtl' : 'ltr'}>
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
        <a href={link} className="block w-full rounded-2xl overflow-hidden my-4 hover:opacity-90 transition shadow-sm hover:shadow-md">
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
        <div className="prose dark:prose-invert max-w-none my-4 text-gray-600 dark:text-gray-300 whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
          {content}
        </div>
      ),
    },
    ProductGrid: {
      fields: {
        title: { type: "text" },
        category: { type: "text" },
        limit: {
          type: "radio",
          options: [
            { label: "4", value: "4" },
            { label: "8", value: "8" },
            { label: "12", value: "12" },
          ]
        }
      },
      defaultProps: {
        title: "أحدث المنتجات",
        category: "all",
        limit: "4"
      },
      render: ({ title, limit }: any) => {
        // Placeholder for the builder. In the frontend, this will fetch actual products.
        const placeholders = Array.from({ length: parseInt(limit) });
        return (
          <div className="my-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {placeholders.map((_, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
                  <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">صورة المنتج</span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-brand/20 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    }
  },
});
