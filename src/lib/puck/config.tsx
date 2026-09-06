import React from "react";
import type { Config } from "@measured/puck";
import { useTranslationStore } from "@/lib/store/translation-store";

export const PuckLocaleContext = React.createContext<string>('ar');

export const usePuckLocale = () => React.useContext(PuckLocaleContext);

// Note: We use Record<string, any> for Props because fields are dynamically generated based on locales.
export const config: Config<Record<string, any>> = {
  components: {
    Hero: {
      fields: {
        bgImage: { type: "text", label: "Background Image URL" },
        content: {
          type: "array",
          label: "Translations",
          arrayFields: {
            locale: { type: "text", label: "Locale Code (ar, en, fr...)" },
            title: { type: "text", label: "Title" },
            desc: { type: "textarea", label: "Description" }
          }
        }
      },
      defaultProps: {
        bgImage: "",
        content: [
          { locale: "ar", title: "عنوان رئيسي", desc: "وصف جذاب للصفحة يشد انتباه الزائر." },
          { locale: "en", title: "Main Title", desc: "An engaging description for the page to capture visitor attention." },
          { locale: "fr", title: "Titre principal", desc: "Une description engageante pour la page afin de capter l'attention du visiteur." }
        ]
      },
      render: ({ content, bgImage }) => {
        const locale = usePuckLocale();
        const dir = locale === 'ar' ? 'rtl' : 'ltr';
        
        // Find the translation object for the current locale, fallback to first item
        const translation = (Array.isArray(content) ? content.find(c => c.locale === locale) : null) || (Array.isArray(content) && content.length > 0 ? content[0] : { title: '', desc: '' });
        
        return (
          <div 
            dir={dir}
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 drop-shadow-md">{translation.title}</h1>
              <p className="text-lg md:text-2xl opacity-90 drop-shadow max-w-2xl mx-auto">{translation.desc}</p>
            </div>
          </div>
        );
      },
    },
    RichText: {
      fields: {
        content: {
          type: "array",
          label: "Translations",
          arrayFields: {
            locale: { type: "text", label: "Locale Code (ar, en, fr...)" },
            html: { type: "textarea", label: "HTML Content" }
          }
        }
      },
      defaultProps: {
        content: [
          { locale: "ar", html: "<h2>عنوان</h2><p>نص منسق هنا...</p>" },
          { locale: "en", html: "<h2>Title</h2><p>Rich text here...</p>" },
          { locale: "fr", html: "<h2>Titre</h2><p>Texte enrichi ici...</p>" }
        ]
      },
      render: ({ content }) => {
        const locale = usePuckLocale();
        const dir = locale === 'ar' ? 'rtl' : 'ltr';
        
        const translation = (Array.isArray(content) ? content.find(c => c.locale === locale) : null) || (Array.isArray(content) && content.length > 0 ? content[0] : { html: '' });

        return (
          <div className="container-platform py-8" dir={dir}>
            <div 
              className={`prose prose-lg dark:prose-invert prose-headings:text-primary max-w-4xl mx-auto marker:text-primary prose-a:text-primary hover:prose-a:text-primary-dark ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              dangerouslySetInnerHTML={{ __html: translation.html }}
            />
          </div>
        );
      }
    },
    Accordion: {
      fields: {
        content: {
          type: "array",
          label: "Translations",
          arrayFields: {
            locale: { type: "text", label: "Locale Code (ar, en, fr...)" },
            title: { type: "text", label: "Title" },
            html: { type: "textarea", label: "HTML Content" }
          }
        }
      },
      defaultProps: {
        content: [
          { locale: "ar", title: "سؤال متكرر؟", html: "<p>إجابة تفصيلية هنا.</p>" },
          { locale: "en", title: "FAQ Question?", html: "<p>Detailed answer here.</p>" },
          { locale: "fr", title: "Question fréquente?", html: "<p>Réponse détaillée ici.</p>" }
        ]
      },
      render: ({ content }) => {
        const locale = usePuckLocale();
        const dir = locale === 'ar' ? 'rtl' : 'ltr';
        
        const translation = (Array.isArray(content) ? content.find(c => c.locale === locale) : null) || (Array.isArray(content) && content.length > 0 ? content[0] : { title: '', html: '' });

        return (
          <div className="container-platform py-2 max-w-4xl mx-auto" dir={dir}>
            <details className="group border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg p-4 text-gray-900 dark:text-white font-semibold">
                <h3 className={`text-lg ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{translation.title}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 p-1.5 text-gray-900 sm:p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-45" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </span>
              </summary>
              <div className={`px-4 pb-4 prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: translation.html }} />
            </details>
          </div>
        );
      }
    },
    Section: {
      fields: {
        bgColor: { type: "text", label: "Background Color (e.g. #f8fafc)" },
        content: {
          type: "array",
          label: "Translations",
          arrayFields: {
            locale: { type: "text", label: "Locale Code (ar, en, fr...)" },
            title: { type: "text", label: "Section Title" }
          }
        }
      },
      defaultProps: {
        bgColor: "",
        content: [
          { locale: "ar", title: "عنوان القسم" },
          { locale: "en", title: "Section Title" },
          { locale: "fr", title: "Titre de section" }
        ]
      },
      render: ({ content, bgColor, puck }) => {
        const locale = usePuckLocale();
        const dir = locale === 'ar' ? 'rtl' : 'ltr';
        
        const translation = (Array.isArray(content) ? content.find(c => c.locale === locale) : null) || (Array.isArray(content) && content.length > 0 ? content[0] : { title: '' });
        
        return (
          <div className="py-16" style={{ backgroundColor: bgColor || 'transparent' }} dir={dir}>
            <div className="container-platform">
              {translation.title && <h2 className="text-3xl font-extrabold mb-10 text-center relative after:content-[''] after:absolute after:bottom-[-12px] after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-primary after:rounded-full">{translation.title}</h2>}
              {puck.renderDropZone({ zone: "content" })}
            </div>
          </div>
        );
      }
    }
  },
};
