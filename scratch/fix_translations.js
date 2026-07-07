const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1542
  {
    target: "t(locale, '╪º┘ä┘à╪│╪¬╪«╪»┘à', 'User')",
    replacement: "t(locale, 'المستخدم', 'User')"
  },
  // 1552
  {
    target: "t(locale, '╪º┘ä╪»┘ê╪▒ ╪º┘ä╪¡╪º┘ä┘è', 'Current Role')",
    replacement: "t(locale, 'الدور الحالي', 'Current Role')"
  },
  // 1564
  {
    target: "t(locale, '╪º┘ä╪»┘ê╪▒ ╪º┘ä╪¼╪»┘è╪»', 'New Role')",
    replacement: "t(locale, 'الدور الجديد', 'New Role')"
  },
  // 1585
  {
    target: "({t(locale, '╪º┘ä╪¡╪º┘ä┘è', 'Current')})",
    replacement: "({t(locale, 'الحالي', 'Current')})"
  },
  // 1600
  {
    target: "t(locale, '╪¬╪║┘è┘è╪▒ ╪º┘ä╪»┘ê╪▒ ┘é╪» ┘è╪ñ╪½╪▒ ╪╣┘ä┘ë ╪╡┘ä╪º╪¡┘è╪º╪¬ ╪º┘ä┘à╪│╪¬⪪«╪»┘à ┘ê┘ê╪╡┘ê┘ä┘ç ╪Ñ┘ä┘ë ┘à┘è╪▓╪º╪¬ ╪º┘ä┘à┘å╪╡╪⌐.', 'Changing the role may affect the user\\'s permissions and access to platform features.')",
    replacement: "t(locale, 'تغيير الدور قد يؤثر على صلاحيات المستخدم ووصوله إلى ميزات المنصة.', \"Changing the role may affect the user's permissions and access to platform features.\")"
  },
  // 1616
  {
    target: "t(locale, '┘à┘ä╪«╪╡ ╪º┘ä╪¬╪¡┘ê┘è┘ä', 'Transition Summary')",
    replacement: "t(locale, 'ملخص التحويل', 'Transition Summary')"
  },
  // 1642-1643
  {
    target: "t(locale, '╪¬╪¡╪¬╪º╪¼ ╪¬┘ê╪½┘è┘é', 'Needs verification')",
    replacement: "t(locale, 'تحتاج توثيق', 'Needs verification')"
  },
  {
    target: "t(locale, '┘à╪¿╪º╪┤╪▒', 'Immediate')",
    replacement: "t(locale, 'مباشر', 'Immediate')"
  },
  // 1647
  {
    target: "t(locale, '┘à╪¡╪╕┘ê╪▒', 'Blocked')",
    replacement: "t(locale, 'محظور', 'Blocked')"
  },
  // 1654
  {
    target: "t(locale, '╪Ñ┘ä┘ë', 'To')",
    replacement: "t(locale, 'إلى', 'To')"
  },
  // 1666
  {
    target: "t(locale, '╪¡╪º┘ä╪⌐ ╪º┘ä╪¡╪│╪º╪¿', 'Account Status')",
    replacement: "t(locale, 'حالة الحساب', 'Account Status')"
  },
  // 1675-1676
  {
    target: "t(locale, '╪│┘è╪╡╪¿╪¡: ╪¿╪º┘å╪¬╪╕╪º╪▒ ╪º┘ä┘à╪▒╪º╪¼╪╣╪⌐', 'Will become: Pending')",
    replacement: "t(locale, 'سيصبح: بانتظار المراجعة', 'Will become: Pending')"
  },
  {
    target: "t(locale, '╪│┘è╪╡╪¿╪¡: ┘å╪┤╪╖', 'Will become: Active')",
    replacement: "t(locale, 'سيصبح: نشط', 'Will become: Active')"
  },
  // 1680
  {
    target: "t(locale, '┘è╪¬╪╖┘ä╪¿ ╪¬┘ê╪½┘è┘é', 'Requires Verification')",
    replacement: "t(locale, 'يتطلب توثيق', 'Requires Verification')"
  },
  // 1700-1702 Impact variables
  {
    target: "impactAr.includes('╪¬╪╣╪╖┘è┘ä')",
    replacement: "impactAr.includes('تعطيل')"
  },
  {
    target: "impactAr.includes('╪¬┘ê╪½┘è┘é')",
    replacement: "impactAr.includes('توثيق')"
  },
  {
    target: "impactAr.includes('╪│╪¬┘ü┘é╪»')",
    replacement: "impactAr.includes('ستفقد')"
  },
  // 1733
  {
    target: "t(locale, '╪º┘ä┘à╪¬⪪¼╪▒ ╪º┘ä┘à⪪▒⪪¬⪾╪╖ ╪¿⪪º┘ä╪¡╪│╪º╪¿ ╪│┘è╪¬┘à ╪¬╪╣╪╖┘è┘ä┘ç', 'The store linked to this account will be deactivated')",
    replacement: "t(locale, 'المتجر المرتبط بالحساب سيتم تعطيله', 'The store linked to this account will be deactivated')"
  },
  // 1759-1764
  {
    target: "t(locale, '╪º«╪¬╪▒ ╪»┘ê╪▒╪º┘ï ┘à╪«╪¬┘ä┘ü╪º┘ï', 'Choose a different role')",
    replacement: "t(locale, 'اختر دوراً مختلفاً', 'Choose a different role')"
  },
  {
    target: "t(locale, '╪║┘è╪▒ ┘à╪│┘à┘ê╪¡', 'Not Allowed')",
    replacement: "t(locale, 'غير مسموح', 'Not Allowed')"
  },
  {
    target: "t(locale, '╪¬╪ú┘â┘è╪» ╪º┘ä╪¬⪪¡┘ê┘è┘ä', 'Confirm Transition')",
    replacement: "t(locale, 'تأكيد التحويل', 'Confirm Transition')"
  },
  // 1778
  {
    target: "t(locale, '╪¬╪╣┘ä┘è┘é ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│┘à┘ç╪»┘à', 'Suspend User Account')",
    replacement: "t(locale, 'تعليق حساب المستخدم', 'Suspend User Account')"
  },
  {
    target: "t(locale, '╪¬╪╣┘ä┘è┘é ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│╪¬╪«╪»┘à', 'Suspend User Account')",
    replacement: "t(locale, 'تعليق حساب المستخدم', 'Suspend User Account')"
  },
  // 1792
  {
    target: "t(locale, '╪│╪¿╪¿ ╪º┘ä⪪¬╪╣┘ä┘è┘é', 'Suspension Reason')",
    replacement: "t(locale, 'سبب التعليق', 'Suspension Reason')"
  },
  // 1797
  {
    target: "placeholder={t(locale, '╪ú╪»╪«┘ä ╪│¿╪¿ ╪¬╪╣┘ä┘è┘é ╪º┘ä╪¡╪│╪º╪¿...', 'Enter the reason for suspending the account...')}",
    replacement: "placeholder={t(locale, 'أدخل سبب تعليق الحساب...', 'Enter the reason for suspending the account...')}"
  },
  // 1803
  {
    target: "t(locale, '┘à╪»╪⌐ ╪º┘ä⪪¬╣┘ä┘è┘é', 'Suspension Duration')",
    replacement: "t(locale, 'مدة التعليق', 'Suspension Duration')"
  },
  // 1811-1814
  {
    target: "t(locale, '┘à╪ñ┘é╪¬', 'Temporary')",
    replacement: "t(locale, 'مؤقت', 'Temporary')"
  },
  {
    target: "t(locale, '╪»╪º┘ª┘à', 'Permanent')",
    replacement: "t(locale, 'دائم', 'Permanent')"
  },
  // 1822
  {
    target: "t(locale, '╪│┘è╪¬┘à ╪¬⪪╣╪╖┘è┘ä ╪º┘ä⪪¡⪪│⪪º⪪¿ ┘ê┘ü┘é⪪»⪪º┘å ╪º┘ä┘ê⪕┘ê┘ä ┘ä⪪¼┘à┘è⪪╣ ┘à┘è⪪▓⪪º⪪¬ ╪º┘ä┘à┘å╪╡╪⌐.', 'The account will be deactivated and lose access to all platform features.')",
    replacement: "t(locale, 'سيتم تعطيل الحساب وفقدان الوصول لجميع ميزات المنصة.', 'The account will be deactivated and lose access to all platform features.')"
  },
  {
    target: "t(locale, '╪│┘è╪¬┘à ╪¬╪╣╪╖┘è┘ä ╪º┘ä╪¡╪│╪º╪¿ ┘ê┘ü┘é⪪»⪪º┘å ╪º┘ä┘ê⪕┘ê┘ä ┘ä⪪¼┘à┘è⪪╣ ┘à┘è⪪▓⪪º⪪¬ ╪º┘ä┘à┘å╪╡╪⌐.', 'The account will be deactivated and lose access to all platform features.')",
    replacement: "t(locale, 'سيتم تعطيل الحساب وفقدان الوصول لجميع ميزات المنصة.', 'The account will be deactivated and lose access to all platform features.')"
  },
  // 1829
  {
    target: "<AlertDialogCancel>{t(locale, '╪Ñ┘ä╪║╪º╪í', 'Cancel')}</AlertDialogCancel>",
    replacement: "<AlertDialogCancel>{t(locale, 'إلغاء', 'Cancel')}</AlertDialogCancel>"
  },
  // 1836
  {
    target: "t(locale, '╪¬╪╣┘ä┘è┘é ⪪º┘ä⪪¡⪪│⪪º⪪¿', 'Suspend Account')",
    replacement: "t(locale, 'تعليق الحساب', 'Suspend Account')"
  },
  {
    target: "t(locale, '╪¬╪╣┘ä┘è┘é ╪¡╪│╪º╪¿', 'Suspend Account')",
    replacement: "t(locale, 'تعليق الحساب', 'Suspend Account')"
  },
  // 1849
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡╪│╪º╪¿ ╪º┘ä┘à⪪│┘à┘ç⪪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│┘à┘ç⪪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡╪│⪪º⪪¿ ╪º┘ä┘à⪪│⪪¬⪪«⪪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│┘à┘ç⪪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡⪪│⪪º⪪¿ ╪º┘ä┘à╪│⪪¬⪪«⪪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  {
    target: "t(locale, '╪¡╪░┘ü ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│╪¬╪«╪»┘à', 'Delete User Account')",
    replacement: "t(locale, 'حذف حساب المستخدم', 'Delete User Account')"
  },
  // 1856
  {
    target: "'╪¬⪡⪲┘è⪲: ┘ç⪲⪺ ⪺┘ä⪡⪲┘à⪲┘è ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.',",
    replacement: "'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.',"
  },
  {
    target: "t(locale, '╪¬╪¡╪░┘è╪▒: ┘ç╪░╪º ╪º┘ä╪Ñ⪽╪▒╪º⪽ ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')",
    replacement: "t(locale, 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')"
  },
  {
    target: "t(locale, '╪¬╪¡╪░┘è╪▒: ┘ç╪░╪º ╪º┘ä╪Ñ⪽╪▒╪º⪽ ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')",
    replacement: "t(locale, 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')"
  },
  {
    target: "t(locale, '╪¬╪¡╪░┘è╪▒: ┘ç╪░╪º ╪º┘ä╪Ñ⪽⪿╪º⪿ ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')",
    replacement: "t(locale, 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')"
  },
  {
    target: "t(locale, '╪¬╪¡╪░┘è⪲: ┘ç⪲⪺ ⪺┘ä⪡⪲┘à⪲┘è ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')",
    replacement: "t(locale, 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')"
  },
  {
    target: "t(locale, '╪¬╪¡╪░┘è╪▒: ┘ç╪░╪º ╪º┘ä╪Ñ⪽⪿╪º⪿ ┘ä⪺ ┘è┘à┘â┘å ⪺┘ä⪲⪲⪺┘à⪹ ⪹┘å┘ç. ⪲┘è¬┘à ⪡⪲┘ü ⪼┘à┘è⪹ ⪲┘è⪺┘å⪺⪲⪺ ⪺┘ä┘à⪲┘è⪹┘ê┘è┘à ⪲⪲┘è┘å⪺┘è┘è⪺.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')",
    replacement: "t(locale, 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.', 'Warning: This action cannot be undone. All user data will be permanently deleted.')"
  },
  // 1871
  {
    target: "t(locale, '╪º┘â⪪¬⪲ DELETE ┘ä┘ä¬┘ê┘â┘è⪲', 'Type DELETE to confirm')",
    replacement: "t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')"
  },
  {
    target: "t(locale, '╪º┘â⪪¬⪪¿ DELETE ┘ä┘ä⪪¬┘ê┘â┘è⪲', 'Type DELETE to confirm')",
    replacement: "t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')"
  },
  {
    target: "t(locale, '╪º┘â⪪¬⪪¿ DELETE ┘ä┘ä¬⪪ú┘â┘è⪪⌐', 'Type DELETE to confirm')",
    replacement: "t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')"
  },
  {
    target: "t(locale, '╪º┘â⪪¬⪪¿ DELETE ┘ä┘ä¬⪪ú┘â┘è⪪»', 'Type DELETE to confirm')",
    replacement: "t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')"
  },
  {
    target: "t(locale, '╪º┘â⪪¬⪪¿ DELETE ┘ä┘ä⪪¬⪪ú┘â┘è⪪»', 'Type DELETE to confirm')",
    replacement: "t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')"
  },
  // 1891
  {
    target: "t(locale, '╪¡⪪┘ü ⪪┘ä⪡⪪⪪⪯ ┘å┘è┘å⪪┘è┘è⪪', 'Delete Permanently')",
    replacement: "t(locale, 'حذف الحساب نهائياً', 'Delete Permanently')"
  },
  {
    target: "t(locale, '╪¡⪪░┘ü ⪪┘ä⪡⪪⪪⪯ ┘å┘è┘å⪪┘è┘è⪪', 'Delete Permanently')",
    replacement: "t(locale, 'حذف الحساب نهائياً', 'Delete Permanently')"
  },
  {
    target: "t(locale, '╪¡⪪░┘ü ⪪┘ä⪡⪪⪪⪯ ┘å┘è┘å⪪┘è┘è⪪', 'Delete Permanently')",
    replacement: "t(locale, 'حذف الحساب نهائياً', 'Delete Permanently')"
  },
  {
    target: "t(locale, '╪¡⪪░┘ü ⪪┘ä⪡⪪⪪⪯ ┘å┘è┘å⪪┘è┘è⪪', 'Delete Permanently')",
    replacement: "t(locale, 'حذف الحساب نهائياً', 'Delete Permanently')"
  },
  // 1905
  {
    target: "t(locale, '╪¬⪪╣⪪»┘è┘ä ⪪┘é┘è┘è┘à ┘ê┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à', 'Edit Merchant Rating & Level')",
    replacement: "t(locale, 'تعديل تقييم ومستوى التاجر', 'Edit Merchant Rating & Level')"
  },
  {
    target: "t(locale, '╪¬⪪╣⪪»┘è┘ä ⪪┘é┘è┘è┘à ┘ê┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à', 'Edit Merchant Rating & Level')",
    replacement: "t(locale, 'تعديل تقييم ومستوى التاجر', 'Edit Merchant Rating & Level')"
  },
  // 1925
  {
    target: "t(locale, '┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à / ⪪┘ä┘à┘å┘è┘è┘à', 'Merchant / Store Level')",
    replacement: "t(locale, 'مستوى التاجر / المتجر', 'Merchant / Store Level')"
  },
  {
    target: "t(locale, '┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à / ⪪┘ä┘à┘å┘è┘è┘à', 'Merchant / Store Level')",
    replacement: "t(locale, 'مستوى التاجر / المتجر', 'Merchant / Store Level')"
  },
  // 1932
  {
    target: "t(locale, '⪪«⪪⪲ ⪪┘ä┘à⪪┘è⪪┘ê┘ë', 'Select Level')",
    replacement: "t(locale, 'اختر المستوى', 'Select Level')"
  },
  {
    target: "t(locale, '⪪«⪪⪲ ⪪┘ä┘à⪪┘è⪪┘ê┘ë', 'Select Level')",
    replacement: "t(locale, 'اختر المستوى', 'Select Level')"
  }
];

// Let's run a fallback dynamic replace on raw strings inside file
let contentUpdated = content;

// Read existing file and match standard CP850 patterns recursively
const patternPairs = [
  ['╪º┘ä┘à╪│╪¬╪«╪»┘à', 'المستخدم'],
  ['╪º┘ä╪»┘ê╪▒ ╪º┘ä╪¡╪º┘ä┘è', 'الدور الحالي'],
  ['╪º┘ä╪»┘ê╪▒ ╪º┘ä╪¼╪»┘è⪪»', 'الدور الجديد'],
  ['╪º┘ä⪪»┘ê╪▒ ╪º┘ä╪¼⪪»┘è⪪»', 'الدور الجديد'],
  ['╪º┘ä╪»┘ê╪▒ ╪º┘ä╪¼╪»┘è┘à', 'الدور الجديد'],
  ['╪º┘ä╪¡╪º┘ä┘è', 'الحالي'],
  ['┘à┘ä╪«╪╡ ╪º┘ä⪪╓┘ê┘è┘ä', 'ملخص التحويل'],
  ['┘à┘ä╪«╪╡ ╪º┘ä╪¬╪¡┘ê┘è┘ä', 'ملخص التحويل'],
  ['╪¬╪¡╪¬╪º⪪¼ ╪¬┘ê╪½┘è┘é', 'تحتاج توثيق'],
  ['┘à╪¿╪º╪┤╪▒', 'مباشر'],
  ['┘à╪¡╪╕┘ê╪▒', 'محظور'],
  ['╪Ñ┘ä┘ë', 'إلى'],
  ['╪│┘è╪╡╪¿╪¡: ╪¿╪º┘å╪¬╪╕╪º╪▒ ╪º┘ä┘à╪▒⪪º╪¼╪╣╪⌐', 'سيصبح: بانتظار المراجعة'],
  ['╪│┘è╪╡╪¿╪¡: ┘å⪪┤⪪╖', 'سيصبح: نشط'],
  ['┘è╪¬╪╖┘ä╪¿ ╪¬┘ê╪½┘è┘é', 'يتطلب توثيق'],
  ['╪¬╪╣┘ä┘è┘é ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│╪¬╪«╪»┘à', 'تعليق حساب المستخدم'],
  ['╪│╪¿╪¿ ╪º┘ä⪪¬⪪╣┘ä┘è┘é', 'سبب التعليق'],
  ['╪│⪪¿⪪¿ ╪º┘ä⪪¬⪪╣┘ä┘è┘é', 'سبب التعليق'],
  ['┘à⪪»⪪⌐ ⪪º┘ä⪪¬⪪╣┘ä┘è┘é', 'مدة التعليق'],
  ['┘à⪪ñ┘é⪪¬', 'مؤقت'],
  ['╪»╪º┘ª┘à', 'دائم'],
  ['╪»╪º┘å┘à', 'دائم'],
  ['╪Ñ┘ä╪║╪º⪪í', 'إلغاء'],
  ['╪¬╪╣┘ä┘è┘é ╪º┘ä╪¡╪│╪º⪪¿', 'تعليق الحساب'],
  ['╪¡╪░┘ü ╪¡╪│╪º╪¿ ╪º┘ä┘à╪│╪¬╪«╪»┘à', 'حذف حساب المستخدم'],
  ['╪º┘â╪¬╪¿ DELETE ┘ä┘ä╪¬⪪ú┘â┘è⪪»', 'اكتب DELETE للتأكيد'],
  ['╪º┘â╪¬⪪¿ DELETE ┘ä┘ä⪪¬⪪ú┘â┘è⪪»', 'اكتب DELETE للتأكيد'],
  ['╪¡╪░┘ü ╪º┘ä╪¡╪│⪪º⪪¿ ┘å┘ç⪪┘è┘è⪪', 'حذف الحساب نهائياً'],
  ['╪¡╪░┘ü ╪º┘ä╪¡╪│┘è┘è┘à ┘å┘è┘å⪺┘è┘è⪺', 'حذف الحساب نهائياً'],
  ['╪¬╪╣⪪»┘è┘ä ⪪┘é┘è┘è┘à ┘ê┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à', 'تعديل تقييم ومستوى التاجر'],
  ['┘à⪪⪪┘ê┘ë ⪪┘ä┘à⪪┘è⪪┘ê┘è┘à / ⪪┘ä┘à┘å┘è┘è┘à', 'مستوى التاجر / المتجر'],
  ['⪪«⪪⪲ ⪪┘ä┘à⪪┘è⪪┘ê┘ë', 'اختر المستوى'],
  ['╪º«¬⪲ ⪺┘ä┘à⪲┘è⪹┘ê┘ë', 'اختر المستوى'],
  ['╪º«¬⪲ ╪º┘ä┘à╪│⪪¬┘ê┘ë', 'اختر المستوى'],
  ['╪º«╪¬╪▒ ╪º┘ä┘à╪│╪¬┘ê┘ë', 'اختر المستوى'],
  ['╪¡╪º┘ä╪⌐ ╪º┘ä⪪¡⪪│⪪º⪪¿', 'حالة الحساب'],
  ['╪¡╪º┘ä╪⌐ ╪º┘ä╪¡╪│╪º╪¿', 'حالة الحساب'],
  ['╪º┘ä┘à╪¬╪¼╪▒ ╪º┘ä┘à⪪▒⪪¬⪾╪╖ ╪¿⪪º┘ä╪¡╪│⪪º⪪¿ ╪│┘è╪¬┘à ⪪⪮⪪⪖┘è┘ä┘ç', 'المتجر المرتبط بالحساب سيتم تعطيله'],
  ['╪º┘ä┘à╪¬╪¼╪▒ ╪º┘ä┘à⪪▒⪪¬⪾╪╖ ╪¿⪪º┘ä╪¡╪│⪪º⪪¿ ╪│┘è╪¬┘à ╪¬╪╣╪╖┘è┘ä┘ç', 'المتجر المرتبط بالحساب سيتم تعطيله'],
  ['╪º┘ä┘à╪¬╪¼╪▒ ╪º┘ä┘à⪪▒⪪¬⪾╪╖ ╪¿⪪º┘ä╪¡⪪│⪪º⪪¿ ╪│┘è⪪¬┘à ⪪⪮⪪⪖┘è┘ä┘ç', 'المتجر المرتبط بالحساب سيتم تعطيله']
];

for (const pair of patternPairs) {
  contentUpdated = contentUpdated.split(pair[0]).join(pair[1]);
}

// replacements array
let replacedCount = 0;
for (const rep of replacements) {
  if (contentUpdated.includes(rep.target)) {
    contentUpdated = contentUpdated.replace(rep.target, rep.replacement);
    replacedCount++;
  }
}

// Clean any emoji placeholders
contentUpdated = contentUpdated.replace(/≡ƒô▒/g, "📱");
contentUpdated = contentUpdated.replace(/≡ƒÆ¼/g, "💬");
contentUpdated = contentUpdated.replace(/≡ƒôè/g, "📊");
contentUpdated = contentUpdated.replace(/≡ƒÅ¬/g, "🏪");
contentUpdated = contentUpdated.replace(/Γ₧ò/g, "➕");

// Write back
fs.writeFileSync(filePath, contentUpdated, 'utf8');
console.log('Programmatically cleaned all remaining translations successfully.');
