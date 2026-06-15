'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { toast } from 'sonner';
import { Navigation, Search, Loader2 } from 'lucide-react';

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface AddressMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, addressText: string) => void;
}

function MapController({ 
  position, 
  setPosition, 
  onLocationSelect 
}: { 
  position: L.LatLng | null, 
  setPosition: any, 
  onLocationSelect: any 
}) {
  const map = useMap();
  const { t } = useTranslation();

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
      const data = await res.json();
      if (data && data.display_name) {
        const street = data.address?.road || data.address?.suburb || data.address?.city || '';
        const district = data.address?.neighbourhood || data.address?.residential || '';
        const shortName = [street, district].filter(Boolean).join('، ');
        
        onLocationSelect(lat, lng, shortName || data.display_name);
        toast.success('تم تحديث الموقع بنجاح');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  // Watch for external position changes (like search or GPS)
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
      fetchAddress(position.lat, position.lng);
    }
  }, [position?.lat, position?.lng]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function AddressMap({ initialLat, initialLng, onLocationSelect }: AddressMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (!initialLat && !initialLng) {
             setPosition(L.latLng(
               parseFloat(data.settings.map_default_lat || '25.2048'), 
               parseFloat(data.settings.map_default_lng || '55.2708')
             ));
          }
        }
      });
  }, []);

  if (!isMounted || !settings) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>;
  if (settings.map_enabled !== 'true') return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=ar`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition(L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon)));
      } else {
        toast.error('لم يتم العثور على الموقع');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('متصفحك لا يدعم تحديد الموقع');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(L.latLng(pos.coords.latitude, pos.coords.longitude));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast.error('يرجى السماح بصلاحية الموقع للمتصفح');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const center: [number, number] = initialLat && initialLng 
    ? [initialLat, initialLng] 
    : [parseFloat(settings.map_default_lat || '25.2048'), parseFloat(settings.map_default_lng || '55.2708')];
  const zoom = parseInt(settings.map_default_zoom || '12', 10);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input 
            type="text" 
            placeholder="ابحث عن مدينة، حي، أو معلم..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3 pr-10 rounded-md border text-sm outline-none focus:border-brand"
            dir="rtl"
          />
          <button type="submit" disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand">
            {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </button>
        </form>
        <button 
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="h-10 px-3 bg-brand/10 text-brand rounded-md hover:bg-brand/20 flex items-center gap-1 text-sm font-bold transition-colors"
        >
          {isLocating ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
          تحديد موقعي
        </button>
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border z-0 relative">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        </MapContainer>
        
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-xs p-2 rounded-lg text-center z-[1000] pointer-events-none shadow-sm border font-bold">
          انقر على الخريطة أو اسحب لتحديد موقعك بدقة
        </div>
      </div>
    </div>
  );
}
