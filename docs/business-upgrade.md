# Business Upgrade Documentation / توثيق نظام ترقية الأعمال

## 1. Overview / نظرة عامة
**English:**
The Business Upgrade system allows an individual seller to upgrade their store to a "Business Store," unlocking advanced enterprise features (Multiple Branches, Team/Staff Management, Tax Reporting). The system features dynamic pricing controlled by the Admin, integrated invoicing, and a manual review/approval process.

**العربية:**
نظام ترقية الأعمال يسمح للتاجر المستقل بترقية متجره إلى "متجر أعمال"، مما يفتح له ميزات متقدمة للشركات (إدارة الفروع المتعددة، إدارة طاقم العمل، والتقارير الضريبية). يتميز النظام بتسعير ديناميكي يتحكم فيه الأدمن، ونظام فوترة متكامل، وعملية مراجعة وموافقة يدوية.

---

## 2. Technical Lifecycle & Models / دورة الحياة والموديلات التقنية

### Database Models / جداول قاعدة البيانات:
1. **`PlatformSettings` (Global)**: Holds global system toggles, specifically `isUpgradeFreePromo` (Boolean) to control if upgrades are currently free.
2. **`BillingAddon`**: The addon with `key: 'business_upgrade'` holds the base `price` (fee) for the upgrade.
3. **`UpgradeRequest`**: Tracks the individual request per store. 
   - **Statuses**: `PENDING`, `AWAITING_PAYMENT` (if fee > 0), `READY_FOR_REVIEW` (paid or free), `APPROVED`, `REJECTED`.
4. **`Invoice`**: Created automatically via Prisma Transaction if the upgrade requires a fee.
5. **`Store`**: Upon approval, the boolean field `addonBusinessUpgrade` is set to `true`.

### The Upgrade Flow / مسار الترقية:
1. **Request (طلب الترقية)**: 
   - The frontend (`UpgradePage.tsx`) fetches dynamic pricing from `GET /api/platform-settings`.
2. **Submission (إرسال الطلب)**: 
   - Seller clicks submit. `POST /api/upgrade-requests` calculates the fee.
   - If free: Request goes straight to `READY_FOR_REVIEW`.
   - If paid: Request becomes `AWAITING_PAYMENT` and an `Invoice` is generated.
3. **Payment & Confirmation (الدفع والتأكيد)**: 
   - Admin verifies offline payment in the invoices dashboard and calls `POST /api/admin/invoices/[id]/confirm-payment`, which automatically updates the related `UpgradeRequest` to `READY_FOR_REVIEW`.
4. **Approval (الموافقة)**: 
   - Admin approves the request via `POST /api/admin/upgrade-requests/[id]/approve`.
   - The user's role is updated to `store_manager`.
   - The store's `addonBusinessUpgrade` flag is switched to `true`.
   - The request status becomes `APPROVED`.

---

## 3. Centralized Permissions / إدارة الصلاحيات المركزية
To avoid duplicate permission checks across the platform, a central helper function is provided.

**File:** `src/lib/permissions.ts`
```typescript
export function isBusinessAccount(user: { role?: string } | null | undefined): boolean {
  if (!user || !user.role) return false;
  return user.role === 'business' || user.role === 'store_manager';
}
```
*Usage:* Import and use `isBusinessAccount(session.user)` anywhere in the UI or APIs to gate access to Branches, Staff, and Taxes.

---

## 4. Internationalization (i18n) Texts / نصوص الترجمة المستخدمة

The platform uses an inline translation strategy via the helper `t(locale, 'Arabic', 'English')`. Below are the precise strings implemented across the new Business Upgrade UI to ensure full bilingual support:

### Seller Upgrade Page (`src/components/seller/UpgradePage.tsx`)
| Arabic (العربية) | English (الإنجليزية) |
| :--- | :--- |
| ترقية الحساب إلى متجر أعمال | Upgrade Account to Business Store |
| انتقل بحسابك التجاري إلى مستوى متقدم وأدر شبكة فروعك... | Scale your sales operations, manage branch channels and your team... |
| ما الذي ستحصل عليه عند الترقية؟ | What features will you unlock? |
| إدارة الفروع المتعددة | Manage Multiple Branches |
| إدارة طاقم العمل والصلاحيات | Team & Role Management |
| تقارير ضريبية وحلول B2B | Tax Reports & B2B Solutions |
| أولوية قصوى في الدعم الفني | VIP Priority Support |
| طلب التفعيل | Request Activation |
| مجاني مؤقتاً | Free promotion |
| حساب تاجر حالي: فردي | Current Type: Individual |
| طلب الترقية | per upgrade request |
| مراجعة أمنية سريعة لبيانات التاجر | Quick security check of seller data |
| تقديم طلب ترقية الحساب | Submit Upgrade Request |

### Admin Settings Page (`src/app/admin-secure-internal/settings/page.tsx`)
| Arabic (العربية) | English (الإنجليزية) |
| :--- | :--- |
| إعدادات ترقية الأعمال | Business Upgrade Settings |
| التحكم في سعر ترقية التاجر الفردي إلى متجر أعمال وإدارة العروض المجانية. | Control the pricing for upgrading individual sellers to business stores and manage free promos. |
| سعر الترقية (DZD) | Upgrade Price (DZD) |
| حالة العرض (ترقية مجانية مؤقتاً) | Promo Status (Free Upgrade Temporary) |
| تفعيل العرض المجاني | Enable Free Promo |
| تعطيل (تطبيق السعر الأساسي) | Disable (Apply Base Price) |

### Admin Queue (`src/components/admin/AdminUpgradeQueue.tsx`)
| Arabic (العربية) | English (الإنجليزية) |
| :--- | :--- |
| طابور ترقيات الأعمال | Business Upgrade Queue |
| لا يوجد طلبات ترقية حالياً | No upgrade requests currently |
| تأكيد الدفع | Confirm Payment |
| موافقة | Approve |
| رفض | Reject |

---
**Note / ملاحظة:** 
All API responses also include standardized English error/success messages that are parsed and translated by the frontend via `sonner` toast notifications. The RTL/LTR alignment is automatically handled by the `dir` attribute derived from the `locale` state.
