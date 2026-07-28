'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Navigation, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { getStatusConfig } from '@/lib/logistics/carrier-status-map';
import { useAppStore } from '@/lib/store';

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Driver GPS Icon with pulsing aura effect
const driverIcon = L.divIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; background-color: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 34px; height: 34px; background-color: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
        🚚
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

// Dynamic Colored Shipment Icon based on Universal Status
function getShipmentMarkerIcon(status: string) {
  const config = getStatusConfig(status);
  const bgColor = config.color || '#3b82f6';
  const iconEmoji = config.icon || '📦';
  const isTransit = status === 'in_transit' || status === 'out_for_delivery';

  return L.divIcon({
    className: 'custom-shipment-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        ${isTransit ? `<div style="position: absolute; width: 100%; height: 100%; background-color: ${bgColor}40; border-radius: 50%; animation: pulse 1.5s infinite;"></div>` : ''}
        <div style="width: 32px; height: 32px; background-color: ${bgColor}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 15px;">
          ${iconEmoji}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface LiveTrackingMapProps {
  shipments: any[];
  onSelectShipment: (shipment: any) => void;
  driverLocation?: { lat: number; lng: number };
}

export default function LiveTrackingMap({ shipments, onSelectShipment, driverLocation }: LiveTrackingMapProps) {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  // Trilingual translation function
  const t = (ar: string, en: string, fr: string) => {
    if (isAr) return ar;
    if (isFr) return fr;
    return en;
  };

  const defaultCenter: [number, number] = [
    driverLocation?.lat || 36.7538,
    driverLocation?.lng || 3.0588
  ];

  return (
    <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-inner border border-white/10 z-0 bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={defaultCenter} />

        {/* Driver Live Marker */}
        <Marker position={defaultCenter} icon={driverIcon}>
          <Popup>
            <div className={`p-1 font-cairo ${isAr ? 'dir-rtl text-right' : 'text-left'}`}>
              <p className="font-black text-sm text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {t('موقع المندوب اللحظي (GPS Active)', 'Driver Live Location (GPS Active)', 'Position Live du Livreur (GPS Actif)')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('الجزائر العاصمة • جاهز لتوصيل الطلبات', 'Algiers • Ready for dispatch', 'Alger • Prêt pour livraison')}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Dynamic Shipments Markers */}
        {shipments.map((s) => {
          const lat = s.lat || 36.7538 + (Math.random() - 0.5) * 0.05;
          const lng = s.lng || 3.0588 + (Math.random() - 0.5) * 0.05;
          const statusConfig = getStatusConfig(s.status || 'ready');
          const statusLabel = isAr ? statusConfig.labelAr : isFr ? statusConfig.labelFr : statusConfig.labelEn;

          return (
            <Marker
              key={s.id || s.orderId || s.trackingNumber}
              position={[lat, lng]}
              icon={getShipmentMarkerIcon(s.status || 'ready')}
              eventHandlers={{
                click: () => onSelectShipment(s),
              }}
            >
              <Popup>
                <div className={`p-2 font-cairo space-y-2 text-xs ${isAr ? 'text-right dir-rtl' : 'text-left'}`}>
                  <div className="flex items-center justify-between gap-3 border-b pb-1.5">
                    <span className="font-mono font-bold text-primary text-sm">{s.trackingNumber}</span>
                    <Badge style={{ backgroundColor: statusConfig.color + '20', color: statusConfig.color, borderColor: statusConfig.color + '50' }} className="text-[10px] font-bold px-2 py-0.5 border">
                      {statusConfig.icon} {statusLabel}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {s.recipientName || s.recipientAlias}
                    </p>
                    <p className="text-slate-500 truncate max-w-[200px] mt-0.5">{s.address || s.district} &bull; {s.city}</p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-semibold">{t('المبلغ (COD):', 'Amount (COD):', 'Montant (COD):')}</span>
                    <span className="font-black text-emerald-600 text-sm">{s.codAmount?.toLocaleString()} DZD</span>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full mt-1 h-8 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm"
                    onClick={() => onSelectShipment(s)}
                  >
                    {t('تحديد وعرض تفاصيل الشحنة', 'Select & View Parcel', 'Sélectionner le Colis')}
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
