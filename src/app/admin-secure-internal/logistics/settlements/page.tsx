'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function SettlementsPage() {
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const downloadTemplate = () => {
    const headers = "TrackingNumber,Status,DeliveredAt,CodCollected,CarrierReference\n";
    const sample = "CHARI-12345678,DELIVERED,2023-10-15T14:30:00Z,1500,FEDEX-9988\nCHARI-87654321,RETURNED,2023-10-16T09:15:00Z,0,FEDEX-7766";
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ChariDay_3PL_Settlement_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t(locale, 'الرجاء اختيار ملف CSV', 'Please select a CSV file'));
      return;
    }

    setIsUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/logistics/settlements/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(t(locale, 'تمت التسوية بنجاح', 'Settlement completed successfully'));
        setResults({ success: true, ...data });
      } else {
        toast.error(t(locale, 'فشل في رفع الملف: ' + data.error, 'Upload failed: ' + data.error));
        setResults({ success: false, error: data.error, errors: data.errors });
      }
    } catch (err: any) {
      toast.error(t(locale, 'حدث خطأ غير متوقع', 'An unexpected error occurred'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div dir={dir} className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-500" />
          {t(locale, 'تسويات شركات الشحن 3PL', '3PL Carrier Settlements')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t(locale, 'قم برفع ملفات CSV الواردة من شركات الشحن لتحديث حالات الطلبات وتسوية القيود المالية دفعة واحدة.', 'Upload CSV files from carriers to bulk update order statuses and reconcile financial ledgers.')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t(locale, 'قالب الملف المطلوب', 'Required File Template')}</CardTitle>
            <CardDescription className="text-xs">
              {t(locale, 'يجب أن يحتوي الملف بدقة على الأعمدة التالية وبنفس التسمية (حساس لحالة الأحرف).', 'The file must strictly contain the following columns with exact casing.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto text-left" dir="ltr">
              TrackingNumber,Status,DeliveredAt,CodCollected,CarrierReference
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {t(locale, 'تحميل قالب CSV', 'Download CSV Template')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t(locale, 'رفع ملف التسوية', 'Upload Settlement File')}</CardTitle>
            <CardDescription className="text-xs">
              {t(locale, 'سيتم رفض الملف بالكامل في حال وجود أي سطر يحتوي على أخطاء لضمان سلامة البيانات.', 'The entire file will be rejected if any row contains errors to ensure data integrity.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">{t(locale, 'ملف CSV', 'CSV File')}</Label>
              <Input 
                id="csvFile" 
                type="file" 
                accept=".csv" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {t(locale, 'معالجة الملف', 'Process File')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card className={`border ${results.success ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/10' : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/10'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {results.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <h3 className={`font-bold ${results.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {results.success 
                    ? t(locale, 'نجاح الفحص والمعالجة', 'Validation & Processing Successful')
                    : t(locale, 'فشل الفحص (Strict Validation Error)', 'Validation Failed')}
                </h3>
                
                {results.success ? (
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p>{t(locale, `تم معالجة ${results.processedCount} شحنة بنجاح.`, `Successfully processed ${results.processedCount} shipments.`)}</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600/90 dark:text-red-400/90 mt-2">
                    <p>{results.error}</p>
                    {results.errors && results.errors.length > 0 && (
                      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                        {results.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
