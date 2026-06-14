'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card as TremorCard } from '@tremor/react';
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LocationMap from '@/components/ui/LocationMap';

interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  isDefault: boolean;
  lat: number | null;
  lng: number | null;
}

export default function BuyerAddresses() {
  const { t, locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const { user } = useAuthStore();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Address>>({
    label: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'DZ',
    isDefault: false,
    lat: null,
    lng: null
  });

  useEffect(() => {
    if (!user) return;
    fetchAddresses();
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings?.google_maps_api_key) {
        setMapsApiKey(data.settings.google_maps_api_key);
      }
    } catch {}
  };

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/buyer/addresses');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch {
      toast.error(t(locale, 'فشل في تحميل العناوين', 'Failed to load addresses'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: any) => {
    setFormData(prev => ({
      ...prev,
      lat: location.lat,
      lng: location.lng,
      street: location.address,
      city: location.city,
      state: location.state,
      country: location.country
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city) {
      toast.error(t(locale, 'يرجى تعبئة الحقول الإلزامية', 'Please fill in required fields'));
      return;
    }
    setIsSaving(true);
    try {
      const url = formData.id ? `/api/buyer/addresses/${formData.id}` : '/api/buyer/addresses';
      const method = formData.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(t(locale, 'تم حفظ العنوان بنجاح', 'Address saved successfully'));
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t(locale, 'حدث خطأ أثناء الحفظ', 'Error saving address'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t(locale, 'هل أنت متأكد من حذف هذا العنوان؟', 'Are you sure you want to delete this address?'))) return;
    try {
      const res = await fetch(`/api/buyer/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t(locale, 'تم الحذف', 'Deleted successfully'));
        fetchAddresses();
      }
    } catch {
      toast.error(t(locale, 'فشل في الحذف', 'Failed to delete'));
    }
  };

  const openNewModal = () => {
    setFormData({
      label: '',
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'DZ',
      isDefault: addresses.length === 0,
      lat: null,
      lng: null
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{t(locale, 'عناويني', 'My Addresses')}</h3>
        <Button onClick={openNewModal} className="gap-2">
          <Plus className="w-4 h-4" />
          {t(locale, 'إضافة عنوان جديد', 'Add New Address')}
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden" dir={dir}>
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>
              {formData.id ? t(locale, 'تعديل العنوان', 'Edit Address') : t(locale, 'إضافة عنوان جديد', 'Add New Address')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">{t(locale, 'اسم المستلم*', 'Recipient Name*')}</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">{t(locale, 'رقم الجوال*', 'Phone Number*')}</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">{t(locale, 'المدينة*', 'City*')}</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">{t(locale, 'الشارع / العنوان التفصيلي*', 'Street / Detailed Address*')}</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand resize-none h-20"
                  value={formData.street} 
                  onChange={e => setFormData({...formData, street: e.target.value})} 
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={formData.isDefault}
                  onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                  className="w-4 h-4 text-brand"
                />
                <label htmlFor="isDefault" className="text-sm font-bold cursor-pointer">
                  {t(locale, 'تعيين كعنوان افتراضي', 'Set as default address')}
                </label>
              </div>
            </div>
            
            {/* Map Section */}
            <div className="flex-1 flex flex-col min-h-[300px] border rounded-lg overflow-hidden">
              <div className="p-2 bg-muted text-xs text-center font-semibold">
                {t(locale, 'حدد موقعك الدقيق على الخريطة', 'Pin your exact location on the map')}
              </div>
              <div className="flex-1 w-full relative">
                <LocationMap 
                  apiKey={mapsApiKey}
                  defaultLat={formData.lat || undefined}
                  defaultLng={formData.lng || undefined}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-3 bg-muted/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t(locale, 'إلغاء', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {t(locale, 'حفظ العنوان', 'Save Address')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : addresses.length === 0 ? (
        <div className="text-center p-8 border rounded-xl bg-muted/30">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground font-semibold">{t(locale, 'لا توجد عناوين محفوظة', 'No saved addresses')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <TremorCard key={addr.id} className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {addr.label && (
                      <Badge variant="secondary" className="font-medium">
                        {addr.label}
                      </Badge>
                    )}
                    {addr.isDefault && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {t(locale, 'الافتراضي', 'Default')}
                      </Badge>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-muted-foreground" dir="ltr">{addr.phone}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {addr.street}، {addr.city}
                    {addr.state && `، ${addr.state}`}
                    {addr.zipCode && ` - ${addr.zipCode}`}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5 flex-1"
                    onClick={() => {
                      setFormData(addr);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {t(locale, 'تعديل', 'Edit')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:text-destructive gap-1.5 flex-1"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t(locale, 'حذف', 'Delete')}
                  </Button>
                </div>
              </div>
            </TremorCard>
          ))}
        </div>
      )}
    </div>
  );
}
