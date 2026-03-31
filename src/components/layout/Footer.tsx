'use client';

import { useAppStore } from '@/lib/store';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function Footer() {
  const { locale } = useAppStore();

  const footerLinks = [
    {
      title: t(locale, 'حسابي', 'My Account'),
      links: [
        t(locale, 'تسجيل الدخول', 'Login'),
        t(locale, 'إنشاء حساب', 'Register'),
        t(locale, 'الطلبات', 'Orders'),
        t(locale, 'المفضلة', 'Wishlist'),
      ],
    },
    {
      title: t(locale, 'المساعدة', 'Help'),
      links: [
        t(locale, 'مركز المساعدة', 'Help Center'),
        t(locale, 'سياسة الإرجاع', 'Returns Policy'),
        t(locale, 'الشحن والتوصيل', 'Shipping'),
        t(locale, 'الأسئلة الشائعة', 'FAQ'),
      ],
    },
    {
      title: t(locale, 'عن المنصة', 'About'),
      links: [
        t(locale, 'من نحن', 'About Us'),
        t(locale, 'كن تاجراً', 'Sell with Us'),
        t(locale, 'الشروط والأحكام', 'Terms'),
        t(locale, 'سياسة الخصوصية', 'Privacy'),
      ],
    },
  ];

  const paymentMethods = [
    t(locale, 'CCP', 'CCP'),
    t(locale, 'BaridiMob', 'BaridiMob'),
    t(locale, 'Visa', 'Visa'),
    t(locale, 'Mastercard', 'Mastercard'),
    t(locale, 'CIB', 'CIB'),
  ];

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Main Footer */}
      <div className="container-platform py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="gradient-brand rounded-lg px-3 py-1.5 font-bold text-navy text-xl inline-block mb-4">
              شاري داي
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t(locale, 
                'منصة التجارة الإلكترونية الأولى في المنطقة. تسوق الآن واستمتع بأفضل العروض والخصومات.',
                'The leading e-commerce platform in the region. Shop now and enjoy the best deals and discounts. Developed by Kadir Bengharbi.'
              )}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {['𝕏', 'f', 'in', '📷'].map((icon, i) => (
                <button
                  key={i}
                  className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-brand transition-colors text-sm"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </button>
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
            {t(locale, '© 2025 منصة شاري داي. جميع الحقوق محفوظة. تطوير: كادر بن غربي', '© 2025 CharyDay Platform. All rights reserved. Developed by Kadir Bengharbi')}
          </p>
          <div className="flex items-center gap-2">
            {paymentMethods.map((method, i) => (
              <div
                key={i}
                className="px-2 py-1 rounded bg-background border border-border text-[10px] font-medium text-muted-foreground"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safe bottom spacing for mobile */}
      <div className="h-[var(--bottom-nav-height)] md:hidden" />
    </footer>
  );
}
