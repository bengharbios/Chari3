'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';

export default function OcrSandboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
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
    setProgressMsg('جاري تحضير محرك الذكاء الاصطناعي...');
    setProgressPct(0);

    try {
      const worker = await createWorker('ara+fra+eng', 1, {
        logger: m => {
          console.log(m);
          // m example: { status: 'recognizing text', progress: 0.50 }
          
          let translatedStatus = m.status;
          if (m.status.includes('loading tesseract core')) translatedStatus = 'تحميل النواة الأساسية...';
          else if (m.status.includes('loading language traineddata')) translatedStatus = 'تحميل قاموس اللغات (عربي/فرنسي/إنجليزي)...';
          else if (m.status.includes('initializing api')) translatedStatus = 'تهيئة واجهة البرمجة...';
          else if (m.status.includes('recognizing text')) translatedStatus = 'جاري استخراج النصوص من الصورة...';

          setProgressMsg(translatedStatus);
          setProgressPct(Math.round(m.progress * 100));
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // MRZ Detection Logic
      const mrzRegex = /[A-Z0-9<]{30,}/g;
      const mrzMatches = text.match(mrzRegex);

      // Extract 10 digit number logic (Commercial Register Number)
      const crRegex = /\b\d{10}\b/g;
      const crMatches = text.match(crRegex);

      // Algerian ID Extraction Logic
      const ninMatch = text.match(/(?:الوطني|رقم)[^\d]*(\d{18})/i) || text.match(/\b\d{18}\b/);
      const lastNameMatch = text.match(/اللقب\s*[:;\-]\s*([^\n]+)/i);
      const firstNameMatch = text.match(/الإسم\s*[:;\-]\s*([^\n]+)/i);
      const dobMatch = text.match(/(?:الميلاد|تريغ)[^\d]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i);
      
      const parsedId = {
        nin: ninMatch ? (ninMatch[1] || ninMatch[0]) : '',
        lastName: lastNameMatch ? lastNameMatch[1].trim() : '',
        firstName: firstNameMatch ? firstNameMatch[1].trim() : '',
        dob: dobMatch ? dobMatch[1].trim() : ''
      };

      setResult({
        success: true,
        text,
        mrzMatches: mrzMatches || [],
        crMatches: crMatches || [],
        parsedId
      });

      toast.success('تم الاستخراج بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء استخراج البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          مختبر استخراج البيانات (Client-Side OCR)
        </h1>
        <p className="text-muted-foreground mt-1">
          يتم الآن تشغيل الذكاء الاصطناعي بالكامل <strong>داخل متصفحك</strong> بدون الاتصال بالخادم، مما يعني سرعة فائقة وعدم وجود أي أخطاء انقطاع (Timeout).
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
              <div className="mt-4 rounded-lg overflow-hidden border bg-black/5 flex justify-center p-2">
                <img src={preview} alt="Preview" className="w-full h-auto object-contain max-h-[300px] rounded" />
              </div>
            )}

            <Button 
              className="w-full" 
              disabled={!file || loading}
              onClick={handleExtract}
            >
              {loading ? (
                <>جاري المعالجة المباشرة...</>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  بدء الاستخراج الفوري
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
                <p>النتيجة ستظهر هنا فورياً...</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-[300px] text-primary space-y-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="w-full max-w-[80%] space-y-2 text-center">
                  <p className="text-sm font-semibold truncate px-2">{progressMsg}</p>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{progressPct}%</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                
                {/* 10-Digit CR Numbers found */}
                {result.crMatches && result.crMatches.length > 0 && (
                  <div className="p-4 bg-brand/10 border border-brand/20 rounded-lg">
                    <h3 className="font-semibold text-brand-dark flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      أرقام بـ 10 خانات (محتمل أن تكون السجل التجاري)
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {result.crMatches.map((m: string, i: number) => (
                        <code key={i} className="px-3 py-1 bg-background rounded-md border text-sm font-bold text-primary">
                          {m}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* ID Card Extracted Fields */}
                {result.parsedId && (result.parsedId.nin || result.parsedId.lastName || result.parsedId.firstName) && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <ScanLine className="h-4 w-4" />
                      البيانات الأساسية المستخرجة (قابلة للتعديل)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">رقم التعريف الوطني (18 رقم)</label>
                        <input type="text" defaultValue={result.parsedId.nin} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">اللقب</label>
                        <input type="text" defaultValue={result.parsedId.lastName} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">الإسم</label>
                        <input type="text" defaultValue={result.parsedId.firstName} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">تاريخ الميلاد</label>
                        <input type="text" defaultValue={result.parsedId.dob} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      * قمنا باستخراج هذه البيانات عبر البحث عن الكلمات المفتاحية الثابتة (اللقب، الإسم، إلخ). يمكنك تعديل أي خطأ ناتج عن جودة الصورة.
                    </p>
                  </div>
                )}

                {/* MRZ Found */}
                {result.mrzMatches && result.mrzMatches.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
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
                  <h3 className="font-semibold mb-2">النص الخام المستخرج كاملًا:</h3>
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
