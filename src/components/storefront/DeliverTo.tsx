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
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  const handleSelect = (code: string, name: string) => {
    setLocation({ country: code, city: name }); // Simplified, sets city to country name initially
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 hover:border-white border border-transparent p-1 rounded transition-colors text-sm">
          <MapPin className="w-4 h-4" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-muted-foreground opacity-80">التوصيل إلى</span>
            <span className="font-bold">{currentCountry?.name || 'اختر موقعك'}</span>
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>اختر موقعك</DialogTitle>
          <DialogDescription>
            تحديد موقعك يتيح لنا عرض خيارات التوصيل والمنتجات المتاحة في منطقتك بدقة.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-2 py-4">
          {COUNTRIES.map((c) => (
            <Button
              key={c.code}
              variant={country === c.code ? 'default' : 'outline'}
              className="justify-start w-full text-right font-normal"
              onClick={() => handleSelect(c.code, c.name)}
            >
              {c.name}
              {country === c.code && <Check className="w-4 h-4 mr-auto" />}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
