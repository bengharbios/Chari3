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
        { textKey: locale === 'ar' ? 'المقاول الذاتي' : 'Auto Entrepreneur', url: '/pages/auto-entrepreneur' },
        { textKey: locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions', url: '/pages/terms' },
        { textKey: locale === 'ar' ? 'سياسة الاسترجاع' : 'Return Policy', url: '/pages/return-policy' },
        { textKey: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', url: '/pages/privacy-policy' }
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

  const currentYear = new Date().getFullYear();
  const suffix = locale ? (locale.charAt(0).toUpperCase() + locale.slice(1).toLowerCase()) : 'Ar';
  
  // Dynamic About Text
  const aboutText = hfConfig?.footer?.[`aboutText${suffix}`] || hfConfig?.footer?.aboutTextEn || hfConfig?.footer?.aboutTextAr;
  
  // Dynamic Copyright
  const copyrightText = hfConfig?.footer?.[`copyrightText${suffix}`] || hfConfig?.footer?.copyrightTextEn || hfConfig?.footer?.copyrightTextAr;

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
            {(hfConfig?.footer?.dynamicSocials?.length > 0 || hfSocialsEnabled || socialConfig?.enabled) && (
              <div className="flex items-center gap-2 flex-wrap">
                {hfConfig?.footer?.dynamicSocials?.length > 0 ? (
                  hfConfig.footer.dynamicSocials.map((social: any) => (
                    <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all bg-slate-50/10 hover:bg-slate-50/20">
                      {social.network === 'facebook' && <FacebookIcon />}
                      {social.network === 'instagram' && <InstagramIcon />}
                      {social.network === 'twitter' && <TwitterXIcon />}
                      {social.network === 'tiktok' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.45-2.43 6.08-1.74 1.83-4.32 2.87-6.85 2.58-2.61-.31-5.02-1.92-6.19-4.28-1.22-2.45-1.07-5.5.38-7.8 1.4-2.22 3.84-3.69 6.42-3.83v4.06c-1.34.09-2.63.76-3.4 1.82-.76 1.05-.98 2.45-.63 3.73.34 1.25 1.35 2.31 2.59 2.66 1.41.38 3.01.07 4.12-.9 1.04-1.01 1.47-2.48 1.45-3.95.03-5.59.01-11.18.01-16.77z"/></svg>}
                      {social.network === 'youtube' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                      {social.network === 'linkedin' && <LinkedInIcon />}
                      {social.network === 'snapchat' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.22 1.4c-.9.08-1.78.29-2.58.74-.75.42-1.35 1.01-1.78 1.76-.5.85-.75 1.81-.88 2.78-.17 1.34-.14 2.69.04 4.02.1.72.23 1.43.4 2.13.06.27.14.54.24.8.1.25.1.25-.13.37-.84.44-1.76.62-2.7.67-.32.02-.65 0-.96.06-.61.12-1.12.5-1.39 1.08-.27.56-.27 1.18.01 1.74.21.43.58.75 1.03.92 1.15.42 2.35.66 3.57.73.49.03.99.01 1.49 0 .22-.01.32.08.38.28.14.54.33 1.05.57 1.53.31.6.73 1.12 1.25 1.54.91.75 2.01 1.17 3.19 1.32 1.21.16 2.41-.01 3.54-.53.79-.37 1.44-.94 1.95-1.66.45-.64.76-1.36 1.02-2.1.09-.27.2-.38.48-.36.96.05 1.92-.01 2.87-.14 1.23-.17 2.43-.53 3.55-1.07.49-.24.86-.64 1.05-1.15.18-.49.19-1.01.01-1.49-.17-.46-.51-.83-.97-1.05-.63-.31-1.3-.47-1.99-.58-.88-.13-1.78-.18-2.67-.18-.28 0-.39-.12-.48-.38-.28-.86-.48-1.73-.61-2.63-.12-.86-.14-1.73-.1-2.61.03-.78.14-1.55.35-2.31.25-.92.65-1.77 1.25-2.52 1.05-1.3 2.45-2.03 4.1-2.22 1.21-.14 2.4-.04 3.56.32z"/></svg>}
                      {social.network === 'whatsapp' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.06-.173-.298-.018-.46.13-.609.134-.135.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
                      {social.network === 'telegram' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.216-3.08 5.61-5.06c.243-.217-.053-.338-.378-.12L7.36 14.122l-2.984-.932c-.65-.203-.663-.652.136-.968l11.66-4.498c.54-.198 1.01.127.822.997z"/></svg>}
                      {social.network === 'pinterest' && <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.625 0 12.017 0z"/></svg>}
                      {social.network === 'other' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>}
                    </a>
                  ))
                ) : (
                  <>
                    {(socialConfig?.facebookUrl || socialConfig?.facebook) && (socialConfig?.facebookUrl !== '#' || socialConfig?.facebook !== '#') && (
                      <a href={socialConfig.facebookUrl || socialConfig.facebook} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all bg-slate-50/10 hover:bg-slate-50/20">
                        <FacebookIcon />
                      </a>
                    )}
                    {(socialConfig?.instagramUrl || socialConfig?.instagram) && (socialConfig?.instagramUrl !== '#' || socialConfig?.instagram !== '#') && (
                      <a href={socialConfig.instagramUrl || socialConfig.instagram} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all bg-slate-50/10 hover:bg-slate-50/20">
                        <InstagramIcon />
                      </a>
                    )}
                    {(socialConfig?.twitterUrl || socialConfig?.twitter) && (socialConfig?.twitterUrl !== '#' || socialConfig?.twitter !== '#') && (
                      <a href={socialConfig.twitterUrl || socialConfig.twitter} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all bg-slate-50/10 hover:bg-slate-50/20">
                        <TwitterXIcon />
                      </a>
                    )}
                    {(socialConfig?.linkedinUrl || socialConfig?.tiktok) && (socialConfig?.linkedinUrl !== '#' || socialConfig?.tiktok !== '#') && (
                      <a href={socialConfig.linkedinUrl || socialConfig.tiktok} className="h-9 w-9 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100 transition-all bg-slate-50/10 hover:bg-slate-50/20">
                        {socialConfig.tiktok ? <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.45-2.43 6.08-1.74 1.83-4.32 2.87-6.85 2.58-2.61-.31-5.02-1.92-6.19-4.28-1.22-2.45-1.07-5.5.38-7.8 1.4-2.22 3.84-3.69 6.42-3.83v4.06c-1.34.09-2.63.76-3.4 1.82-.76 1.05-.98 2.45-.63 3.73.34 1.25 1.35 2.31 2.59 2.66 1.41.38 3.01.07 4.12-.9 1.04-1.01 1.47-2.48 1.45-3.95.03-5.59.01-11.18.01-16.77z"/></svg> : <LinkedInIcon />}
                      </a>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Links Columns */}
          {dynamicColumns.map((col: any, idx: number) => (
            <div key={col.id || idx}>
              <h3 className={`font-semibold mb-3 opacity-90 ${hfConfig?.footer?.titleSize === 'sm' ? 'text-sm' : hfConfig?.footer?.titleSize === 'lg' ? 'text-lg' : hfConfig?.footer?.titleSize === 'xl' ? 'text-xl' : 'text-base'}`}>{col.titleKey}</h3>
              <ul className="space-y-2">
                {col.links.map((link: any, linkIdx: number) => (
                  <li key={linkIdx}>
                    <a
                      href={link.url}
                      className={`opacity-70 hover:opacity-100 transition-colors ${hfConfig?.footer?.textSize === 'xs' ? 'text-[10px]' : hfConfig?.footer?.textSize === 'base' ? 'text-base' : hfConfig?.footer?.textSize === 'lg' ? 'text-lg' : 'text-sm'}`}
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
