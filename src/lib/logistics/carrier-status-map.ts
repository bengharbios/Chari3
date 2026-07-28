/**
 * ChariDay Universal Carrier Status Mapping Layer
 * ================================================
 * Principle: ChariDay speaks ONE universal language.
 * Every carrier adapts to US — not the other way around.
 *
 * To add a new carrier: add ONE entry to CARRIER_STATUS_MAPS.
 * No other file needs to change.
 *
 * References:
 *  - FleetOps: Dispatch & Fulfillment workflow patterns
 *  - LastMile (agarg5): Status normalization algorithm
 */

// ─── Universal Status Type ────────────────────────────────────────────────────

export type UniversalStatus =
  | 'pending'           // Awaiting merchant/carrier preparation
  | 'ready'             // Packed & ready for driver/carrier pickup
  | 'picked_up'         // Carrier/driver has physically taken the parcel
  | 'in_transit'        // Parcel is moving between hubs / en route
  | 'out_for_delivery'  // Last-mile: driver is heading to the recipient
  | 'delivered'         // Successfully delivered ✅ (TERMINAL)
  | 'failed'            // Delivery attempt failed (not terminal — may retry)
  | 'returned'          // Parcel returned to merchant (TERMINAL)
  | 'cancelled';        // Order cancelled (TERMINAL)

// ─── Carrier → Universal Mapping Table ───────────────────────────────────────

export const CARRIER_STATUS_MAPS: Record<string, Record<string, UniversalStatus>> = {

  // ─── 🇩🇿 Yalidine Delivery (Algeria) ───────────────────────────────────────
  yalidine: {
    'PREPARATION':    'pending',
    'EXPEDIE':        'picked_up',
    'EN_LIVRAISON':   'in_transit',
    'SORTI':          'out_for_delivery',
    'LIVRE':          'delivered',
    'ECHEC':          'failed',
    'RETOUR':         'returned',
    'RETOUR_EXPEDIE': 'returned',
    'ANNULE':         'cancelled',
  },

  // ─── 🇩🇿 ZR Express (Algeria) ──────────────────────────────────────────────
  zr_express: {
    'new':            'pending',
    'ready':          'ready',
    'in_progress':    'in_transit',
    'delivered':      'delivered',
    'failed':         'failed',
    'returned':       'returned',
    'cancelled':      'cancelled',
  },

  // ─── 🇩🇿 Maystro Delivery (Algeria) ────────────────────────────────────────
  maystro: {
    'WAITING':        'pending',
    'PROCESSING':     'picked_up',
    'DELIVERING':     'in_transit',
    'OUT_DELIVERY':   'out_for_delivery',
    'DELIVERED':      'delivered',
    'FAILED':         'failed',
    'RETURNING':      'returned',
    'RETURNED':       'returned',
    'CANCELLED':      'cancelled',
  },

  // ─── 🇩🇿 Ecotrack (Algeria) ─────────────────────────────────────────────────
  ecotrack: {
    'created':        'pending',
    'picked':         'picked_up',
    'transit':        'in_transit',
    'delivering':     'out_for_delivery',
    'delivered':      'delivered',
    'returned':       'returned',
    'cancelled':      'cancelled',
  },

  // ─── 🇩🇿 ChariDay Express (Internal Fleet) ──────────────────────────────────
  chariday_express: {
    'pending':          'pending',
    'ready':            'ready',
    'picked_up':        'picked_up',
    'in_transit':       'in_transit',
    'out_for_delivery': 'out_for_delivery',
    'delivered':        'delivered',
    'failed':           'failed',
    'returned':         'returned',
    'cancelled':        'cancelled',
  },

  // ─── 🇸🇦🇦🇪 Aramex (Saudi Arabia + Gulf) ────────────────────────────────────
  aramex: {
    'PickedUp':           'picked_up',
    'InTransit':          'in_transit',
    'OutForDelivery':     'out_for_delivery',
    'Delivered':          'delivered',
    'DeliveryAttempted':  'failed',
    'Returned':           'returned',
    'Cancelled':          'cancelled',
    'IN_TRANSIT':         'in_transit',
    'DELIVERED':          'delivered',
    'RETURNED':           'returned',
    'CANCELLED':          'cancelled',
  },

  // ─── 🇸🇦 SMSA Express (Saudi Arabia) ────────────────────────────────────────
  smsa: {
    'BOOKED':         'pending',
    'PICKED_UP':      'picked_up',
    'IN_TRANSIT':     'in_transit',
    'OUT_FOR_DEL':    'out_for_delivery',
    'DELIVERED':      'delivered',
    'RETURNED':       'returned',
    'CANCELLED':      'cancelled',
  },

  // ─── 🌍 DHL (International) ─────────────────────────────────────────────────
  dhl: {
    'transit':        'in_transit',
    'delivered':      'delivered',
    'failure':        'failed',
    'returned':       'returned',
    'TRANSIT':        'in_transit',
    'DELIVERED':      'delivered',
    'FAILURE':        'failed',
  },

  // ─── 🌍 FedEx (International) ───────────────────────────────────────────────
  fedex: {
    'IN_TRANSIT':           'in_transit',
    'OUT_FOR_DELIVERY':     'out_for_delivery',
    'DELIVERED':            'delivered',
    'DELIVERY_EXCEPTION':   'failed',
    'RETURNED_TO_SENDER':   'returned',
    'CANCELLED':            'cancelled',
  },

  // ─── Add new carriers below. No other file needs to change. ────────────────
};

// ─── Core Conversion Function ─────────────────────────────────────────────────

/**
 * Converts any carrier-specific raw status to a ChariDay UniversalStatus.
 * Falls back to 'pending' for unknown carriers or unknown status codes.
 *
 * @param carrierKey  - e.g. "yalidine", "aramex", "dhl"
 * @param rawStatus   - e.g. "EXPEDIE", "DELIVERED", "transit"
 * @returns UniversalStatus
 */
export function toUniversalStatus(
  carrierKey: string,
  rawStatus: string
): UniversalStatus {
  if (!carrierKey || !rawStatus) return 'pending';
  const map = CARRIER_STATUS_MAPS[carrierKey.toLowerCase()];
  if (!map) return 'pending';
  return map[rawStatus] ?? map[rawStatus.toUpperCase()] ?? 'pending';
}

// ─── Status Classification Lists ─────────────────────────────────────────────

/**
 * Statuses that appear as ACTIVE markers on the Live GPS Tracking Map.
 * These are orders currently in the field — drivers need to see them.
 */
export const ACTIVE_MAP_STATUSES: UniversalStatus[] = [
  'ready',
  'picked_up',
  'in_transit',
  'out_for_delivery',
];

/**
 * Terminal statuses — permanently done.
 * These are IMMEDIATELY removed from the live map.
 */
export const TERMINAL_STATUSES: UniversalStatus[] = [
  'delivered',
  'returned',
  'cancelled',
];

/**
 * Statuses visible in the Open Load Pool (available for drivers to claim).
 * Only 'ready' parcels are claimable.
 */
export const CLAIMABLE_STATUSES: UniversalStatus[] = ['ready'];

/**
 * Order of status progression for UI timeline display.
 */
export const STATUS_PROGRESSION: UniversalStatus[] = [
  'pending',
  'ready',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

// ─── Status Display Config (Arabic + English labels + colors) ─────────────────

export const STATUS_CONFIG: Record<
  UniversalStatus,
  { labelAr: string; labelEn: string; color: string; bgColor: string; icon: string }
> = {
  pending:           { labelAr: 'في الانتظار',       labelEn: 'Pending',           color: '#f59e0b', bgColor: 'bg-amber-500/10',   icon: '⏳' },
  ready:             { labelAr: 'جاهز للاستلام',     labelEn: 'Ready for Pickup',  color: '#3b82f6', bgColor: 'bg-blue-500/10',    icon: '📦' },
  picked_up:         { labelAr: 'تم الاستلام',       labelEn: 'Picked Up',         color: '#8b5cf6', bgColor: 'bg-violet-500/10',  icon: '🚚' },
  in_transit:        { labelAr: 'في الطريق',         labelEn: 'In Transit',        color: '#6366f1', bgColor: 'bg-indigo-500/10',  icon: '🛣️' },
  out_for_delivery:  { labelAr: 'خرج للتوصيل',      labelEn: 'Out for Delivery',  color: '#0ea5e9', bgColor: 'bg-sky-500/10',     icon: '🏃' },
  delivered:         { labelAr: 'تم التوصيل',       labelEn: 'Delivered',         color: '#10b981', bgColor: 'bg-emerald-500/10', icon: '✅' },
  failed:            { labelAr: 'محاولة فاشلة',     labelEn: 'Delivery Failed',   color: '#f97316', bgColor: 'bg-orange-500/10',  icon: '⚠️' },
  returned:          { labelAr: 'مُعاد للتاجر',     labelEn: 'Returned',          color: '#64748b', bgColor: 'bg-slate-500/10',   icon: '↩️' },
  cancelled:         { labelAr: 'ملغي',              labelEn: 'Cancelled',         color: '#ef4444', bgColor: 'bg-red-500/10',     icon: '❌' },
};

/**
 * Helper: get display config for a status, with safe fallback.
 */
export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as UniversalStatus] ?? STATUS_CONFIG['pending'];
}

/**
 * Helper: check if a status should appear on the live map.
 */
export function isActiveOnMap(status: string): boolean {
  return ACTIVE_MAP_STATUSES.includes(status as UniversalStatus);
}

/**
 * Helper: check if a status is terminal (never show on map again).
 */
export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as UniversalStatus);
}
