'use client';

import { useAppStore } from '@/lib/store';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

// Professional SVG social media icons
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 012.063-2.065 2.06 2.06 0 012.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const socialLinks = [
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: TwitterXIcon, label: 'X (Twitter)', href: '#' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
];

export default function Footer() {
  const { locale } = useAppStore();

  const footerLinks = [
    {
      title: t(locale, 'حسابي', 'My Account'),
      links: [
        { text: t(locale, 'تسجيل الدخول', 'Login'), href: '#' },
        { text: t(locale, 'إنشاء حساب', 'Register'), href: '#' },
        { text: t(locale, 'الطلبات', 'Orders'), href: '#' },
        { text: t(locale, 'المفضلة', 'Wishlist'), href: '#' },
      ],
    },
    {
      title: t(locale, 'المساعدة', 'Help'),
      links: [
        { text: t(locale, 'مركز المساعدة', 'Help Center'), href: '#' },
        { text: t(locale, 'سياسة الإرجاع', 'Returns Policy'), href: '#' },
        { text: t(locale, 'الشحن والتوصيل', 'Shipping'), href: '#' },
        { text: t(locale, 'الأسئلة الشائعة', 'FAQ'), href: '#' },
      ],
    },
    {
      title: t(locale, 'عن المنصة', 'About'),
      links: [
        { text: t(locale, 'من نحن', 'About Us'), href: '#' },
        { text: t(locale, 'كن تاجراً', 'Sell with Us'), href: '#' },
        { text: t(locale, 'الشروط والأحكام', 'Terms'), href: '#' },
        { text: t(locale, 'سياسة الخصوصية', 'Privacy'), href: '#' },
      ],
    },
  ];

  const paymentMethods = ['CCP', 'BaridiMob', 'Visa', 'Mastercard', 'CIB'];

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Main Footer */}
      <div className="container-platform py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="gradient-brand rounded-lg px-3 py-1.5 font-bold text-navy text-xl inline-block mb-4">
              {t('شاري داي', 'CharyDay')}
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t(locale,
                'منصة التجارة الإلكترونية الأولى في المنطقة. تسوق الآن واستمتع بأفضل العروض والخصومات.',
                'The leading e-commerce platform in the region. Shop now and enjoy the best deals and discounts.'
              )}
            </p>
            {/* Social Icons — Clean SVG icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {}}
                    className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-brand hover:bg-brand hover:text-navy transition-all"
                    aria-label={social.label}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Links Columns — Plain text links, no borders */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-platform py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 {t('منصة شاري داي. جميع الحقوق محفوظة. تطوير: كادر بن غربي', 'CharyDay Platform. All rights reserved. Developed by Kadir Bengharbi')}
          </p>
          <div className="flex items-center gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="text-[10px] font-medium text-muted-foreground"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Safe bottom spacing for mobile */}
      <div className="h-[var(--bottom-nav-height)] md:hidden" />
    </footer>
  );
}