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
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  const { t, locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [flags, setFlags] = useState<any>({});
  const [settings, setSettings] = useState<any>({});

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
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

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
        <button className="flex items-center gap-1 hover:border-white border border-transparent p-1 rounded transition-colors text-sm text-white">
          <MapPin className="w-4 h-4" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-white/80">{t(locale, 'التوصيل إلى', 'Deliver to')}</span>
            <span className="font-bold">{city || currentCountry?.name || t(locale, 'اختر موقعك', 'Choose location')}</span>
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className={showMap ? "sm:max-w-[700px] h-[80vh] flex flex-col" : "sm:max-w-[425px]"} dir={dir}>
        <DialogHeader>
          <DialogTitle>{t(locale, 'اختر موقعك', 'Choose your location')}</DialogTitle>
          <DialogDescription>
            {t(locale, 'تحديد موقعك يتيح لنا عرض خيارات التوصيل والمنتجات المتاحة في منطقتك بدقة.', 'Setting your location allows us to accurately show delivery options and products available in your area.')}
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
