const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\seller\\BillingPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state for upgrade calculation and receipt file
code = code.replace(
  `const [payReceipt, setPayReceipt]     = useState('');`,
  `const [payReceipt, setPayReceipt]     = useState('');\n  const [payReceiptFile, setPayReceiptFile] = useState<File | null>(null);\n  const [upgradeCalc, setUpgradeCalc] = useState<any>(null);\n  const [isCalculatingUpgrade, setIsCalculatingUpgrade] = useState(false);`
);

// 2. Add useEffect to calculate upgrade
code = code.replace(
  `useEffect(() => { fetchData(); }, [user]);`,
  `useEffect(() => { fetchData(); }, [user]);\n\n  // Calculate upgrade cost dynamically\n  useEffect(() => {\n    if (!selectedPackageId || !user?.id) return;\n    const fetchUpgradeCalc = async () => {\n      setIsCalculatingUpgrade(true);\n      try {\n        const res = await fetch('/api/billing/calculate-upgrade', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({\n            userId: user.id,\n            packageId: selectedPackageId,\n            billingCycle,\n            addons: addonState\n          })\n        });\n        const data = await res.json();\n        if (data.success) {\n          setUpgradeCalc(data);\n        } else {\n          setUpgradeCalc(null);\n        }\n      } catch (e) {\n        console.error(e);\n        setUpgradeCalc(null);\n      } finally {\n        setIsCalculatingUpgrade(false);\n      }\n    };\n    \n    // Only calculate if we are selecting a new package or changing billing cycle/addons\n    fetchUpgradeCalc();\n  }, [selectedPackageId, billingCycle, addonState, user?.id]);`
);

// 3. Update handleSubscribe to upload the file first
code = code.replace(
  `  const handleSubscribe = async () => {\n    if (!selectedPackageId) {\n      toast.error(t(locale, 'يرجى اختيار باقة أولاً', 'Please select a package first'));\n      return;\n    }\n    setIsSubscribing(true);\n    try {\n      const res = await fetch('/api/billing/subscribe', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ userId: user?.id, packageId: selectedPackageId, billingCycle, addons: addonState, paymentMethod }),\n      });`,
  `  const handleSubscribe = async () => {\n    if (!selectedPackageId) {\n      toast.error(t(locale, 'يرجى اختيار باقة أولاً', 'Please select a package first'));\n      return;\n    }\n    if (paymentMethod === 'receipt' && !payReceiptFile && upgradeCalc?.invoiceAmount > 0) {\n      toast.error(t(locale, 'يرجى إرفاق صورة إيصال الدفع أولاً', 'Please attach the payment receipt image first'));\n      return;\n    }\n    setIsSubscribing(true);\n    try {\n      let finalReceiptUrl = '';\n      if (paymentMethod === 'receipt' && payReceiptFile) {\n        const formData = new FormData();\n        formData.append('file', payReceiptFile);\n        const uploadRes = await fetch('/api/upload', {\n          method: 'POST',\n          body: formData,\n        });\n        const uploadData = await uploadRes.json();\n        if (uploadData.success) {\n          finalReceiptUrl = uploadData.url;\n        } else {\n          throw new Error('Failed to upload receipt image');\n        }\n      }\n      const res = await fetch('/api/billing/subscribe', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ userId: user?.id, packageId: selectedPackageId, billingCycle, addons: addonState, paymentMethod, receiptImage: finalReceiptUrl }),\n      });`
);

// 4. Modify handleSubscribe success action (remove activeTab/setCurrentPage changes)
code = code.replace(
  `        if (paymentMethod === 'receipt' && data.invoiceAmount > 0) {\n          // Switch to pay tab so they can upload the receipt\n          setCurrentPage(user?.role === 'store_manager' ? 'store-billing-pay' : 'seller-billing-pay');\n          setPayAmount(String(data.invoiceAmount));\n          if (data.invoice && data.invoice.id) {\n            setPendingInvoiceId(data.invoice.id);\n          }\n        }`,
  `        setPayReceiptFile(null);\n        // The invoice and receipt are already created by the backend if they uploaded an image.`
);

// 5. Update UI for the order summary block
code = code.replace(
  `{billingCycle === 'ANNUAL' && <p className="text-green-500">{t(locale, \`يُدفع سنوياً (\${fmt(totalMonthly)}/شهر)\`, \`Billed annually (\${fmt(totalMonthly)}/mo)\`)}</p>}
                          {sub && sub.packageId !== selectedPackageId && selectedPackage?.price > 0 && (
                            <p className="text-indigo-500 font-bold mt-1">
                              {t(locale, 'سيتم حساب الترقية وإرجاع رصيد الأيام المتبقية تلقائياً.', 'Pro-rata will be calculated automatically.')}
                            </p>
                          )}`,
  `{billingCycle === 'ANNUAL' && <p className="text-green-500">{t(locale, \`يُدفع سنوياً (\${fmt(totalMonthly)}/شهر)\`, \`Billed annually (\${fmt(totalMonthly)}/mo)\`)}</p>}
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
                          )}`
);

// 6. Add File Upload under Payment Method
const fileUploadHTML = `
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
`;
code = code.replace(
  `{paymentMethod === 'wallet' && wallet && (`,
  fileUploadHTML + `\n                            {paymentMethod === 'wallet' && wallet && (`
);

fs.writeFileSync(path, code);
console.log('Successfully refactored BillingPage.tsx');
