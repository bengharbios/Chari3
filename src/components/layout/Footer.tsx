'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ThemeSettings } from '@/lib/theme-defaults';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

// ... social icons omitted for brevity but they are the same SVG
function FacebookIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>; }
function TwitterXIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function LinkedInIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 012.063-2.065 2.06 2.06 0 012.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>; }

interface FooterProps {
  theme?: ThemeSettings;
}

export default function Footer({ theme }: FooterProps) {
  const { t: globalT } = useTranslation();
  const { locale } = useAppStore();
  
  const t = (localeOrAr: string, arOrEn: string, en?: string) => {
    let arVal = '';
    if (en !== undefined) {
      arVal = arOrEn;
    } else {
      arVal = localeOrAr;
    }

    if (arVal.includes('التجارة الإلكترونية الأولى') || arVal.includes('e-commerce platform')) {
      return globalT('footer.desc');
    }
    if (arVal.includes('جميع الحقوق محفوظة') || arVal.includes('All rights reserved')) {
      return globalT('footer.copyright');
    }
    if (arVal === 'شاري داي' || arVal === 'CharyDay') {
      return globalT('footer.brandName');
    }

    // Fallback
    if (en !== undefined) {
      return localeOrAr === 'ar' ? arOrEn : en;
    }
    return localeOrAr === 'ar' ? localeOrAr : arOrEn;
  };

  const [footerBlocks, setFooterBlocks] = useState<any[]>([]);
  const [storefrontTheme, setStorefrontTheme] = useState<any>(null);
  const [hfConfig, setHfConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.settings?.footer_blocks) {
            try {
              setFooterBlocks(JSON.parse(data.settings.footer_blocks));
            } catch (e) {}
          }
          if (data.settings?.theme_storefront) {
            try {
              setStorefrontTheme(JSON.parse(data.settings.theme_storefront));
            } catch (e) {}
          }
          if (data.settings?.headerFooterConfig) {
            try {
              setHfConfig(JSON.parse(data.settings.headerFooterConfig));
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const activeTheme = theme || storefrontTheme;

  const defaultFooterColumns = [
    {
      id: 'electronics',
      titleKey: locale === 'ar' ? 'الإلكترونيات' : 'Electronics',
      links: [
        { textKey: locale === 'ar' ? 'الهواتف المحمولة' : 'Mobile Phones', url: '/search?q=phones' },
        { textKey: locale === 'ar' ? 'أجهزة الكمبيوتر' : 'Laptops', url: '/search?q=laptops' },
        { textKey: locale === 'ar' ? 'التلفزيونات' : 'Televisions', url: '/search?q=tvs' },
        { textKey: locale === 'ar' ? 'ألعاب الفيديو' : 'Video Games', url: '/search?q=games' }
      ]
    },
    {
      id: 'fashion_beauty',
      titleKey: locale === 'ar' ? 'الأزياء والجمال' : 'Fashion & Beauty',
      links: [
        { textKey: locale === 'ar' ? 'أزياء نسائية' : 'Women\'s Fashion', url: '/search?q=women' },
        { textKey: locale === 'ar' ? 'أزياء رجالية' : 'Men\'s Fashion', url: '/search?q=men' },
        { textKey: locale === 'ar' ? 'العطور' : 'Perfumes', url: '/search?q=perfume' },
        { textKey: locale === 'ar' ? 'الساعات والمجوهرات' : 'Watches & Jewelry', url: '/search?q=watches' }
      ]
    },
    {
      id: 'home_kitchen',
      titleKey: locale === 'ar' ? 'المنزل والمطبخ' : 'Home & Kitchen',
      links: [
        { textKey: locale === 'ar' ? 'أدوات المطبخ' : 'Kitchenware', url: '/search?q=kitchen' },
        { textKey: locale === 'ar' ? 'الأثاث' : 'Furniture', url: '/search?q=furniture' },
        { textKey: locale === 'ar' ? 'ديكور البيت' : 'Home Decor', url: '/search?q=decor' },
        { textKey: locale === 'ar' ? 'أواني السفرة والتقديم' : 'Tableware & Dining', url: '/search?q=dining' }
      ]
    },
    {
      id: 'support_selling',
      titleKey: locale === 'ar' ? 'بِع معنا والدعم' : 'Partnership & Support',
      links: [
        { textKey: locale === 'ar' ? 'بِع معنا على شاري داي' : 'Sell with us on ChariDay', url: '/?view=login&role=seller' },
        { textKey: locale === 'ar' ? 'مركز المساعدة' : 'Help Center', url: '#' },
        { textKey: locale === 'ar' ? 'تواصل معنا' : 'Contact Us', url: '#' },
        { textKey: locale === 'ar' ? 'سياسة الشحن والضمان' : 'Shipping & Guarantee', url: '#' }
      ]
    }
  ];

  const footerKeyFallback: Record<string, string> = {
    'footer.my_account': locale === 'ar' ? 'حسابي' : 'My Account',
    'footer.login': locale === 'ar' ? 'تسجيل الدخول' : 'Login',
    'footer.register': locale === 'ar' ? 'إنشاء حساب' : 'Register',
    'footer.help': locale === 'ar' ? 'المساعدة والدعم' : 'Help & Support',
    'footer.help_center': locale === 'ar' ? 'مركز المساعدة' : 'Help Center',
    'footer.faq': locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
    'footer.desc': locale === 'ar' ? 'منصة التجارة الإلكترونية الأولى في المنطقة' : 'The leading e-commerce platform',
    'footer.copyright': locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved',
    'footer.brandName': locale === 'ar' ? 'شاري داي' : 'ChariDay',
  };

  const resolveKey = (key: string): string => {
    if (key?.startsWith('footer.')) {
      return footerKeyFallback[key] || globalT(key) || key.replace('footer.', '');
    }
    return key;
  };

  const dbColumns = activeTheme?.footer?.columns || [];
  const mappedDbColumns = dbColumns.map((col: any) => ({
    id: col.id,
    titleKey: resolveKey(col.titleKey),
    links: (col.links || []).map((link: any) => ({
      textKey: resolveKey(link.textKey),
      url: link.url || '#'
    }))
  }));

  let dynamicColumns = footerBlocks.length > 0 
    ? footerBlocks.map(b => ({
        id: b.id,
        titleKey: locale === 'ar' ? b.titleAr : b.titleEn,
        links: (b.links || []).map((l: any) => ({
          textKey: locale === 'ar' ? l.labelAr : l.labelEn,
          url: l.url || '#'
        }))
      }))
    : (mappedDbColumns.length > 0 ? mappedDbColumns : defaultFooterColumns);

  // Override with new headerFooterConfig if present
  if (hfConfig?.footer?.columns && hfConfig.footer.columns.length > 0) {
    dynamicColumns = hfConfig.footer.columns.map((c: any) => ({
      id: c.id || Math.random().toString(),
      titleKey: locale === 'ar' ? c.titleAr : c.titleEn,
      links: (c.links || []).map((l: any) => ({
        textKey: locale === 'ar' ? l.textAr : l.textEn,
        url: l.url || '#'
      }))
    }));
  }
  
  const socialConfig = hfConfig?.footer?.socialLinks || activeTheme?.footer?.socialMedia;
  const hfSocialsEnabled = hfConfig?.footer?.socialLinks && (hfConfig.footer.socialLinks.facebook || hfConfig.footer.socialLinks.instagram || hfConfig.footer.socialLinks.twitter || hfConfig.footer.socialLinks.tiktok);

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
              {aboutText ? aboutText : t(locale,
                'منصة التجارة الإلكترونية الأولى في المنطقة. تسوق الآن واستمتع بأفضل العروض والخصومات.',
                'The leading e-commerce platform in the region. Shop now and enjoy the best deals and discounts.'
              )}
            </p>
            {/* Dynamic Social Icons */}
            {(hfSocialsEnabled || socialConfig?.enabled) && (
              <div className="flex items-center gap-2">
                {(socialConfig?.facebookUrl || socialConfig?.facebook) && (socialConfig?.facebookUrl !== '#' || socialConfig?.facebook !== '#') && (
                  <a href={socialConfig.facebookUrl || socialConfig.facebook} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <FacebookIcon />
                  </a>
                )}
                {(socialConfig?.instagramUrl || socialConfig?.instagram) && (socialConfig?.instagramUrl !== '#' || socialConfig?.instagram !== '#') && (
                  <a href={socialConfig.instagramUrl || socialConfig.instagram} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <InstagramIcon />
                  </a>
                )}
                {(socialConfig?.twitterUrl || socialConfig?.twitter) && (socialConfig?.twitterUrl !== '#' || socialConfig?.twitter !== '#') && (
                  <a href={socialConfig.twitterUrl || socialConfig.twitter} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    <TwitterXIcon />
                  </a>
                )}
                {(socialConfig?.linkedinUrl || socialConfig?.tiktok) && (socialConfig?.linkedinUrl !== '#' || socialConfig?.tiktok !== '#') && (
                  <a href={socialConfig.linkedinUrl || socialConfig.tiktok} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all">
                    {socialConfig.tiktok ? <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.45-2.43 6.08-1.74 1.83-4.32 2.87-6.85 2.58-2.61-.31-5.02-1.92-6.19-4.28-1.22-2.45-1.07-5.5.38-7.8 1.4-2.22 3.84-3.69 6.42-3.83v4.06c-1.34.09-2.63.76-3.4 1.82-.76 1.05-.98 2.45-.63 3.73.34 1.25 1.35 2.31 2.59 2.66 1.41.38 3.01.07 4.12-.9 1.04-1.01 1.47-2.48 1.45-3.95.03-5.59.01-11.18.01-16.77z"/></svg> : <LinkedInIcon />}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Links Columns */}
          {dynamicColumns.map((col: any, idx: number) => (
            <div key={col.id || idx}>
              <h3 className="font-semibold text-sm mb-3 opacity-90">{col.titleKey}</h3>
              <ul className="space-y-2">
                {col.links.map((link: any, linkIdx: number) => (
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
            {copyrightText ? copyrightText : (
              `© ${currentYear} ${t('منصة شاري داي. جميع الحقوق محفوظة.', 'CharyDay Platform. All rights reserved.')}`
            )}
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
