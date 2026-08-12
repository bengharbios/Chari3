'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { Loader2, PackageSearch, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom';
  label: string;
  url: string;
  imageUrl?: string;
  children: MenuItem[];
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

export default function PublicMenu() {
  const { t, isAr } = useTranslation();
  const [config, setConfig] = useState<MenuWrapper | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menuConfig) {
          setConfig(data.menuConfig);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-12 flex items-center justify-center border-t border-border/50 bg-background/50"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  }

  if (!config || !config.items || config.items.length === 0) return null;

  const alignmentClass = 
    config.alignment === 'start' ? 'justify-start' : 
    config.alignment === 'end' ? 'justify-end' : 'justify-center';

  const fontFamilyStyle = config.fontFamily ? { fontFamily: config.fontFamily } : {};

  // Framer Motion Variants
  const menuVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98, transition: { duration: 0.2, ease: "easeInOut" } },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
        staggerChildren: 0.05
      } 
    },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: "easeInOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isAr ? 20 : -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="w-full hidden md:block pt-3 pb-2 z-[100] relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-platform relative" style={fontFamilyStyle}>
        
        {/* Floating Navbar Pill */}
        <div className={cn(
          "mx-auto flex h-14 items-center px-4 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-lg transition-all",
          alignmentClass
        )}>
          <ul className="flex items-center gap-2 relative h-full" onMouseLeave={() => setHoveredIndex(null)}>
            {config.items.map((item, idx) => {
              const hasDropdown = item.type !== 'standard' || (item.children && item.children.length > 0);
              const isActive = hoveredIndex === idx;

              return (
                <li 
                  key={item.id} 
                  className="relative h-full flex items-center px-4"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  {/* Aceternity Style Hover Background */}
                  {isActive && (
                    <motion.div
                      layoutId="navHoverBackground"
                      className="absolute inset-0 bg-muted/80 rounded-xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.2 } }}
                      exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
                    />
                  )}

                  <Link href={item.url} className={cn(
                    "text-sm font-semibold transition-colors flex items-center gap-1 z-10",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {t(item.label)}
                    {hasDropdown && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", isActive && "rotate-180")} />}
                  </Link>

                  {/* Dropdowns rendered with AnimatePresence */}
                  <AnimatePresence>
                    {isActive && hasDropdown && (
                      <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                          "absolute top-[calc(100%+12px)] bg-background/95 backdrop-blur-xl border border-border/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden z-50",
                          item.type === 'standard' ? "w-[240px] start-0" : "start-0 end-0 w-full min-w-[800px] xl:min-w-[1000px] left-1/2 -translate-x-1/2",
                          (item.type === 'categories-grid' || item.type === 'mega-custom') && "fixed left-0 right-0 mx-auto max-w-7xl px-4" // Force mega menus to be container width
                        )}
                        style={
                          (item.type === 'categories-grid' || item.type === 'mega-custom') 
                            ? { position: 'absolute', left: 0, right: 0 } // Span full parent width
                            : {}
                        }
                      >
                        {/* 1. Standard Dropdown */}
                        {item.type === 'standard' && (
                          <div className="py-2 flex flex-col">
                            {item.children.map(child => (
                              <Link key={child.id} href={child.url} className="px-5 py-3 hover:bg-muted/50 text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
                                {t(child.label)}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* 2. Auto Categories Grid (Staggered Animation) */}
                        {item.type === 'categories-grid' && (
                          <div className="p-8 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                            {categories.map((cat, i) => (
                              <motion.div key={cat.id} variants={itemVariants} custom={i}>
                                <Link href={`/search?category=${cat.id}`} className="flex flex-col items-center gap-3 group/cat p-3 rounded-2xl hover:bg-muted/50 transition-all">
                                  <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                    className="w-20 h-20 rounded-full overflow-hidden border border-border/50 shadow-sm flex items-center justify-center bg-background relative z-10"
                                  >
                                    {cat.image ? (
                                      <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="80px" />
                                    ) : (
                                      <PackageSearch className="w-8 h-8 text-muted-foreground/40" />
                                    )}
                                  </motion.div>
                                  <span className="text-xs text-center font-bold text-muted-foreground group-hover/cat:text-primary transition-colors line-clamp-2">
                                    {t(cat.name)}
                                  </span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* 3. Custom Mega Menu with Banner */}
                        {item.type === 'mega-custom' && (
                          <div className="p-8 flex gap-10">
                            <div className="flex-1">
                              <motion.h3 variants={itemVariants} className="text-xl font-bold mb-6 border-b pb-4 text-primary">{t(item.label)}</motion.h3>
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                {item.children.map(child => (
                                  <motion.div key={child.id} variants={itemVariants}>
                                    <Link href={child.url} className="flex items-center gap-3 group/child p-3 rounded-xl hover:bg-muted/50 transition-all">
                                      <div className="w-2 h-2 rounded-full bg-primary/20 group-hover/child:bg-primary group-hover:scale-125 transition-all" />
                                      <span className="text-sm font-medium text-muted-foreground group-hover/child:text-primary transition-colors">{t(child.label)}</span>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            {item.imageUrl && (
                              <motion.div 
                                variants={itemVariants}
                                className="w-[300px] lg:w-[450px] shrink-0 rounded-2xl overflow-hidden shadow-xl relative group/banner border border-border/40"
                              >
                                <Image src={item.imageUrl} alt="Banner" fill className="object-cover transition-transform duration-[1.5s] group-hover/banner:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                  <motion.span 
                                    initial={{ y: 20, opacity: 0 }}
                                    whileHover={{ y: 0, opacity: 1 }}
                                    className="text-white/80 text-sm mb-2"
                                  >
                                    {t('عروض حصرية', 'Exclusive Offers')}
                                  </motion.span>
                                  <span className="text-white font-bold text-2xl drop-shadow-lg flex items-center gap-2">
                                    {t('اكتشف المزيد', 'Discover More')} 
                                    <span className="transition-transform group-hover/banner:translate-x-2 (isAr ? '-translate-x-2' : '')">→</span>
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
