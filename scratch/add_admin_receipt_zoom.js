const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\admin-secure-internal\\billing\\merchants\\page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state for zoomImage
code = code.replace(
  `const [deleteId, setDeleteId] = useState<string | null>(null);`,
  `const [deleteId, setDeleteId] = useState<string | null>(null);\n  const [zoomImage, setZoomImage] = useState<string | null>(null);`
);

// 2. Add Dialog imports
if (!code.includes('DialogContent')) {
  code = code.replace(
    `import { Input } from "@/components/ui/input";`,
    `import { Input } from "@/components/ui/input";\nimport { Dialog, DialogContent } from "@/components/ui/dialog";`
  );
}

// 3. Update the receipt HTML to trigger the zoom
const oldReceiptHTML = `{/* Receipt Image Viewer Button */}
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

const newReceiptHTML = `{/* Receipt Image Viewer Button */}
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
                                )}`;

code = code.replace(oldReceiptHTML, newReceiptHTML);

// 4. Inject Dialog at the end of the return statement
code = code.replace(
  `{/* Bulk Actions Footer */}`,
  `{/* High-res Image Preview Modal */}
      <Dialog open={!!zoomImage} onOpenChange={(o) => !o && setZoomImage(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-0 shadow-none">
          <div className="relative flex justify-center items-center h-[80vh]">
            {zoomImage && (
              <img
                src={zoomImage}
                alt="Zoomed receipt"
                className="max-h-full max-w-full rounded-2xl shadow-2xl"
              />
            )}
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-4 -right-4 rounded-full bg-background border-2 border-border shadow-lg"
              onClick={() => setZoomImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Actions Footer */}`
);

fs.writeFileSync(path, code);
console.log('Successfully added Image Preview Modal');
