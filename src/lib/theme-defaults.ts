export interface ThemeSettings {
  colors: {
    sidebarBackground: { light: string; dark: string };
    sidebarText: { light: string; dark: string };
    headerBackground: { light: string; dark: string };
    headerText: { light: string; dark: string };
    mainBackground: { light: string; dark: string };
    mainText: { light: string; dark: string };
    primaryColor: { light: string; dark: string };
    footerBackground: { light: string; dark: string };
    footerText: { light: string; dark: string };
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
    bodyWeight: string;
  };
  footer: {
    enabled: boolean;
    columns: Array<{
      id: string;
      titleKey: string; // Translation key
      links: Array<{
        textKey: string; // Translation key
        url: string;
      }>;
    }>;
    socialMedia: {
      enabled: boolean;
      facebookUrl: string;
      instagramUrl: string;
      twitterUrl: string;
      linkedinUrl: string;
    };
    paymentMethods: {
      enabled: boolean;
      methods: string[];
    };
    copyrightTextKey: string; // Translation key
  };
  customCss: string;
}

export const defaultSellerTheme: ThemeSettings = {
  colors: {
    sidebarBackground: { light: '#2A3F54', dark: '#1a2332' },
    sidebarText: { light: '#E7E7E7', dark: '#c8d3e0' },
    headerBackground: { light: '#ffffff', dark: '#1a2332' },
    headerText: { light: '#555555', dark: '#c8d3e0' },
    mainBackground: { light: '#F7F7F7', dark: '#0f172a' },
    mainText: { light: '#73879C', dark: '#cbd5e1' },
    primaryColor: { light: '#1ABB9C', dark: '#1ABB9C' },
    footerBackground: { light: '#ffffff', dark: '#1a2332' },
    footerText: { light: '#555555', dark: '#c8d3e0' },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
    headingWeight: '700',
    bodyWeight: '400',
  },
  footer: {
    enabled: true,
    columns: [
      {
        id: 'col1',
        titleKey: 'حسابي',
        links: [
          { textKey: 'تسجيل الدخول', url: '/?view=login' },
          { textKey: 'إنشاء حساب', url: '/?view=login' },
        ],
      },
      {
        id: 'col2',
        titleKey: 'المساعدة والدعم',
        links: [
          { textKey: 'مركز المساعدة', url: '#' },
          { textKey: 'الأسئلة الشائعة', url: '#' },
        ],
      },
    ],
    socialMedia: {
      enabled: true,
      facebookUrl: '#',
      instagramUrl: '#',
      twitterUrl: '#',
      linkedinUrl: '#',
    },
    paymentMethods: {
      enabled: true,
      methods: ['CCP', 'BaridiMob', 'Visa', 'Mastercard'],
    },
    copyrightTextKey: 'footer.copyright',
  },
  customCss: '',
};

export const defaultPlatformTheme: ThemeSettings = {
  colors: {
    sidebarBackground: { light: '#1B1464', dark: '#0E0E20' },
    sidebarText: { light: '#E8E8F0', dark: '#E8E8F0' },
    headerBackground: { light: '#ffffff', dark: '#141428' },
    headerText: { light: '#1A1A2E', dark: '#E8E8F0' },
    mainBackground: { light: '#FFFFFF', dark: '#0A0A1A' },
    mainText: { light: '#1A1A2E', dark: '#E8E8F0' },
    primaryColor: { light: '#1B1464', dark: '#FEEE00' },
    footerBackground: { light: '#ffffff', dark: '#141428' },
    footerText: { light: '#1A1A2E', dark: '#E8E8F0' },
  },
  typography: {
    fontFamily: 'Inter, Cairo, sans-serif',
    headingWeight: '700',
    bodyWeight: '400',
  },
  footer: defaultSellerTheme.footer,
  customCss: '',
};
