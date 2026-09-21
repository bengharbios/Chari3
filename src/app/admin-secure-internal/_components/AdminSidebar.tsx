'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  ShieldAlert, LayoutDashboard, Settings, Sliders, ToggleRight, ChevronRight, ChevronLeft,
  FolderTree, Tag, TrendingUp, ShoppingCart, Users, Store as StoreIcon, Wallet,
  Boxes, Banknote, Palette, ChevronDown, Monitor, KeyRound, LogOut, Globe, Plug, Truck,
  Package, Bell, LifeBuoy, MessageSquare, Layers, Cpu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/lib/i18n/useTranslation';

interface NavItem {
  label: string;
  path: string;
  badge?: string;
  disabled?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

export default function AdminSidebar({ className }: { className?: string }) {
  const { adminUser, logout } = useAdminAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const isRTL = locale === 'ar';
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const handleToggle = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggleAdminSidebar', handleToggle);
    return () => window.removeEventListener('toggleAdminSidebar', handleToggle);
  }, []);


  const getIsActive = (path: string) => {
    const isBasePage = pathname.split('/').filter(Boolean).length === 1;
    if (path.startsWith('?tab=')) {
      const tabName = path.split('=')[1];
      return isBasePage && currentTab === tabName;
    }
    if (path === '') {
      return isBasePage && currentTab === 'overview';
    }
    // Exact segment matching: split both paths and compare
    const pathSegments = path.split('/').filter(Boolean);
    const pathnameSegments = pathname.split('/').filter(Boolean);
    // The admin base segment is 'admin-secure-internal'
    const adminBase = pathnameSegments.findIndex((s) => s === 'admin-secure-internal');
    if (adminBase === -1) return false;
    const relativeSegments = pathnameSegments.slice(adminBase + 1);
    if (pathSegments.length === 0) return relativeSegments.length === 0;
    // Compare segments position by position up to the path length
    if (pathSegments.length > relativeSegments.length) return false;
    return pathSegments.every((seg, i) => relativeSegments[i] === seg) &&
      relativeSegments.length === pathSegments.length;
  };

  const navGroups: NavGroup[] = [
    // 1. Overview & Analytics
    {
      id: 'overview',
      title: locale === 'ar' ? 'المؤشرات والتقارير' : (locale === 'fr' ? 'Tableau de bord et rapports' : (locale === 'es' ? 'Panel e informes' : 'Overview & Analytics')),
      icon: LayoutDashboard,
      items: [
        { label: t('admin.dashboardOverview'), path: '' },
        { label: t('admin.revenueReports'), path: 'billing/revenue' },
        { 
          label: locale === 'ar' ? 'التحليلات المتقدمة' : (locale === 'fr' ? 'Analyses avancées' : (locale === 'es' ? 'Analítica avanzada' : 'Advanced Analytics')), 
          path: 'analytics', 
          disabled: true, 
          badge: locale === 'ar' ? 'قريباً' : 'Soon' 
        },
      ]
    },
    // 2. Products Catalog
    {
      id: 'products',
      title: locale === 'ar' ? 'كتالوج المنتجات' : (locale === 'fr' ? 'Catalogue de produits' : (locale === 'es' ? 'Catálogo de productos' : 'Products Catalog')),
      icon: Package,
      items: [
        { label: locale === 'ar' ? 'أفضل المنتجات مبيعاً' : (locale === 'fr' ? 'Meilleures ventes' : (locale === 'es' ? 'Más vendidos' : 'Top Selling Products')), path: '?tab=products' },
        { label: locale === 'ar' ? '⏳ مراجعة وقبول المنتجات' : (locale === 'fr' ? '⏳ Approbation des produits' : (locale === 'es' ? '⏳ Aprobación de productos' : '⏳ Product Approvals')), path: 'products/approvals' },
        { label: t('admin.manageCategories'), path: 'categories' },
        { label: t('admin.manageBrands'), path: 'brands' },
        { label: locale === 'ar' ? 'مواصفات المنتجات' : (locale === 'fr' ? 'Spécifications des produits' : (locale === 'es' ? 'Especificaciones de productos' : 'Product Specs')), path: 'products/spec-definitions' },
        { label: locale === 'ar' ? 'إعدادات وخصائص المنتجات' : (locale === 'fr' ? 'Paramètres des produits' : (locale === 'es' ? 'Configuración de productos' : 'Product Settings')), path: 'products/settings' },
      ]
    },
    // 3. Orders & Operations
    {
      id: 'orders',
      title: locale === 'ar' ? 'الطلبات والعمليات' : (locale === 'fr' ? 'Commandes et opérations' : (locale === 'es' ? 'Pedidos y operaciones' : 'Orders & Operations')),
      icon: ShoppingCart,
      items: [
        { label: t('admin.fulfilledOrders'), path: '?tab=orders' },
        { label: t('admin.orderStatuses'), path: '?tab=order-statuses' },
        { 
          label: locale === 'ar' ? 'النزاعات والمرتجعات' : (locale === 'fr' ? 'Litiges et retours' : (locale === 'es' ? 'Disputas y devoluciones' : 'Disputes & Returns')), 
          path: 'disputes', 
          disabled: true, 
          badge: locale === 'ar' ? 'قريباً' : 'Soon' 
        },
      ]
    },
    // 4. Merchants & Accounts
    {
      id: 'accounts',
      title: locale === 'ar' ? 'شبكة التجار والحسابات' : (locale === 'fr' ? 'Commerçants et comptes' : (locale === 'es' ? 'Comerciantes y cuentas' : 'Merchants & Accounts')),
      icon: Users,
      items: [
        { label: t('admin.storesSellers'), path: 'stores' },
        { label: locale === 'ar' ? 'توثيق المتاجر (KYC/KYB)' : (locale === 'fr' ? 'Vérification KYC/KYB' : (locale === 'es' ? 'Verificación KYC/KYB' : 'KYC/KYB Verification')), path: 'verifications' },
        { label: locale === 'ar' ? 'سجل تدقيق التوثيق' : (locale === 'fr' ? 'Journal d\'audit KYC' : (locale === 'es' ? 'Registro de auditoría KYC' : 'Audit Trail')), path: 'verifications/audit' },
        { label: locale === 'ar' ? 'طلبات ترقية الأعمال' : (locale === 'fr' ? 'Demandes de mise à niveau' : (locale === 'es' ? 'Solicitudes de mejora' : 'Business Upgrades')), path: 'upgrade-requests' },
        { label: locale === 'ar' ? 'إدارة المستخدمين والزبائن' : (locale === 'fr' ? 'Gestion des utilisateurs' : (locale === 'es' ? 'Gestión de usuarios' : 'User Management')), path: 'users' },
      ]
    },
    // 5. Finance & Billing
    {
      id: 'finance',
      title: t('admin.financeSubscriptions'),
      icon: Wallet,
      items: [
        { label: t('admin.paymentMethods', 'طرق الدفع'), path: 'payment-methods' },
        { label: locale === 'ar' ? 'محرك بوابات الدفع' : (locale === 'fr' ? 'Moteur de paiement' : (locale === 'es' ? 'Motor de pago' : 'Payment Engine')), path: 'billing/payment-engine' },
        { label: t('admin.commissionSettings'), path: 'billing/settings' },
        { label: t('admin.subscriptionPackages'), path: 'billing/packages' },
        { label: t('admin.merchantsSubscriptions'), path: 'billing/merchants' },
        { label: t('admin.walletsDebts'), path: 'billing/wallets' },
        { label: t('admin.payoutRequests'), path: 'billing/withdrawals' },
        { label: t('admin.reviewReceipts'), path: 'billing/receipts' },
      ]
    },
    // 6. Logistics & Fulfillment
    {
      id: 'logistics',
      title: locale === 'ar' ? 'اللوجستيات والشحن' : (locale === 'fr' ? 'Logistique et expédition' : (locale === 'es' ? 'Logística y envíos' : 'Logistics & Shipping')),
      icon: Truck,
      items: [
        { label: locale === 'ar' ? 'مركز اللوجستيات والمناطق' : (locale === 'fr' ? 'Centre logistique' : (locale === 'es' ? 'Centro logístico' : 'Logistics Hub')), path: 'logistics' },
        { label: locale === 'ar' ? 'تسويات 3PL' : (locale === 'fr' ? 'Règlements 3PL' : (locale === 'es' ? 'Liquidaciones 3PL' : '3PL Settlements')), path: 'logistics/settlements' },
        { label: locale === 'ar' ? 'إدارة المناطق والولايات' : (locale === 'fr' ? 'Gestion des régions' : (locale === 'es' ? 'Gestión de regiones' : 'States & Regions')), path: 'shipping' },
      ]
    },
    // 7. Communications & Alerts
    {
      id: 'communications',
      title: locale === 'ar' ? 'الإشعارات والتواصل' : (locale === 'fr' ? 'Communications et alertes' : (locale === 'es' ? 'Comunicaciones y alertas' : 'Communications & Alerts')),
      icon: Bell,
      items: [
        { label: locale === 'ar' ? '📢 مركز الإشعارات والتنبيهات' : (locale === 'fr' ? '📢 Centre de notifications' : (locale === 'es' ? '📢 Centro de notificaciones' : '📢 Notifications & Alerts')), path: 'notifications' },
        { label: t('admin.manageAdvertisements'), path: 'advertisements' },
      ]
    },
    // 8. Support & Operations
    {
      id: 'support',
      title: locale === 'ar' ? 'الدعم والعمليات' : (locale === 'fr' ? 'Support et opérations' : (locale === 'es' ? 'Soporte y operaciones' : 'Support & Operations')),
      icon: LifeBuoy,
      items: [
        { label: locale === 'ar' ? 'استئنافات تعليق الحسابات' : (locale === 'fr' ? 'Recours de suspension' : (locale === 'es' ? 'Apelaciones de suspensión' : 'Suspension Appeals')), path: 'appeals' },
        { 
          label: locale === 'ar' ? 'تذاكر ومراسلات الدعم' : (locale === 'fr' ? 'Tickets d\'assistance' : (locale === 'es' ? 'Tickets de soporte' : 'Support Tickets & Chat')), 
          path: 'support', 
          disabled: true, 
          badge: locale === 'ar' ? 'قريباً' : 'Soon' 
        },
      ]
    },
    // 9. Content & Community
    {
      id: 'community',
      title: locale === 'ar' ? 'المحتوى والمجتمع' : (locale === 'fr' ? 'Contenu et communauté' : (locale === 'es' ? 'Contenido y comunidad' : 'Content & Community')),
      icon: MessageSquare,
      items: [
        { 
          label: locale === 'ar' ? 'تقييمات وآراء العملاء' : (locale === 'fr' ? 'Avis des clients' : (locale === 'es' ? 'Reseñas de clientes' : 'Customer Reviews')), 
          path: 'reviews', 
          disabled: true, 
          badge: locale === 'ar' ? 'قريباً' : 'Soon' 
        },
        { 
          label: locale === 'ar' ? 'أسئلة وأجوبة المنتجات' : (locale === 'fr' ? 'Questions et réponses' : (locale === 'es' ? 'Preguntas y respuestas' : 'Product Q&A')), 
          path: 'product-qa', 
          disabled: true, 
          badge: locale === 'ar' ? 'قريباً' : 'Soon' 
        },
      ]
    },
    // 10. Security & Access Control
    {
      id: 'security',
      title: t('security.section_title', 'Security & Access'),
      icon: ShieldAlert,
      items: [
        { label: locale === 'ar' ? 'أمان حسابي الشخصي' : (locale === 'fr' ? 'Sécurité de mon compte' : (locale === 'es' ? 'Seguridad de mi cuenta' : 'My Account Security')), path: 'security/my-account' },
        { label: locale === 'ar' ? 'الإجراءات الحساسة المعلقة' : (locale === 'fr' ? 'Actions sensibles en attente' : (locale === 'es' ? 'Acciones pendientes' : 'Pending Actions')), path: 'security/pending-actions' },
        { label: locale === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : (locale === 'fr' ? 'Rôles et permissions' : (locale === 'es' ? 'Roles y permisos' : 'Roles & Permissions')), path: 'security/roles' },
        { label: t('security.auth_logs', 'Auth Logs'), path: 'security/auth-logs' },
        { label: locale === 'ar' ? 'الجلسات النشطة والأجهزة' : (locale === 'fr' ? 'Sessions actives' : (locale === 'es' ? 'Sesiones activas' : 'Active Sessions')), path: 'security/sessions' },
        { label: t('security.ban_list', 'Ban List'), path: 'security/bans' },
        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول (OTP)' : (locale === 'fr' ? 'Authentification et OTP' : (locale === 'es' ? 'Autenticación y OTP' : 'Auth & OTP')), path: 'settings/otp' },
        { label: locale === 'ar' ? 'إعدادات الأمان المتقدمة' : (locale === 'fr' ? 'Sécurité avancée' : (locale === 'es' ? 'Seguridad avanzada' : 'Advanced Security')), path: 'security/settings' },
      ]
    },
    // 11. CMS & Storefront
    {
      id: 'cms',
      title: locale === 'ar' ? 'المحتوى والواجهة (CMS)' : (locale === 'fr' ? 'Contenu et vitrine (CMS)' : (locale === 'es' ? 'Contenido y escaparate' : 'CMS & Storefront')),
      icon: Layers,
      items: [
        { label: locale === 'ar' ? 'تصميم وإدارة الواجهة الرئيسية' : (locale === 'fr' ? 'Gestion de la page d\'accueil' : (locale === 'es' ? 'Gestión de página principal' : 'Homepage Storefront')), path: 'settings/homepage' },
        { label: 'SAADA Builder', path: 'cms/saada-builder' },
        { label: locale === 'ar' ? 'كتل وقوالب التنسيق' : (locale === 'fr' ? 'Blocs de mise en page' : (locale === 'es' ? 'Bloques de diseño' : 'Layout Blocks')), path: 'cms/layout-blocks' },
        { label: locale === 'ar' ? 'إدارة الصفحات المخصصة' : (locale === 'fr' ? 'Pages personnalisées' : (locale === 'es' ? 'Páginas personalizadas' : 'Custom Pages')), path: 'pages' },
        { label: t('admin.manageDocs'), path: 'cms/docs' },
        { label: locale === 'ar' ? 'متجر الإضافات (App Store)' : (locale === 'fr' ? 'Gestionnaire de plugins' : (locale === 'es' ? 'Gestor de complementos' : 'Plugin Manager')), path: 'plugins' },
      ]
    },
    // 12. Platform Settings
    {
      id: 'platform',
      title: t('admin.platformSettings'),
      icon: Settings,
      items: [
        { label: t('admin.generalSettings'), path: 'settings' },
        { label: t('admin.themeDesign'), path: 'settings/theme' },
        { label: t('admin.manageTranslations'), path: 'settings/translations' },
        { label: locale === 'ar' ? 'إعدادات الهيدر والفوتر' : (locale === 'fr' ? 'En-tête et pied de page' : (locale === 'es' ? 'Encabezado y pie de página' : 'Header & Footer Settings')), path: 'settings/header-footer' },
        { label: locale === 'ar' ? 'إعدادات القائمة الرئيسية' : (locale === 'fr' ? 'Menu principal' : (locale === 'es' ? 'Menú principal' : 'Main Menu')), path: 'settings/menu' },
        { label: t('admin.globalCoupons'), path: 'coupons' },
        { label: locale === 'ar' ? 'إعدادات الخرائط والمواقع' : (locale === 'fr' ? 'Paramètres des cartes' : (locale === 'es' ? 'Configuración de mapas' : 'Maps Settings')), path: 'settings/maps' },
        { label: t('admin.featureFlags'), path: 'flags' },
      ]
    },
    // 13. Advanced Tools & AI Labs
    {
      id: 'tools',
      title: locale === 'ar' ? 'الأدوات والذكاء الاصطناعي' : (locale === 'fr' ? 'Outils avancés et IA' : (locale === 'es' ? 'Herramientas avancadas e IA' : 'Advanced Tools & AI')),
      icon: Cpu,
      items: [
        { label: locale === 'ar' ? 'مختبر سحب البيانات (OCR)' : (locale === 'fr' ? 'Bac à sable OCR' : (locale === 'es' ? 'Entorno de pruebas OCR' : 'OCR Sandbox')), path: 'ocr-sandbox' },
      ]
    }
  ];

  useEffect(() => {
    // Find group containing currently active item, default to overview if on root
    const activeGroup = navGroups.find(g => g.items.some(i => !i.disabled && getIsActive(i.path)));
    const activeGroupTitle = activeGroup?.title || navGroups[0].title;
    
    const initialCollapsed: Record<string, boolean> = {};
    navGroups.forEach(g => {
      // Strict single-open: ONLY the active group is open, all others are collapsed!
      initialCollapsed[g.title] = g.title !== activeGroupTitle;
    });
    setCollapsedSections(initialCollapsed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentTab]);

  const toggleSection = (sectionTitle: string) => {
    if (isCollapsed) return;
    setCollapsedSections(prev => {
      const isCurrentlyOpen = !(prev[sectionTitle] ?? true);
      const newCollapsed: Record<string, boolean> = {};
      // Strict accordion: close all sections
      navGroups.forEach(g => {
        newCollapsed[g.title] = true;
      });
      // If it was open, close it (all closed). If it was closed, open only this one.
      newCollapsed[sectionTitle] = isCurrentlyOpen;
      return newCollapsed;
    });
  };

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const initials = adminUser?.name
    ? adminUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const themeBg = '#1a2332'; // Gentelella Admin Signature Color

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const CloseIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 bottom-0 z-[9999] lg:z-auto flex flex-col font-sans',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:h-screen text-[#94a3b8]',
          isSidebarOpen ? 'start-0 w-[var(--sidebar-width)]' : '-start-[280px] w-[var(--sidebar-width)]',
          'lg:start-0',
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[var(--sidebar-width)]',
          className
        )}
        style={{ backgroundColor: themeBg }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 h-[72px] shrink-0 border-b border-white/5 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1ABB9C] text-white font-bold text-lg shrink-0 shadow-[0_0_15px_rgba(26,187,156,0.3)]">
            A
          </div>
          <div className={cn("flex flex-col transition-opacity duration-300", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            <span className="text-white text-lg font-bold tracking-wide">
              {t('admin.title')}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* User Profile Info */}
          <div className={cn("flex items-center gap-3 p-4", isCollapsed ? "justify-center" : "")}>
            <div className="relative shrink-0">
              <div className={cn("rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20", isCollapsed ? "h-10 w-10" : "h-14 w-14", "bg-[#1ABB9C]")}>
                {initials}
              </div>
            </div>
            <div className={cn("flex flex-col flex-1 min-w-0 transition-opacity", isCollapsed ? "hidden opacity-0" : "opacity-100")}>
              <span className="text-[13px] text-[#BAB8B8]">{t('common.welcome')}</span>
              <span className="text-[15px] font-semibold text-[#E7E7E7] truncate">{adminUser?.name || 'Admin'}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/10 shrink-0"
              aria-label={isRTL ? 'إغلاق' : 'Close'}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full h-px bg-white/5 mb-2" />

          {/* Sidebar Menu */}
          <div className="flex-1 py-4">
            <nav className={cn("flex flex-col w-full space-y-1.5", isCollapsed ? "px-2" : "px-3")}>
              {navGroups.map((group, gIdx) => {
                const isSectionCollapsed = collapsedSections[group.title] ?? true;
                const isOpen = !isSectionCollapsed;
                const isGroupActive = group.items.some(item => getIsActive(item.path));
                const Icon = group.icon;

                return (
                  <div key={group.id} className="relative group">
                    <button
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={() => toggleSection(group.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none relative text-start',
                        isGroupActive
                          ? 'text-white font-semibold' 
                          : isOpen && !isCollapsed
                            ? 'text-white'
                            : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? group.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-[20px] w-[20px] shrink-0 transition-colors",
                          isGroupActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                        )} strokeWidth={isGroupActive ? 2.5 : 2} />
                        <span className={cn("text-start transition-opacity truncate", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                          {group.title}
                        </span>
                      </div>

                      {!isCollapsed && (
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 opacity-50",
                          isOpen && (isRTL ? "rotate-90" : "-rotate-90")
                        )} />
                      )}

                      {/* Active indicator line like gentelella v4 */}
                      {isGroupActive && isCollapsed && (
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1ABB9C] rounded-full",
                          isRTL ? "right-0" : "left-0"
                        )} />
                      )}
                    </button>

                    {/* Nested Children Accordion */}
                    {!isCollapsed && (
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                      )}>
                        <ul className={cn(
                          "relative flex flex-col gap-1 py-1",
                          isRTL ? "pr-9" : "pl-9"
                        )}>
                          {/* Vertical line connector */}
                          <div className={cn(
                            "absolute top-0 bottom-0 w-px bg-white/10",
                            isRTL ? "right-5" : "left-5"
                          )} />

                          {group.items.map((item) => {
                            const isActive = !item.disabled && getIsActive(item.path);

                            if (item.disabled) {
                              return (
                                <li key={item.path} className="relative">
                                  <div
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] text-[#94a3b8]/40 cursor-not-allowed select-none relative text-start"
                                    title={item.badge}
                                  >
                                    <span className="truncate">{item.label}</span>
                                    {item.badge && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            }

                            return (
                              <li key={item.path} className="relative">
                                <Link
                                  dir={isRTL ? 'rtl' : 'ltr'}
                                  href={getAdminPath(item.path)}
                                  className={cn(
                                    "w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] transition-colors relative text-start",
                                    isActive ? "text-white font-semibold" : "text-[#94a3b8]/70 hover:text-white hover:bg-white/5"
                                  )}
                                >
                                  {/* Horizontal line connector for active item */}
                                  {isActive && (
                                    <div className={cn(
                                      "absolute top-1/2 -translate-y-1/2 w-3 h-px bg-[#1ABB9C]",
                                      isRTL ? "-right-4" : "-left-4"
                                    )} />
                                  )}
                                  <span className="truncate">{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Hover tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100]",
                        isRTL ? "right-[110%] -translate-x-2 group-hover:translate-x-0" : "left-[110%] translate-x-2 group-hover:translate-x-0"
                      )}>
                        <div className="bg-white text-[#1e293b] text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
                          {group.title}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Gentelella Footer Icons */}
        <div className={cn(
          "shrink-0 bg-[#171f2d] flex mt-auto",
          isCollapsed ? "hidden" : ""
        )}>
          <Link 
            href={getAdminPath('settings')}
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            onClick={toggleFullScreen}
          >
            <Monitor className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
          >
            <KeyRound className="h-[18px] w-[18px]" />
          </button>
          <button 
            onClick={() => { logout(); window.location.reload(); }}
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-red-400 transition-colors hover:bg-[#1a2332]"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>
    </>
  );
}
