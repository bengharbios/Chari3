'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AddressMap = dynamic(() => import('@/components/maps/AddressMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center animate-pulse"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
});

const LocationMap = dynamic(() => import('@/components/ui/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center animate-pulse"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
});

interface UnifiedMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, addressText: string, city?: string, state?: string, country?: string) => void;
}

export default function UnifiedMap({ initialLat, initialLng, onLocationSelect }: UnifiedMapProps) {
  const [provider, setProvider] = useState<'osm' | 'google' | null>(null);
  const [googleApiKey, setGoogleApiKey] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setIsEnabled(data.settings.map_enabled === 'true');
          setProvider(data.settings.map_provider === 'google' ? 'google' : 'osm');
          setGoogleApiKey(data.settings.google_maps_api_key || '');
        } else {
          setProvider('osm');
        }
      })
      .catch(() => {
        setProvider('osm');
      });
  }, []);

  if (!isEnabled) return null;
  if (!provider) return <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center animate-pulse"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;

  if (provider === 'google') {
    return (
      <LocationMap 
        apiKey={googleApiKey}
        defaultLat={initialLat || undefined}
        defaultLng={initialLng || undefined}
        onLocationSelect={(loc) => onLocationSelect(loc.lat, loc.lng, loc.address, loc.city, loc.state, loc.country)}
      />
    );
  }

  return (
    <AddressMap 
      initialLat={initialLat}
      initialLng={initialLng}
      onLocationSelect={onLocationSelect}
    />
  );
}
