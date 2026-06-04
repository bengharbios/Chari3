const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\admin-secure-internal\\billing\\merchants\\page.tsx';
let code = fs.readFileSync(path, 'utf8');

const receiptHTML = `
                                {/* Receipt Image Viewer */}
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
                                )}
`;

code = code.replace(
  `{/* Reassign Package */}`,
  receiptHTML + `\n                                {/* Reassign Package */}`
);

fs.writeFileSync(path, code);
console.log('Successfully refactored merchants page UI');
