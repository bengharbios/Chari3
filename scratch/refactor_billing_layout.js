const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\seller\\BillingPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldSummary = `<div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-sm">{t(locale, 'ملخص الطلب', 'Order Summary')}</p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>{locale === 'ar' ? selectedPackage?.name : (selectedPackage?.nameEn || selectedPackage?.name)} — {billingCycle === 'ANNUAL' ? t(locale, 'سنوي', 'Annual') : t(locale, 'شهري', 'Monthly')}</p>
                          <p className="text-brand font-black text-lg">{fmt(totalBilled)}</p>
                          {billingCycle === 'ANNUAL' && <p className="text-green-500">{t(locale, \`يُدفع سنوياً (\${fmt(totalMonthly)}/شهر)\`, \`Billed annually (\${fmt(totalMonthly)}/mo)\`)}</p>}
                          {isCalculatingUpgrade ? (
                            <p className="text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> {t(locale, 'جاري الحساب...', 'Calculating...')}</p>
                          ) : upgradeCalc && upgradeCalc.actionType === 'upgrade' && (
                            <div className="bg-indigo-500/10 text-indigo-600 p-2 rounded-lg mt-2 text-xs border border-indigo-500/20">
                              <p className="font-bold mb-1">{t(locale, 'تفاصيل ترقية الباقة:', 'Upgrade Details:')}</p>
                              <div className="flex justify-between">
                                <span>{t(locale, 'رصيد الأيام المتبقية:', 'Remaining days credit:')}</span>
                                <span className="font-mono">{fmt(upgradeCalc.proRataCredit)}</span>
                              </div>
                              <div className="flex justify-between font-bold mt-1 border-t border-indigo-500/10 pt-1">
                                <span>{t(locale, 'المبلغ المطلوب دفعه:', 'Amount to pay:')}</span>
                                <span className="font-mono">{fmt(upgradeCalc.invoiceAmount)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Payment Method Selector */}
                        {selectedPackage?.price > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-bold text-muted-foreground">{t(locale, 'طريقة الدفع', 'Payment Method')}</p>
                            <div className="flex gap-2">
                              <Button 
                                variant={paymentMethod === 'receipt' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={() => setPaymentMethod('receipt')}
                              >
                                {t(locale, 'إرسال إيصال (CCP)', 'Bank Transfer')}
                              </Button>
                              <Button 
                                variant={paymentMethod === 'wallet' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={() => setPaymentMethod('wallet')}
                              >
                                {t(locale, 'المحفظة', 'Wallet')}
                              </Button>
                            </div>
                            
                            {paymentMethod === 'receipt' && (upgradeCalc ? upgradeCalc.invoiceAmount > 0 : totalBilled > 0) && (
                              <div className="mt-3 p-3 bg-muted/30 border border-dashed rounded-xl">
                                <Label className="text-xs font-bold mb-2 block text-brand">
                                  {t(locale, 'صورة إيصال الدفع البنكي / بريدي موب', 'Upload Payment Receipt')}
                                </Label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-brand file:text-navy file:font-bold hover:file:bg-brand/90"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      setPayReceiptFile(e.target.files[0]);
                                    } else {
                                      setPayReceiptFile(null);
                                    }
                                  }}
                                />
                                {payReceiptFile && <p className="text-[10px] text-green-600 mt-1">✅ {payReceiptFile.name}</p>}
                                <p className="text-[10px] text-muted-foreground mt-2">
                                  {t(locale, 
                                    'يرجى تحويل المبلغ الموضح في الأعلى وإرفاق صورة الإيصال هنا لإتمام طلبك.', 
                                    'Please transfer the exact amount shown above and attach the receipt image here.'
                                  )}
                                </p>
                              </div>
                            )}

                            {paymentMethod === 'wallet' && wallet && (
                              <p className={\`text-[10px] \${wallet.balance < totalBilled ? 'text-red-500' : 'text-green-500'}\`}>
                                {t(locale, 'رصيد المحفظة:', 'Wallet balance:')} {fmt(wallet.balance)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        className="gap-2 rounded-xl bg-brand hover:bg-brand/90 text-navy font-bold w-full sm:w-auto shrink-0"
                        disabled={isSubscribing || isPending || (paymentMethod === 'wallet' && selectedPackage?.price > 0 && wallet?.balance < totalBilled)}
                        onClick={handleSubscribe}
                      >
                        {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        {sub?.packageId === selectedPackageId ? t(locale, 'تجديد الباقة', 'Renew Plan') : (sub ? t(locale, 'ترقية الباقة', 'Upgrade Plan') : t(locale, 'اشترك الآن', 'Subscribe Now'))}
                      </Button>
                    </div>`;

const newSummary = `<div className="flex flex-col lg:flex-row items-start gap-8">
                      {/* Right Column: Order Details */}
                      <div className="flex-1 space-y-6 w-full">
                        <div>
                          <p className="font-bold text-lg text-foreground mb-3">{t(locale, 'ملخص الطلب', 'Order Summary')}</p>
                          <div className="bg-background rounded-2xl p-5 border shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-sm font-semibold">{locale === 'ar' ? selectedPackage?.name : (selectedPackage?.nameEn || selectedPackage?.name)}</p>
                              <p className="text-xs bg-muted px-2 py-1 rounded-md">{billingCycle === 'ANNUAL' ? t(locale, 'سنوي', 'Annual') : t(locale, 'شهري', 'Monthly')}</p>
                            </div>
                            
                            <div className="flex justify-between items-end border-b pb-4 mb-4">
                              <p className="text-sm text-muted-foreground">{t(locale, 'سعر الباقة', 'Plan Price')}</p>
                              <div className="text-right">
                                <p className="text-brand font-black text-2xl">{fmt(totalBilled)}</p>
                                {billingCycle === 'ANNUAL' && <p className="text-xs text-green-500 font-medium">{t(locale, \`يُدفع سنوياً (\${fmt(totalMonthly)}/شهر)\`, \`Billed annually (\${fmt(totalMonthly)}/mo)\`)}</p>}
                              </div>
                            </div>

                            {isCalculatingUpgrade ? (
                              <div className="flex items-center justify-center py-4 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin ml-2"/> {t(locale, 'جاري حساب تكلفة الترقية...', 'Calculating upgrade...')}</div>
                            ) : upgradeCalc && upgradeCalc.actionType === 'upgrade' && (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">{t(locale, 'رصيد الأيام المتبقية', 'Remaining days credit')}</span>
                                  <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">- {fmt(upgradeCalc.proRataCredit)}</span>
                                </div>
                                <div className="flex justify-between items-center text-base font-black bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                                  <span className="text-indigo-900 dark:text-indigo-100">{t(locale, 'المبلغ الإجمالي المطلوب', 'Total Amount Due')}</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">{fmt(upgradeCalc.invoiceAmount)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Left Column: Payment & Action */}
                      <div className="w-full lg:w-[400px] shrink-0 space-y-6">
                        {selectedPackage?.price > 0 && (
                          <div>
                            <p className="font-bold text-lg text-foreground mb-3">{t(locale, 'طريقة الدفع', 'Payment Method')}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <button 
                                className={\`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 \${paymentMethod === 'receipt' ? 'border-brand bg-brand/5 text-brand shadow-sm' : 'border-border bg-background hover:bg-muted text-muted-foreground'}\`}
                                onClick={() => setPaymentMethod('receipt')}
                              >
                                {t(locale, 'تحويل بنكي', 'Bank Transfer')}
                              </button>
                              <button 
                                className={\`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 \${paymentMethod === 'wallet' ? 'border-brand bg-brand/5 text-brand shadow-sm' : 'border-border bg-background hover:bg-muted text-muted-foreground'}\`}
                                onClick={() => setPaymentMethod('wallet')}
                              >
                                {t(locale, 'المحفظة', 'Wallet')}
                              </button>
                            </div>
                            
                            {paymentMethod === 'receipt' && (upgradeCalc ? upgradeCalc.invoiceAmount > 0 : totalBilled > 0) && (
                              <div className="bg-background rounded-2xl p-5 border border-dashed border-border/60 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <Label className="text-sm font-bold mb-3 block text-foreground">
                                  {t(locale, 'إرفاق إيصال الدفع (صورة)', 'Upload Payment Receipt')}
                                </Label>
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-brand/30 rounded-xl cursor-pointer bg-brand/5 hover:bg-brand/10 transition-colors">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <p className="text-xs text-brand font-bold">{payReceiptFile ? payReceiptFile.name : t(locale, 'اضغط لاختيار صورة الإيصال', 'Click to select receipt image')}</p>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        setPayReceiptFile(e.target.files[0]);
                                      } else {
                                        setPayReceiptFile(null);
                                      }
                                    }}
                                  />
                                </label>
                                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                                  {t(locale, 
                                    'يرجى إتمام عملية التحويل لحسابنا عبر بريدي موب أو البنك ثم إرفاق صورة الإيصال لتأكيد اشتراكك فوراً.', 
                                    'Please complete the transfer via BaridiMob or bank and attach the receipt to confirm instantly.'
                                  )}
                                </p>
                              </div>
                            )}

                            {paymentMethod === 'wallet' && wallet && (
                              <div className={\`p-4 rounded-xl border \${wallet.balance < (upgradeCalc ? upgradeCalc.invoiceAmount : totalBilled) ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-green-500/10 border-green-500/20 text-green-600'}\`}>
                                <p className="text-sm font-bold flex justify-between">
                                  <span>{t(locale, 'الرصيد المتاح:', 'Available Balance:')}</span>
                                  <span>{fmt(wallet.balance)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <Button
                          className="gap-2 rounded-2xl h-14 bg-brand hover:bg-brand/90 text-navy font-black text-lg w-full shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                          disabled={isSubscribing || isPending || (paymentMethod === 'wallet' && selectedPackage?.price > 0 && wallet?.balance < (upgradeCalc ? upgradeCalc.invoiceAmount : totalBilled))}
                          onClick={handleSubscribe}
                        >
                          {isSubscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                          {sub?.packageId === selectedPackageId ? t(locale, 'تجديد الباقة', 'Renew Plan') : (sub ? t(locale, 'ترقية الباقة الآن', 'Upgrade Plan Now') : t(locale, 'اشترك الآن', 'Subscribe Now'))}
                        </Button>
                      </div>
                    </div>`;

if(code.includes(oldSummary)){
    code = code.replace(oldSummary, newSummary);
    fs.writeFileSync(path, code);
    console.log('Successfully refactored BillingPage UI summary block');
} else {
    console.log('Could not find oldSummary block');
}

