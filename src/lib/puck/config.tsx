import React from "react";
import type { Config } from "@measured/puck";
import { useTranslationStore } from "@/lib/store/translation-store"; // Might not work if used outside of React component
// But we can just pass the locale to the Render component as a prop or context.

// We will use a custom wrapper to get the current locale in the storefront
export const PuckLocaleContext = React.createContext<'ar' | 'en' | 'fr'>('ar');

export const usePuckLocale = () => React.useContext(PuckLocaleContext);

type Props = {
  Hero: { 
    titleAr: string; titleEn: string; titleFr: string; 
    descAr: string; descEn: string; descFr: string;
    bgImage: string; 
  };
  Text: { 
    textAr: string; textEn: string; textFr: string;
    align: 'left' | 'center' | 'right'; 
  };
  Section: {
    titleAr: string; titleEn: string; titleFr: string;
    bgColor: string;
  };
};

export const config: Config<Props> = {
  components: {
    Hero: {
      fields: {
        titleAr: { type: "text", label: "Title (Arabic)" },
        titleEn: { type: "text", label: "Title (English)" },
        titleFr: { type: "text", label: "Title (French)" },
        descAr: { type: "textarea", label: "Description (Arabic)" },
        descEn: { type: "textarea", label: "Description (English)" },
        descFr: { type: "textarea", label: "Description (French)" },
        bgImage: { type: "text", label: "Background Image URL" },
      },
      defaultProps: {
        titleAr: "عنوان رئيسي",
        titleEn: "Main Title",
        titleFr: "Titre principal",
        descAr: "وصف جذاب للصفحة يشد انتباه الزائر.",
        descEn: "An engaging description for the page to capture visitor attention.",
        descFr: "Une description engageante pour la page afin de capter l'attention du visiteur.",
        bgImage: "",
      },
      render: ({ titleAr, titleEn, titleFr, descAr, descEn, descFr, bgImage }) => {
        const locale = usePuckLocale();
        const title = locale === 'en' ? titleEn : locale === 'fr' ? titleFr : titleAr;
        const desc = locale === 'en' ? descEn : locale === 'fr' ? descFr : descAr;
        
        return (
          <div 
            className="relative py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden min-h-[400px]"
            style={{
              backgroundColor: 'var(--theme-primary, #1ABB9C)',
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {bgImage && <div className="absolute inset-0 bg-black/50" />}
            <div className="relative z-10 max-w-4xl mx-auto text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
              <p className="text-lg md:text-xl opacity-90">{desc}</p>
            </div>
          </div>
        );
      },
    },
    Text: {
      fields: {
        textAr: { type: "textarea", label: "Content (Arabic)" },
        textEn: { type: "textarea", label: "Content (English)" },
        textFr: { type: "textarea", label: "Content (French)" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" }
          ]
        }
      },
      defaultProps: {
        textAr: "اكتب محتواك هنا...",
        textEn: "Write your content here...",
        textFr: "Écrivez votre contenu ici...",
        align: "right"
      },
      render: ({ textAr, textEn, textFr, align }) => {
        const locale = usePuckLocale();
        const text = locale === 'en' ? textEn : locale === 'fr' ? textFr : textAr;
        const dir = locale === 'ar' ? 'rtl' : 'ltr';
        // In storefront, the global dir handles it, but we can force text-align
        const computedAlign = locale === 'ar' && align === 'left' ? 'right' : align;

        return (
          <div className="container-platform py-8">
            <div 
              className="prose dark:prose-invert max-w-none whitespace-pre-wrap"
              style={{ textAlign: computedAlign as any }}
            >
              {text}
            </div>
          </div>
        );
      }
    },
    Section: {
      fields: {
        titleAr: { type: "text", label: "Section Title (Arabic)" },
        titleEn: { type: "text", label: "Section Title (English)" },
        titleFr: { type: "text", label: "Section Title (French)" },
        bgColor: { type: "text", label: "Background Color (e.g. #f8fafc)" }
      },
      defaultProps: {
        titleAr: "عنوان القسم",
        titleEn: "Section Title",
        titleFr: "Titre de section",
        bgColor: ""
      },
      render: ({ titleAr, titleEn, titleFr, bgColor, puck }) => {
        const locale = usePuckLocale();
        const title = locale === 'en' ? titleEn : locale === 'fr' ? titleFr : titleAr;
        return (
          <div className="py-12" style={{ backgroundColor: bgColor || 'transparent' }}>
            <div className="container-platform">
              {title && <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>}
              {/* DropZone allows nesting components inside this section */}
              {puck.renderDropZone({ zone: "content" })}
            </div>
          </div>
        );
      }
    }
  },
};
