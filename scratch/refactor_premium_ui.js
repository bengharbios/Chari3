const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\admin-secure-internal\\billing\\merchants\\page.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `{/* Inline edit details block */}
                        {selectedSub?.id === sub.id && (
                          <TableRow className="bg-brand/5 hover:bg-brand/5 border-t">
                            <TableCell colSpan={8} className="px-6 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {/* Change Status */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'تغيير حالة الاشتراك', 'Change Status')}</Label>
                                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold w-full bg-background border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-xs">
                                      {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                                        <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                
                                {/* Receipt Image Viewer Button */}
                                {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage && (
                                  <div className="md:col-span-3 lg:col-span-5 border-t border-dashed border-brand/20 pt-4 mt-2 flex flex-col items-start gap-2">
                                    <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'المرفقات الدليلية', 'Proof Attachments')}</Label>
                                    <button 
                                      onClick={() => setZoomImage(sub.invoices[0].receipts[0].receiptImage)}
                                      className="inline-flex items-center gap-2 bg-brand text-navy hover:bg-brand/90 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {t(locale, 'معاينة إيصال الدفع البنكي 📄', 'View Bank Payment Receipt 📄')}
                                    </button>
                                  </div>
                                )}

                                {/* Reassign Package */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'تغيير الباقة الحالية', 'Change Plan')}</Label>
                                  <Select value={editForm.packageId} onValueChange={v => setEditForm(f => ({ ...f, packageId: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold w-full bg-background border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-xs">
                                      {packages.map(pkg => (
                                        <SelectItem key={pkg.id} value={pkg.id}>
                                          {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Extend end date */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'إضافة أيام إضافية للصلاحية', 'Add Active Days')}</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder={t(locale, 'أدخل عدد الأيام...', 'Days to add...')}
                                    value={editForm.addDays}
                                    onChange={e => setEditForm(f => ({ ...f, addDays: e.target.value }))}
                                    className="h-9 rounded-xl font-mono text-xs bg-background"
                                  />
                                </div>

                                {/* Free Commission toggle */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'الإعفاء من عمولات المبيعات', 'Commission Exemption')}</Label>
                                  <div className="flex items-center gap-2 py-2 px-3 border rounded-xl bg-background h-9 border-border">
                                    <Switch
                                      id={\`freeCommissionToggle-\${sub.id}\`}
                                      checked={editForm.freeCommission}
                                      onCheckedChange={v => setEditForm(f => ({ ...f, freeCommission: v }))}
                                    />
                                    <Label htmlFor={\`freeCommissionToggle-\${sub.id}\`} className="text-xs cursor-pointer select-none">
                                      {editForm.freeCommission
                                        ? t(locale, 'معفى بالكامل ✅', 'Fully Exempt ✅')
                                        : t(locale, 'يطبق نسب العمولات ❌', 'Charge Commissions ❌')}
                                    </Label>
                                  </div>
                                </div>

                                {/* Override Note */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'ملاحظة الأدمن المرفقة', 'Admin Override Note')}</Label>
                                  <Textarea
                                    placeholder={t(locale, 'اكتب سبباً للتجاوز اليدوي...', 'Reason for manual override...')}
                                    value={editForm.overrideNote}
                                    onChange={e => setEditForm(f => ({ ...f, overrideNote: e.target.value }))}
                                    className="h-9 min-h-[36px] rounded-xl text-xs py-2 bg-background border-border resize-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <Button variant="outline" size="sm" className="rounded-xl font-bold" asChild>
                                  <Link href={getAdminPath('billing/receipts')}>
                                    {t(locale, 'عرض إيصالات التاجر', 'View Receipts')}
                                  </Link>
                                </Button>
                                <Button variant="destructive" size="sm" className="rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200 border-0" onClick={() => handleDeleteSubscription(sub.id)}>
                                  {t(locale, 'حذف', 'Delete')}
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setSelectedSub(null)}>
                                  {t(locale, 'إلغاء', 'Cancel')}
                                </Button>
                                <Button size="sm" disabled={isSaving} className="gap-1 rounded-xl font-bold" onClick={() => handleSaveSubscription(sub.id)}>
                                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                  {t(locale, 'تطبيق التحديثات المحددة', 'Apply Overrides')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}`;

const premiumStr = `{/* Premium Inline edit details block */}
                        {selectedSub?.id === sub.id && (
                          <TableRow className="bg-slate-50/60 dark:bg-slate-900/40 relative shadow-inner">
                            <TableCell colSpan={8} className="p-0 border-b-0">
                              <div className="relative border-s-4 border-brand p-6 xl:p-8 flex flex-col gap-6">
                                
                                {/* Header Section */}
                                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                  <div>
                                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                                      <ShieldAlert className="h-5 w-5 text-amber-500" />
                                      {t(locale, 'لوحة تحكم الاشتراك المتقدمة', 'Advanced Subscription Control')}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t(locale, 'قم بإدارة الباقة، التجاوزات اليدوية، ومعاينة الإيصالات الخاصة بهذا التاجر بصلاحيات الإدارة العليا.', 'Manage plan, manual overrides, and review receipts for this merchant with super-admin privileges.')}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setSelectedSub(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                  
                                  {/* Left Column: Quick Actions (Cols 1-4) */}
                                  <div className="xl:col-span-4 flex flex-col gap-5 bg-background p-5 rounded-2xl border border-border/60 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <RefreshCw className="h-4 w-4 text-brand" />
                                      <span className="font-bold text-sm">{t(locale, 'إعدادات الباقة الأساسية', 'Core Plan Settings')}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'حالة الاشتراك الحالية', 'Current Status')}</Label>
                                      <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                        <SelectTrigger className="h-11 rounded-xl text-sm font-bold w-full bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-sm font-bold">
                                          {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                                            <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'تغيير الباقة الفعالة', 'Active Package')}</Label>
                                      <Select value={editForm.packageId} onValueChange={v => setEditForm(f => ({ ...f, packageId: v }))}>
                                        <SelectTrigger className="h-11 rounded-xl text-sm font-bold w-full bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-sm font-bold">
                                          {packages.map(pkg => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                              {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Center Column: Manual Overrides (Cols 5-8) */}
                                  <div className="xl:col-span-4 flex flex-col gap-5 bg-background p-5 rounded-2xl border border-border/60 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <AlertCircle className="h-4 w-4 text-brand" />
                                      <span className="font-bold text-sm">{t(locale, 'التجاوزات والتحكم اليدوي', 'Manual Overrides')}</span>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'إضافة أيام إضافية (هدية / تمديد)', 'Extend Validity (Days)')}</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder={t(locale, 'مثال: 15 يوم...', 'e.g., 15 days...')}
                                        value={editForm.addDays}
                                        onChange={e => setEditForm(f => ({ ...f, addDays: e.target.value }))}
                                        className="h-11 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors"
                                      />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'إعفاء التاجر من جميع العمولات', 'Global Commission Exemption')}</Label>
                                      <div className="flex items-center justify-between py-2.5 px-4 border border-transparent bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:border-border transition-colors">
                                        <Label htmlFor={\`freeCommissionToggle-\${sub.id}\`} className="text-xs font-bold cursor-pointer select-none">
                                          {editForm.freeCommission
                                            ? <span className="text-green-600">{t(locale, 'التاجر معفى تماماً ✅', 'Fully Exempt ✅')}</span>
                                            : <span className="text-muted-foreground">{t(locale, 'تُطبّق عليه العمولات ❌', 'Standard Rates Apply ❌')}</span>}
                                        </Label>
                                        <Switch
                                          id={\`freeCommissionToggle-\${sub.id}\`}
                                          checked={editForm.freeCommission}
                                          onCheckedChange={v => setEditForm(f => ({ ...f, freeCommission: v }))}
                                          className="data-[state=checked]:bg-green-500"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column: Receipt & Notes (Cols 9-12) */}
                                  <div className="xl:col-span-4 flex flex-col gap-4">
                                    <div className="flex flex-col gap-2 h-full">
                                      {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage ? (
                                        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-1 min-h-[140px] relative overflow-hidden group">
                                          <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                          <BadgePercent className="h-8 w-8 text-brand mb-3 opacity-80" />
                                          <h4 className="font-bold text-sm text-brand-foreground mb-1">{t(locale, 'إيصال دفع بنكي مرفق', 'Bank Receipt Attached')}</h4>
                                          <p className="text-[10px] text-muted-foreground mb-4 px-4">{t(locale, 'التاجر قام برفع إيصال مالي لإثبات التحويل.', 'Merchant uploaded a proof of payment.')}</p>
                                          
                                          <button 
                                            onClick={() => setZoomImage(sub.invoices[0].receipts[0].receiptImage)}
                                            className="w-full relative z-10 flex items-center justify-center gap-2 bg-brand text-navy hover:bg-brand/90 font-black px-6 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(255,200,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,200,0,0.23)] hover:-translate-y-0.5 transition-all"
                                          >
                                            <FileText className="h-4 w-4" />
                                            {t(locale, 'معاينة الإيصال', 'View Receipt')}
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-1 min-h-[140px]">
                                          <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                          <p className="text-xs font-bold text-muted-foreground">{t(locale, 'لا توجد مرفقات دفع', 'No Payment Attachments')}</p>
                                        </div>
                                      )}

                                      <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden flex-shrink-0">
                                        <Textarea
                                          placeholder={t(locale, 'اكتب ملاحظة التجاوز اليدوي (اختياري)...', 'Write an admin note (optional)...')}
                                          value={editForm.overrideNote}
                                          onChange={e => setEditForm(f => ({ ...f, overrideNote: e.target.value }))}
                                          className="h-[60px] min-h-[60px] text-xs py-3 px-4 border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* Action Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs bg-background border-border/60 hover:bg-muted" onClick={() => setSelectedSub(null)}>
                                      {t(locale, 'إلغاء التعديلات', 'Cancel Changes')}
                                    </Button>
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-100" onClick={() => handleDeleteSubscription(sub.id)}>
                                      <X className="h-3.5 w-3.5 me-1.5" />
                                      {t(locale, 'حذف الاشتراك', 'Delete Subscription')}
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs" asChild>
                                      <Link href={getAdminPath('billing/receipts')}>
                                        {t(locale, 'أرشيف الإيصالات', 'Receipts Archive')}
                                      </Link>
                                    </Button>
                                    <Button 
                                      disabled={isSaving} 
                                      className="rounded-xl font-black h-10 px-8 text-xs shadow-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-all" 
                                      onClick={() => handleSaveSubscription(sub.id)}
                                    >
                                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                                      {t(locale, 'حفظ التغييرات واعتمادها', 'Save & Apply Overrides')}
                                    </Button>
                                  </div>
                                </div>

                              </div>
                            </TableCell>
                          </TableRow>
                        )}`;

code = code.replace(targetStr, premiumStr);
fs.writeFileSync(path, code);
console.log('Successfully redesigned the billing merchants inline block');
