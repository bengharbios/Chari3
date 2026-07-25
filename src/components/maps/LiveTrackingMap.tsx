'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Navigation, Phone, KeyRound } from 'lucide-react';

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Leaflet Icons
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

const shipmentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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
  const defaultCenter: [number, number] = [
    driverLocation?.lat || 36.7538,
    driverLocation?.lng || 3.0588
  ];

  return (
    <div className="relative w-full h-[360px] rounded-3xl overflow-hidden shadow-inner border border-white/10 z-0">
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

        {/* Driver Marker */}
        <Marker position={defaultCenter} icon={driverIcon}>
          <Popup>
            <div className="p-1 text-center font-cairo dir-rtl">
              <p className="font-black text-sm text-emerald-600">موقع المندوب اللحظي (GPS Active)</p>
              <p className="text-xs text-slate-500 mt-1">الجزائر العاصمة &bull; جاهز لتوصيل الطلبات</p>
            </div>
          </Popup>
        </Marker>

        {/* Active Shipments Markers */}
        {shipments.map((s) => {
          const lat = s.lat || 36.7538 + (Math.random() - 0.5) * 0.05;
          const lng = s.lng || 3.0588 + (Math.random() - 0.5) * 0.05;

          return (
            <Marker
              key={s.id}
              position={[lat, lng]}
              icon={shipmentIcon}
              eventHandlers={{
                click: () => onSelectShipment(s),
              }}
            >
              <Popup>
                <div className="p-2 text-start font-cairo space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b pb-1">
                    <span className="font-mono font-bold text-primary">{s.trackingNumber}</span>
                    <Badge variant="outline" className="text-[10px]">{s.city}</Badge>
                  </div>
                  <p className="font-bold text-slate-800 mt-1">{s.recipientName}</p>
                  <p className="text-slate-500 truncate max-w-[180px]">{s.address}</p>
                  <p className="font-black text-emerald-600 pt-1">
                    المبلغ: {s.codAmount?.toLocaleString()} DZD
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full mt-2 h-7 text-xs font-bold rounded-lg bg-primary text-white"
                    onClick={() => onSelectShipment(s)}
                  >
                    تحديد الشحنة
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
