'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useLocationStore } from '@/lib/store/locationStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LocationMap from '@/components/ui/LocationMap';
import { useAppStore, useAuthStore } from '@/lib/store';

// Mock list of countries, ideally fetched from DB or i18n
const COUNTRIES = [
  { code: 'SA', name: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: 'AE', name: 'الإمارات', nameEn: 'UAE' },
  { code: 'KW', name: 'الكويت', nameEn: 'Kuwait' },
  { code: 'DZ', name: 'الجزائر', nameEn: 'Algeria' },
  { code: 'EG', name: 'مصر', nameEn: 'Egypt' },
];

export default function DeliverTo() {
  const { country, city, setLocation } = useLocationStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [flags, setFlags] = useState<any>({});
  const [settings, setSettings] = useState<any>({});

  const { user, isAuthenticated } = useAuthStore();
  const [userAddress, setUserAddress] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch flags and settings
    Promise.all([
      fetch('/api/admin/flags').then(res => res.json()),
      fetch('/api/admin/settings').then(res => res.json())
    ]).then(([flagsData, settingsData]) => {
      if (flagsData.success) setFlags(flagsData.flags);
      if (settingsData.success) setSettings(settingsData.settings);
    }).catch(console.error);

    if (isAuthenticated && user) {
      fetch('/api/buyer/addresses').then(res => res.json()).then(data => {
        if (data.success && data.addresses?.length > 0) {
          const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          setUserAddress(defaultAddr);
          if (!city && defaultAddr.city) {
            setLocation({ country: defaultAddr.country || 'DZ', city: defaultAddr.city });
          }
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, user, city, setLocation]);

  if (!mounted) return null; // Prevent hydration mismatch

  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES.find((c) => c.code === 'DZ');

  const handleSelect = (code: string, name: string) => {
    setLocation({ country: code, city: name }); // Simplified, sets city to country name initially
    setIsOpen(false);
  };

  const handleLocationSelect = (location: any) => {
    setLocation({ country: location.country, city: location.city });
    setIsOpen(false);
  };

  const showMap = flags.flag_enable_google_maps;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 hover:border-border border border-transparent p-1 rounded transition-colors text-sm text-foreground">
          <MapPin className="w-4 h-4" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-muted-foreground">{t('التوصيل إلى', 'Deliver to')}</span>
            <span className="font-bold max-w-[120px] truncate">
              {userAddress?.street ? userAddress.street : (city || currentCountry?.name || t('اختر موقعك', 'Choose location'))}
            </span>
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className={showMap ? "sm:max-w-[700px] h-[80vh] flex flex-col" : "sm:max-w-[425px]"} dir={dir}>
        <DialogHeader>
          <DialogTitle>{t('اختر موقعك', 'Choose your location')}</DialogTitle>
          <DialogDescription>
            {t('تحديد موقعك يتيح لنا عرض خيارات التوصيل والمنتجات المتاحة في منطقتك بدقة.', 'Setting your location allows us to accurately show delivery options and products available in your area.')}
          </DialogDescription>
        </DialogHeader>
        
        {showMap ? (
          <div className="flex-1 min-h-0 mt-4 rounded-xl overflow-hidden border">
            <LocationMap 
              apiKey={settings.google_maps_api_key} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>
        ) : (
          <div className="grid gap-2 py-4">
            {COUNTRIES.map((c) => (
              <Button
                key={c.code}
                variant={country === c.code ? 'default' : 'outline'}
                className="justify-start w-full text-right font-normal"
                onClick={() => handleSelect(c.code, locale === 'ar' ? c.name : c.nameEn)}
              >
                {locale === 'ar' ? c.name : c.nameEn}
                {country === c.code && <Check className="w-4 h-4 mr-auto ml-0" />}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
