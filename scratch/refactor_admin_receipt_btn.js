const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\admin-secure-internal\\billing\\merchants\\page.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldReceiptHTML = `{/* Receipt Image Viewer */}
                                {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage && (
                                  <div className="space-y-1.5 md:col-span-3 lg:col-span-5 border-t pt-4 mt-2">
                                    <Label className="text-xs font-bold text-brand">{t(locale, 'صورة إيصال الدفع المرفق (انقر للتكبير)', 'Attached Payment Receipt (Click to enlarge)')}</Label>
                                    <div className="mt-2 border rounded-xl overflow-hidden bg-muted/30 p-2 inline-block">
                                      <a href={sub.invoices[0].receipts[0].receiptImage} target="_blank" rel="noopener noreferrer">
                                        <img 
                                          src={sub.invoices[0].receipts[0].receiptImage} 
                                          alt="Receipt" 
                                          className="max-h-64 object-contain rounded-lg border shadow-sm hover:opacity-90 transition-opacity"
                                        />
                                      </a>
                                    </div>
                                  </div>
                                )}`;

const newReceiptHTML = `{/* Receipt Image Viewer Button */}
                                {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage && (
                                  <div className="md:col-span-3 lg:col-span-5 border-t border-dashed border-brand/20 pt-4 mt-2 flex flex-col items-start gap-2">
                                    <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'المرفقات الدليلية', 'Proof Attachments')}</Label>
                                    <a 
                                      href={sub.invoices[0].receipts[0].receiptImage} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 bg-brand text-navy hover:bg-brand/90 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {t(locale, 'معاينة إيصال الدفع البنكي 📄', 'View Bank Payment Receipt 📄')}
                                    </a>
                                  </div>
                                )}`;

if(code.includes(oldReceiptHTML)){
    code = code.replace(oldReceiptHTML, newReceiptHTML);
    fs.writeFileSync(path, code);
    console.log('Successfully refactored admin receipt button');
} else {
    console.log('Could not find oldReceiptHTML block');
}

