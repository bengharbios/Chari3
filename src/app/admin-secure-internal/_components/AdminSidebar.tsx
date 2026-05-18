'use client';

import React, { useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { 
  LayoutDashboard, 
  Settings, 
  Sliders, 
  ToggleRight, 
  ChevronRight, 
  ChevronLeft,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminSidebar() {
  const { adminLocale } = useAdminAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isRTL = adminLocale === 'ar';

  const dict = {
    ar: {
      dashboard: "لوحة التحكم",
      settings: "الإعدادات العامة",
      cms: "إدارة الواجهة (CMS)",
      flags: "مفاتيح الميزات",
      collapse: "طي القائمة",
      expand: "توسيع",
      title: "الإدارة"
    },
    en: {
      dashboard: "Dashboard",
      settings: "General Settings",
      cms: "Storefront CMS",
      flags: "Feature Flags",
      collapse: "Collapse",
      expand: "Expand",
      title: "Admin Panel"
    }
  };

  const t = dict[adminLocale] || dict.ar;

  // Base path for admin
  // This helps us keep active states working regardless of the secret slug!
  const getIsActive = (path: string) => {
    // If it's the root admin page
    if (path === '' && (pathname.endsWith('admin-secure-internal') || !pathname.includes('/settings'))) {
      return true;
    }
    return pathname.includes(path) && path !== '';
  };

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: t.dashboard, 
      path: '', 
      color: 'text-blue-500' 
    },
    { 
      icon: Settings, 
      label: t.settings, 
      path: 'settings', 
      color: 'text-amber-500' 
    },
    { 
      icon: Sliders, 
      label: t.cms, 
      path: 'cms', 
      color: 'text-emerald-500' 
    },
    { 
      icon: ToggleRight, 
      label: t.flags, 
      path: 'flags', 
      color: 'text-red-500' 
    },
  ];

  return (
    <div 
      className={`relative h-screen bg-navy text-white transition-all duration-300 ease-in-out flex flex-col z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden lg:flex`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        {!isCollapsed && (
          <span className="font-bold text-lg text-brand">{t.title}</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-slate-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : isRTL ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = getIsActive(item.path);
          
          return (
            <Link 
              key={item.path} 
              href={item.path === '' ? '.' : `./${item.path}`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-brand text-navy font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-navy' : item.color} group-hover:scale-110 transition-transform`} />
              
              {!isCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              
              {isCollapsed && (
                <div className={`absolute ${isRTL ? 'right-24' : 'left-24'} bg-white text-navy text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none whitespace-nowrap`}>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Info */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        {!isCollapsed ? (
          <p className="text-center">ChariDay v2.0</p>
        ) : (
          <p className="text-center">v2</p>
        )}
      </div>
    </div>
  );
}
