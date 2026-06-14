'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, LocateFixed, Loader2, Navigation } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface LocationMapProps {
  apiKey?: string;
  defaultLat?: number;
  defaultLng?: number;
  onLocationSelect: (location: { lat: number; lng: number; address: string; city: string; state: string; country: string }) => void;
  className?: string;
}

export default function LocationMap({ apiKey, defaultLat = 36.7538, defaultLng = 3.0588, onLocationSelect, className = '' }: LocationMapProps) {
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const translate = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Simulated State for missing API Key
  const [simulatedLat, setSimulatedLat] = useState(defaultLat);
  const [simulatedLng, setSimulatedLng] = useState(defaultLng);
  const [searchQuery, setSearchQuery] = useState('');

  // Actual Google Maps instances
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps Script
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${locale}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => {
      setMapError(true);
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if necessary
    };
  }, [apiKey, locale]);

  const handleReverseGeocode = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) {
      // Simulated Geocoding
      onLocationSelect({
        lat,
        lng,
        address: locale === 'ar' ? 'العنوان التقريبي (محاكاة)' : 'Approximate Address (Simulated)',
        city: locale === 'ar' ? 'الجزائر العاصمة' : 'Algiers',
        state: '16',
        country: 'DZ'
      });
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        let city = '';
        let state = '';
        let country = 'DZ';

        results[0].address_components.forEach((component: any) => {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('administrative_area_level_1')) state = component.long_name;
          if (component.types.includes('country')) country = component.short_name;
        });

        onLocationSelect({
          lat,
          lng,
          address: results[0].formatted_address,
          city: city || state || '',
          state: state || '',
          country
        });
      }
    });
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
    });

    markerRef.current = new window.google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map: googleMapRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    window.google.maps.event.addListener(markerRef.current, 'dragend', () => {
      const position = markerRef.current.getPosition();
      handleReverseGeocode(position.lat(), position.lng());
    });

    window.google.maps.event.addListener(googleMapRef.current, 'click', (event: any) => {
      markerRef.current.setPosition(event.latLng);
      handleReverseGeocode(event.latLng.lat(), event.latLng.lng());
    });

    setIsLoaded(true);
    handleReverseGeocode(defaultLat, defaultLng);
  };

  const locateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (googleMapRef.current && markerRef.current) {
            const pos = new window.google.maps.LatLng(lat, lng);
            googleMapRef.current.panTo(pos);
            markerRef.current.setPosition(pos);
            handleReverseGeocode(lat, lng);
          } else {
            setSimulatedLat(lat);
            setSimulatedLng(lng);
            handleReverseGeocode(lat, lng);
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert(translate('فشل في تحديد موقعك. يرجى تفعيل إذن الموقع.', 'Failed to locate you. Please enable location permissions.'));
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className={`relative flex flex-col w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-border bg-muted/20 ${className}`} dir={dir}>
      {/* Search & Actions Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
        <div className="relative flex-1 bg-background/90 backdrop-blur-md rounded-lg shadow-sm border border-border flex items-center overflow-hidden">
          <Search className="w-4 h-4 text-muted-foreground mx-3 shrink-0" />
          <input
            type="text"
            placeholder={translate('ابحث عن عنوان أو شارع...', 'Search for address or street...')}
            className="flex-1 bg-transparent border-0 outline-none py-2.5 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={locateMe}
          disabled={isLocating}
          className="bg-background/90 backdrop-blur-md border border-border shadow-sm w-10 h-10 rounded-lg flex items-center justify-center text-brand hover:bg-background transition-colors shrink-0"
          title={translate('موقعي الحالي', 'My Current Location')}
        >
          {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
        </button>
      </div>

      {/* Map Container */}
      {!isLoaded ? (
        <div className="flex-1 flex items-center justify-center bg-muted/50">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (!apiKey || mapError) ? (
        // Simulated Map Fallback
        <div 
          className="flex-1 relative bg-[#e5e3df] flex items-center justify-center cursor-crosshair overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(#d5d3cf 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Simulated fake lat/lng shift
            const newLat = simulatedLat + (y - rect.height/2) * -0.001;
            const newLng = simulatedLng + (x - rect.width/2) * 0.001;
            setSimulatedLat(newLat);
            setSimulatedLng(newLng);
            handleReverseGeocode(newLat, newLng);
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pb-2 animate-bounce pointer-events-none">
            <MapPin className="w-8 h-8 text-red-500 fill-red-100" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur p-3 rounded-lg border text-center shadow-lg pointer-events-none">
            <Navigation className="w-5 h-5 text-brand mx-auto mb-1 opacity-50" />
            <p className="text-xs font-bold text-foreground">
              {translate('وضع المحاكاة (Google Maps API غير متوفر)', 'Simulation Mode (Google Maps API not provided)')}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {translate('انقر في أي مكان لمحاكاة تحديد الموقع.', 'Click anywhere to simulate location selection.')}
            </p>
            <p className="text-[10px] font-mono mt-1 opacity-60">
              Lat: {simulatedLat.toFixed(4)}, Lng: {simulatedLng.toFixed(4)}
            </p>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="flex-1 w-full h-full" />
      )}
    </div>
  );
}
