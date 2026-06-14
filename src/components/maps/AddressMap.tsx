'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { toast } from 'sonner';

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

function LocationMarker({ onLocationSelect, defaultPos }: { onLocationSelect: any, defaultPos: [number, number] }) {
  const [position, setPosition] = useState<L.LatLng | null>(defaultPos ? L.latLng(defaultPos[0], defaultPos[1]) : null);
  const { t } = useTranslation();

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
      const data = await res.json();
      if (data && data.display_name) {
        // extract a shorter version if possible
        const street = data.address?.road || data.address?.suburb || data.address?.city || '';
        const district = data.address?.neighbourhood || data.address?.residential || '';
        const shortName = [street, district].filter(Boolean).join('، ');
        
        onLocationSelect(lat, lng, shortName || data.display_name);
        toast.success(t('buyer.locationUpdated', 'Location updated successfully'));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function AddressMap({ initialLat, initialLng, onLocationSelect }: AddressMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      });
  }, []);

  if (!isMounted || !settings) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>;

  if (settings.map_enabled !== 'true') return null; // Don't render if disabled

  const center: [number, number] = initialLat && initialLng 
    ? [initialLat, initialLng] 
    : [parseFloat(settings.map_default_lat || '25.2048'), parseFloat(settings.map_default_lng || '55.2708')];
    
  const zoom = parseInt(settings.map_default_zoom || '12', 10);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border z-0 relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} defaultPos={center} />
      </MapContainer>
      
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-xs p-2 rounded-lg text-center z-[1000] pointer-events-none shadow-sm border font-bold">
        انقر على الخريطة لتحديد موقعك بدقة (Tap map to select location)
      </div>
    </div>
  );
}
