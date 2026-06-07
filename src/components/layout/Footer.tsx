import { useAppStore } from '@/lib/store';
import { ThemeSettings } from '@/lib/theme-defaults';

const t = (localeOrAr: string, arOrEn: string, en?: string) => {
  if (en !== undefined) {
    return localeOrAr === 'ar' ? arOrEn : en;
  }
  const currentLocale = useAppStore.getState().locale;
  return currentLocale === 'ar' ? localeOrAr : arOrEn;
};

// ... social icons omitted for brevity but they are the same SVG
function FacebookIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>; }
function TwitterXIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function LinkedInIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 012.063-2.065 2.06 2.06 0 012.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>; }

interface FooterProps {
  theme?: ThemeSettings;
}

export default function Footer({ theme }: FooterProps) {
  const { locale } = useAppStore();

  // If no theme provided, use a hardcoded default structure or fallback.
  // In Phase 2, we will fully connect this to a global translation engine.
  const dynamicColumns = theme?.footer.columns || [];
  
  const socialConfig = theme?.footer.socialMedia;

  return (
    <footer 
      className="mt-auto border-t transition-colors"
      style={{
        backgroundColor: 'var(--theme-bg-footer, #ffffff)',
        borderColor: 'var(--theme-bg-sidebar, #e2e8f0)', // using sidebar as border for contrast
        color: 'var(--theme-text-footer, #555555)'
      }}
    >
      <div className="container-platform py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div 
              className="rounded-lg px-3 py-1.5 font-bold text-xl inline-block mb-4"
              style={{
                backgroundColor: 'var(--theme-primary, #1ABB9C)',
                color: '#ffffff'
              }}
            >
              {t('شاري داي', 'CharyDay')}
            </div>
            <p className="text-sm mb-4 leading-relaxed opacity-80">
              {t(locale,
                'منصة التجارة الإلكترونية الأولى في المنطقة. تسوق الآن واستمتع بأفضل العروض والخصومات.',
                'The leading e-commerce platform in the region. Shop now and enjoy the best deals and discounts.'
              )}
            </p>
            {/* Dynamic Social Icons */}
            {socialConfig?.enabled && (
              <div className="flex items-center gap-2">
                {socialConfig.facebookUrl !== '#' && (
                  <a href={socialConfig.facebookUrl} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <FacebookIcon />
                  </a>
                )}
                {socialConfig.instagramUrl !== '#' && (
                  <a href={socialConfig.instagramUrl} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <InstagramIcon />
                  </a>
                )}
                {socialConfig.twitterUrl !== '#' && (
                  <a href={socialConfig.twitterUrl} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <TwitterXIcon />
                  </a>
                )}
                {socialConfig.linkedinUrl !== '#' && (
                  <a href={socialConfig.linkedinUrl} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <LinkedInIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Links Columns */}
          {dynamicColumns.map((col, idx) => (
            <div key={col.id || idx}>
              <h3 className="font-semibold text-sm mb-3 opacity-90">{col.titleKey}</h3>
              <ul className="space-y-2">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.url}
                      className="text-sm opacity-70 hover:opacity-100 transition-colors"
                      style={{ color: 'var(--theme-text-footer)' }}
                    >
                      {link.textKey}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'var(--theme-bg-sidebar, #e2e8f0)' }}>
        <div className="container-platform py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-70">
            © 2025 {t('منصة شاري داي. جميع الحقوق محفوظة.', 'CharyDay Platform. All rights reserved.')}
          </p>
          {theme?.footer.paymentMethods?.enabled && (
            <div className="flex items-center gap-2">
              {theme.footer.paymentMethods.methods.map((method) => (
                <span
                  key={method}
                  className="text-[10px] font-medium opacity-70"
                >
                  {method}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[var(--bottom-nav-height)] md:hidden" />
    </footer>
  );
}