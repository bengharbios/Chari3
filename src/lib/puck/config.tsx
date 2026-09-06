import React from "react";
import type { Config } from "@measured/puck";
import { useTranslationStore } from "@/lib/store/translation-store";

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
  RichText: {
    contentAr: string; contentEn: string; contentFr: string;
  };
  Accordion: {
    titleAr: string; titleEn: string; titleFr: string;
    contentAr: string; contentEn: string; contentFr: string;
  };
  Card: {
    titleAr: string; titleEn: string; titleFr: string;
    descAr: string; descEn: string; descFr: string;
    icon: string;
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
            className="relative py-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden min-h-[400px]"
            style={{
              backgroundColor: 'var(--theme-primary, #1ABB9C)',
              backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(to right bottom, var(--theme-primary, #1ABB9C), #0f766e)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {bgImage && <div className="absolute inset-0 bg-black/60" />}
            <div className="relative z-10 max-w-4xl mx-auto text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 drop-shadow-md">{title}</h1>
              <p className="text-lg md:text-2xl opacity-90 drop-shadow max-w-2xl mx-auto">{desc}</p>
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
        const computedAlign = locale === 'ar' && align === 'left' ? 'right' : align;

        return (
          <div className="container-platform py-6">
            <div 
              className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-lg leading-relaxed"
              style={{ textAlign: computedAlign as any }}
            >
              {text}
            </div>
          </div>
        );
      }
    },
    RichText: {
      fields: {
        contentAr: { type: "textarea", label: "HTML Content (Arabic)" },
        contentEn: { type: "textarea", label: "HTML Content (English)" },
        contentFr: { type: "textarea", label: "HTML Content (French)" }
      },
      defaultProps: {
        contentAr: "<h2>عنوان</h2><p>نص منسق هنا...</p>",
        contentEn: "<h2>Title</h2><p>Rich text here...</p>",
        contentFr: "<h2>Titre</h2><p>Texte enrichi ici...</p>"
      },
      render: ({ contentAr, contentEn, contentFr }) => {
        const locale = usePuckLocale();
        const content = locale === 'en' ? contentEn : locale === 'fr' ? contentFr : contentAr;

        return (
          <div className="container-platform py-8">
            <div 
              className="prose prose-lg dark:prose-invert prose-headings:text-primary max-w-4xl mx-auto marker:text-primary prose-a:text-primary hover:prose-a:text-primary-dark"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }
    },
    Accordion: {
      fields: {
        titleAr: { type: "text", label: "Title (Arabic)" },
        titleEn: { type: "text", label: "Title (English)" },
        titleFr: { type: "text", label: "Title (French)" },
        contentAr: { type: "textarea", label: "Content (Arabic)" },
        contentEn: { type: "textarea", label: "Content (English)" },
        contentFr: { type: "textarea", label: "Content (French)" }
      },
      defaultProps: {
        titleAr: "سؤال متكرر؟", titleEn: "FAQ Question?", titleFr: "Question fréquente?",
        contentAr: "إجابة تفصيلية هنا.", contentEn: "Detailed answer here.", contentFr: "Réponse détaillée ici."
      },
      render: ({ titleAr, titleEn, titleFr, contentAr, contentEn, contentFr }) => {
        const locale = usePuckLocale();
        const title = locale === 'en' ? titleEn : locale === 'fr' ? titleFr : titleAr;
        const content = locale === 'en' ? contentEn : locale === 'fr' ? contentFr : contentAr;

        return (
          <div className="container-platform py-2 max-w-4xl mx-auto">
            <details className="group border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg p-4 text-gray-900 dark:text-white font-semibold">
                <h3 className="text-lg">{title}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 p-1.5 text-gray-900 sm:p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-45" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </span>
              </summary>
              <div className="px-4 pb-4 prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: content }} />
            </details>
          </div>
        );
      }
    },
    Card: {
      fields: {
        titleAr: { type: "text", label: "Title (Arabic)" },
        titleEn: { type: "text", label: "Title (English)" },
        titleFr: { type: "text", label: "Title (French)" },
        descAr: { type: "textarea", label: "Description (Arabic)" },
        descEn: { type: "textarea", label: "Description (English)" },
        descFr: { type: "textarea", label: "Description (French)" },
        icon: { type: "text", label: "Icon Emoji/Text" }
      },
      defaultProps: {
        titleAr: "ميزة", titleEn: "Feature", titleFr: "Caractéristique",
        descAr: "وصف الميزة...", descEn: "Feature description...", descFr: "Description de caractéristique...",
        icon: "🚀"
      },
      render: ({ titleAr, titleEn, titleFr, descAr, descEn, descFr, icon }) => {
        const locale = usePuckLocale();
        const title = locale === 'en' ? titleEn : locale === 'fr' ? titleFr : titleAr;
        const desc = locale === 'en' ? descEn : locale === 'fr' ? descFr : descAr;

        return (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{desc}</p>
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
          <div className="py-16" style={{ backgroundColor: bgColor || 'transparent' }}>
            <div className="container-platform">
              {title && <h2 className="text-3xl font-extrabold mb-10 text-center relative after:content-[''] after:absolute after:bottom-[-12px] after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-primary after:rounded-full">{title}</h2>}
              {puck.renderDropZone({ zone: "content" })}
            </div>
          </div>
        );
      }
    }
  },
};
