'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ScanLine, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OcrSandboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/ocr-sandbox', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        toast.success('تم السحب بنجاح');
      } else {
        toast.error(data.error || 'فشل استخراج البيانات');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          مختبر استخراج البيانات (OCR Sandbox)
        </h1>
        <p className="text-muted-foreground mt-1">
          قم برفع صورة لهوية جزائرية أو سجل تجاري لاختبار قدرة النظام على سحب النصوص وشريط MRZ آلياً.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. رفع الصورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center bg-muted/20 relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="font-medium">اسحب الصورة هنا أو اضغط للاختيار</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG</p>
            </div>

            {preview && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <img src={preview} alt="Preview" className="w-full h-auto object-contain max-h-[300px]" />
              </div>
            )}

            <Button 
              className="w-full" 
              disabled={!file || loading}
              onClick={handleExtract}
            >
              {loading ? (
                <>جاري تحليل الصورة واستخراج النصوص...</>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  بدء الاستخراج (OCR)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. نتيجة الاستخراج</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>النتيجة ستظهر هنا...</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-[300px] text-primary">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="animate-pulse">جاري فحص المستند...</p>
                <p className="text-xs text-muted-foreground mt-2">قد يستغرق الأمر بعض الثواني لتحميل قاموس اللغات لأول مرة.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {result.mrzMatches && result.mrzMatches.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      تم العثور على شريط MRZ
                    </h3>
                    <div className="mt-2 space-y-1">
                      {result.mrzMatches.map((m: string, i: number) => (
                        <code key={i} className="block w-full p-2 bg-white dark:bg-black rounded border text-sm overflow-x-auto whitespace-nowrap">
                          {m}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">النص الخام المستخرج (Raw Text):</h3>
                  <div className="p-4 bg-muted rounded-lg border max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm" dir="auto">
                    {result.text}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
