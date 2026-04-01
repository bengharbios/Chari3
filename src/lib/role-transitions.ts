// ============================================
// SHARED ROLE TRANSITIONS CONFIG
// Works in both 'use client' and server components
// ============================================

export interface RoleTransition {
  allowed: boolean;
  createsProfile?: string[];       // e.g. ['SellerProfile', 'FreelancerVerification']
  deactivates?: string[];          // e.g. ['Store']
  newStatus: string;               // 'active' | 'pending'
  requiresVerification: boolean;
  warningLevel: 'none' | 'info' | 'warning' | 'danger';
  messageAr: string;
  messageEn: string;
  // Detailed impact descriptions
  impactsAr: string[];
  impactsEn: string[];
}

const BLOCKED: RoleTransition = {
  allowed: false,
  newStatus: 'active',
  requiresVerification: false,
  warningLevel: 'danger',
  messageAr: 'هذا التحويل غير مسموح',
  messageEn: 'This transition is not allowed',
  impactsAr: ['لا يمكن إجراء هذا التحويل بين الأدوار'],
  impactsEn: ['This role transition is not permitted'],
};

const BLOCKED_ADMIN: RoleTransition = {
  allowed: false,
  newStatus: 'active',
  requiresVerification: false,
  warningLevel: 'danger',
  messageAr: 'لا يمكن التحويل إلى دور مدير النظام',
  messageEn: 'Cannot convert to system admin role',
  impactsAr: ['لا يمكن منح صلاحيات المدير بهذه الطريقة'],
  impactsEn: ['Admin privileges cannot be granted this way'],
};

// ============================================
// FULL TRANSITION MATRIX
// ============================================

const TRANSITIONS: Record<string, Record<string, RoleTransition>> = {
  buyer: {
    seller: {
      allowed: true,
      createsProfile: ['SellerProfile', 'FreelancerVerification'],
      newStatus: 'pending',
      requiresVerification: true,
      warningLevel: 'info',
      messageAr: 'سيتم تحويل الحساب إلى تاجر مستقل ويحتاج إكمال التوثيق',
      messageEn: 'Account will be converted to seller and needs verification completion',
      impactsAr: [
        'سيتم إنشاء ملف بائع مستقل جديد',
        'سيتم إنشاء سجل توثيق البائع المستقل',
        'الحساب سيتطلب إكمال التوثيق',
        'حالة الحساب ستصبح "بانتظار المراجعة"',
      ],
      impactsEn: [
        'A new seller profile will be created',
        'Freelancer verification record will be created',
        'Account will require completing verification',
        'Account status will change to "Pending"',
      ],
    },
    store_manager: {
      allowed: true,
      createsProfile: ['StoreVerification'],
      newStatus: 'pending',
      requiresVerification: true,
      warningLevel: 'info',
      messageAr: 'سيتم تحويل الحساب إلى مدير متجر ويحتاج إكمال توثيق المتجر',
      messageEn: 'Account will be converted to store manager and needs store verification',
      impactsAr: [
        'سيتم إنشاء طلب تسجيل متجر جديد',
        'الحساب سيتطلب إكمال التوثيق',
        'حالة الحساب ستصبح "بانتظار المراجعة"',
      ],
      impactsEn: [
        'A new store registration request will be created',
        'Account will require completing verification',
        'Account status will change to "Pending"',
      ],
    },
    supplier: {
      allowed: true,
      createsProfile: ['SupplierVerification'],
      newStatus: 'pending',
      requiresVerification: true,
      warningLevel: 'info',
      messageAr: 'سيتم تحويل الحساب إلى مورد ويحتاج إكمال التوثيق',
      messageEn: 'Account will be converted to supplier and needs verification',
      impactsAr: [
        'سيتم إنشاء ملف مورد جديد',
        'سيتم إنشاء سجل توثيق المورد',
        'الحساب سيتطلب إكمال التوثيق',
        'حالة الحساب ستصبح "بانتظار المراجعة"',
      ],
      impactsEn: [
        'A new supplier profile will be created',
        'Supplier verification record will be created',
        'Account will require completing verification',
        'Account status will change to "Pending"',
      ],
    },
    logistics: {
      allowed: true,
      createsProfile: ['LogisticsProfile'],
      newStatus: 'pending',
      requiresVerification: true,
      warningLevel: 'info',
      messageAr: 'سيتم تحويل الحساب إلى مندوب شحن ويحتاج إكمال التوثيق',
      messageEn: 'Account will be converted to courier and needs verification',
      impactsAr: [
        'سيتم إنشاء ملف مندوب شحن جديد',
        'الحساب سيتطلب إكمال التوثيق',
        'حالة الحساب ستصبح "بانتظار المراجعة"',
      ],
      impactsEn: [
        'A new courier profile will be created',
        'Account will require completing verification',
        'Account status will change to "Pending"',
      ],
    },
    admin: BLOCKED_ADMIN,
  },

  seller: {
    buyer: {
      allowed: true,
      newStatus: 'active',
      requiresVerification: false,
      warningLevel: 'warning',
      messageAr: 'سيتم تحويل الحساب إلى مشتري. سيتم الاحتفاظ ببيانات البائع السابقة.',
      messageEn: 'Account will be converted to buyer. Previous seller data will be preserved.',
      impactsAr: [
        'سيتم تحويل الدور إلى مشتري',
        'سيتم الاحتفاظ ببيانات البائع السابقة',
        'حالة الحساب ستصبح "نشط"',
        'ستفقد صلاحيات البائع (إضافة منتجات، إدارة المبيعات)',
      ],
      impactsEn: [
        'Role will be changed to buyer',
        'Previous seller data will be preserved',
        'Account status will change to "Active"',
        'Seller features will be lost (adding products, managing sales)',
      ],
    },
    store_manager: {
      allowed: true,
      createsProfile: ['StoreVerification'],
      newStatus: 'pending',
      requiresVerification: true,
      warningLevel: 'info',
      messageAr: 'سيتم ترقية البائع إلى مدير متجر. يحتاج إكمال وثائق المتجر.',
      messageEn: 'Seller will be upgraded to store manager. Must complete store verification.',
      impactsAr: [
        'سيتم إنشاء طلب تسجيل متجر جديد',
        'سيتم الاحتفاظ بملف البائع الحالي',
        'الحساب سيتطلب إكمال وثائق المتجر',
        'حالة الحساب ستصبح "بانتظار المراجعة"',
      ],
      impactsEn: [
        'A new store registration request will be created',
        'Current seller profile will be preserved',
        'Account needs to complete store documentation',
        'Account status will change to "Pending"',
      ],
    },
    supplier: BLOCKED,
    logistics: BLOCKED,
    admin: BLOCKED_ADMIN,
  },

  store_manager: {
    buyer: {
      allowed: true,
      deactivates: ['Store'],
      newStatus: 'active',
      requiresVerification: false,
      warningLevel: 'warning',
      messageAr: 'سيتم تحويل الحساب إلى مشتري. المتجر المرتبط سيتم تعطيله.',
      messageEn: 'Account will be converted to buyer. The associated store will be deactivated.',
      impactsAr: [
        'سيتم تحويل الدور إلى مشتري',
        'سيتم تعطيل المتجر المرتبط بالحساب',
        'حالة الحساب ستصبح "نشط"',
        'يمكن إعادة تفعيل المتجر لاحقاً من قبل المدير',
      ],
      impactsEn: [
        'Role will be changed to buyer',
        'The associated store will be deactivated',
        'Account status will change to "Active"',
        'The store can be reactivated later by an admin',
      ],
    },
    seller: {
      allowed: true,
      deactivates: ['Store'],
      newStatus: 'active',
      requiresVerification: false,
      warningLevel: 'warning',
      messageAr: 'سيتم تحويل الحساب إلى بائع مستقل. المتجر المرتبط سيتم تعطيله.',
      messageEn: 'Account will be converted to seller. The associated store will be deactivated.',
      impactsAr: [
        'سيتم تحويل الدور إلى بائع مستقل',
        'سيتم تعطيل المتجر المرتبط بالحساب',
        'حالة الحساب ستصبح "نشط"',
        'سيتم الاحتفاظ بملف البائع إن وجد',
      ],
      impactsEn: [
        'Role will be changed to seller',
        'The associated store will be deactivated',
        'Account status will change to "Active"',
        'Seller profile will be preserved if it exists',
      ],
    },
    supplier: BLOCKED,
    logistics: BLOCKED,
    admin: BLOCKED_ADMIN,
  },

  supplier: {
    buyer: {
      allowed: true,
      newStatus: 'active',
      requiresVerification: false,
      warningLevel: 'warning',
      messageAr: 'سيتم تحويل الحساب إلى مشتري. سيتم الاحتفاظ ببيانات المورد السابقة.',
      messageEn: 'Account will be converted to buyer. Previous supplier data will be preserved.',
      impactsAr: [
        'سيتم تحويل الدور إلى مشتري',
        'سيتم الاحتفاظ ببيانات المورد السابقة',
        'حالة الحساب ستصبح "نشط"',
        'ستفقد صلاحيات المورد (إدارة المنتجات بالجملة)',
      ],
      impactsEn: [
        'Role will be changed to buyer',
        'Previous supplier data will be preserved',
        'Account status will change to "Active"',
        'Supplier features will be lost (wholesale product management)',
      ],
    },
    seller: BLOCKED,
    store_manager: BLOCKED,
    logistics: BLOCKED,
    admin: BLOCKED_ADMIN,
  },

  logistics: {
    buyer: {
      allowed: true,
      newStatus: 'active',
      requiresVerification: false,
      warningLevel: 'warning',
      messageAr: 'سيتم تحويل الحساب إلى مشتري. سيتم الاحتفاظ ببيانات المندوب السابقة.',
      messageEn: 'Account will be converted to buyer. Previous courier data will be preserved.',
      impactsAr: [
        'سيتم تحويل الدور إلى مشتري',
        'سيتم الاحتفاظ ببيانات المندوب السابقة',
        'حالة الحساب ستصبح "نشط"',
        'ستفقد صلاحيات الشحن والتحقق من الطلبات',
      ],
      impactsEn: [
        'Role will be changed to buyer',
        'Previous courier data will be preserved',
        'Account status will change to "Active"',
        'Shipping and order verification features will be lost',
      ],
    },
    seller: BLOCKED,
    store_manager: BLOCKED,
    supplier: BLOCKED,
    admin: BLOCKED_ADMIN,
  },

  admin: {
    buyer: BLOCKED,
    seller: BLOCKED,
    store_manager: BLOCKED,
    supplier: BLOCKED,
    logistics: BLOCKED,
  },
};

// ============================================
// ALL VALID ROLES
// ============================================

export const ALL_ROLES = ['admin', 'store_manager', 'seller', 'supplier', 'logistics', 'buyer'] as const;

// ============================================
// PUBLIC API
// ============================================

/**
 * Get the full transition details for a role change.
 * Returns null if fromRole === toRole (same role, handled separately in UI).
 */
export function getTransition(fromRole: string, toRole: string): RoleTransition | null {
  if (fromRole === toRole) return null;

  const fromTransitions = TRANSITIONS[fromRole];
  if (!fromTransitions) return null;

  const transition = fromTransitions[toRole];
  if (!transition) return null;

  return transition;
}

/**
 * Get all roles that the given role can transition TO (including itself).
 * Used for filtering the role select dropdown.
 */
export function getAllowedTargets(fromRole: string): string[] {
  const fromTransitions = TRANSITIONS[fromRole];
  if (!fromTransitions) return [];

  const targets: string[] = [fromRole]; // Always include current role

  for (const [role, transition] of Object.entries(fromTransitions)) {
    if (transition.allowed) {
      targets.push(role);
    }
  }

  return targets;
}

/**
 * Quick check if a transition is allowed.
 */
export function isTransitionAllowed(fromRole: string, toRole: string): boolean {
  if (fromRole === toRole) return false; // Same role is a no-op, not a "transition"
  const transition = getTransition(fromRole, toRole);
  return transition?.allowed ?? false;
}
