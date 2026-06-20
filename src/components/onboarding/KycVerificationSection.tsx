import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Upload, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

export function KycVerificationSection({ isAr }: { isAr: boolean }) {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/seller/verification');
    const json = await res.json();
    if (json.success) setData(json.verification);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/seller/verification/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(isAr ? 'تم الرفع بنجاح' : 'Uploaded successfully');
        fetchData();
      } else {
        toast.error(json.error || (isAr ? 'فشل الرفع' : 'Upload failed'));
      }
    } catch (error) {
      toast.error(isAr ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmitReview = async () => {
    const res = await fetch('/api/seller/verification', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      toast.success(isAr ? 'تم الإرسال للمراجعة' : 'Submitted for review');
      fetchData();
    }
  };

  if (!data) return null;

  const docs = data.documents || [];
  
  const requiredDocs = ['NATIONAL_ID_FRONT', 'NATIONAL_ID_BACK', 'BUSINESS_LICENSE'];

  return (
    <Card className="mt-6 border-blue-200">
      <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
          <ShieldCheck className="h-5 w-5" />
          {isAr ? 'التوثيق القانوني (KYC/KYB)' : 'Legal Verification (KYC/KYB)'}
        </CardTitle>
        <p className="text-sm text-blue-800/70">
          {isAr ? 'يرجى رفع المستندات المطلوبة لتفعيل حسابك بشكل كامل.' : 'Please upload required documents to fully activate your account.'}
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {requiredDocs.map(docType => {
          const doc = docs.find((d: any) => d.type === docType);
          return (
            <div key={docType} className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg gap-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <h4 className="font-semibold text-sm">{docType.replace(/_/g, ' ')}</h4>
                  {doc?.status === 'REJECTED' && (
                    <p className="text-xs text-red-600 mt-1">{isAr ? 'سبب الرفض:' : 'Reason:'} {doc.rejectionReason}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {doc ? (
                  <div className={`flex items-center gap-1 text-sm ${
                    doc.status === 'APPROVED' ? 'text-green-600' :
                    doc.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {doc.status === 'APPROVED' && <CheckCircle className="h-4 w-4" />}
                    {doc.status === 'PENDING' && <Clock className="h-4 w-4" />}
                    {doc.status === 'REJECTED' && <AlertTriangle className="h-4 w-4" />}
                    {doc.status}
                  </div>
                ) : null}

                {(!doc || doc.status === 'REJECTED') && (
                  <div className="relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleUpload(e, docType)}
                      disabled={uploading === docType}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <Button size="sm" variant="outline" disabled={uploading === docType}>
                      <Upload className="h-4 w-4 mr-2 ml-2" />
                      {uploading === docType ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع مستند' : 'Upload File')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t flex justify-end">
          <Button 
            onClick={handleSubmitReview}
            disabled={docs.length < requiredDocs.length || data.status === 'PENDING_REVIEW' || data.status === 'APPROVED'}
            className="w-full sm:w-auto"
          >
            {isAr ? 'إرسال للمراجعة النهائية' : 'Submit for Final Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
