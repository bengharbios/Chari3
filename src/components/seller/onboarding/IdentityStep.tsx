'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Camera, Upload, ScanLine, CheckCircle2, SwitchCamera, X } from 'lucide-react';
import Webcam from 'react-webcam';
import Script from 'next/script';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';

export default function IdentityStep({ data, updateData, onPreviewFile, isBusiness = true }: { data: any; updateData: (d: any) => void; onPreviewFile: (url: string) => void; isBusiness?: boolean }) {
  const { t, locale } = useTranslation();

  // Camera & Multi-step State
  const [captureStep, setCaptureStep] = useState<'front' | 'back' | 'done'>('front');
  const [useCamera, setUseCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const webcamRef = React.useRef<Webcam>(null);

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // OpenCV State
  const [cvLoaded, setCvLoaded] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[] | null>(null);
  const latestPointsRef = React.useRef<{x: number, y: number}[] | null>(null);
  const hiddenCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const requestRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!useCamera || !cvLoaded || !webcamRef.current?.video || !hiddenCanvasRef.current) return;
    const video = webcamRef.current.video;
    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const cv = (window as any).cv;

    const processFrame = () => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }
      const maxDim = 400;
      let width = video.videoWidth;
      let height = video.videoHeight;
      if (width > height) { height = Math.round((height / width) * maxDim); width = maxDim; } 
      else { width = Math.round((width / height) * maxDim); height = maxDim; }
      if (width === 0 || height === 0) { requestRef.current = requestAnimationFrame(processFrame); return; }

      canvas.width = width; canvas.height = height;
      ctx?.drawImage(video, 0, 0, width, height);

      try {
        let src = cv.imread(canvas);
        let gray = new cv.Mat(); let blur = new cv.Mat(); let edges = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        cv.Canny(blur, edges, 75, 200, 3, false);
        let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        let largestArea = 0; let largestContourIndex = -1; let bestPoly = new cv.Mat();
        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cv.contourArea(cnt);
          if (area > 4000) {
            let peri = cv.arcLength(cnt, true);
            let approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
            if (approx.rows === 4 && area > largestArea) {
              largestArea = area; largestContourIndex = i; approx.copyTo(bestPoly);
            }
            approx.delete();
          }
          cnt.delete();
        }

        if (largestContourIndex !== -1) {
          const points: { x: number; y: number }[] = [];
          for (let i = 0; i < 4; i++) {
            points.push({ x: (bestPoly.data32S[i * 2] / width) * 100, y: (bestPoly.data32S[i * 2 + 1] / height) * 100 });
          }
          setPolygonPoints(points); latestPointsRef.current = points;
        } else {
          setPolygonPoints(null); latestPointsRef.current = null;
        }

        src.delete(); gray.delete(); blur.delete(); edges.delete(); contours.delete(); hierarchy.delete(); bestPoly.delete();
      } catch (e) {}

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [useCamera, cvLoaded]);

  const cropImageWithOpenCV = async (imageSrc: string, polyPoints: {x: number, y: number}[] | null): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = (window as any).cv;
        if (!cv || !polyPoints || polyPoints.length !== 4) { resolve(imageSrc); return; }
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, 0, 0); }

        try {
          let src = cv.imread(canvas);
          const pts = polyPoints.map(p => ({ x: (p.x / 100) * img.width, y: (p.y / 100) * img.height }));
          pts.sort((a, b) => (a.x + a.y) - (b.x + b.y));
          const tl = pts[0]; const br = pts[3];
          const remain = [pts[1], pts[2]]; remain.sort((a, b) => (a.x - a.y) - (b.x - b.y));
          const bl = remain[0]; const tr = remain[1];

          const maxWidth = Math.max(Math.hypot(br.x - bl.x, br.y - bl.y), Math.hypot(tr.x - tl.x, tr.y - tl.y));
          const maxHeight = Math.max(Math.hypot(tr.x - br.x, tr.y - br.y), Math.hypot(tl.x - bl.x, tl.y - bl.y));

          let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [ tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y ]);
          let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [ 0, 0, maxWidth, 0, maxWidth, maxHeight, 0, maxHeight ]);
          let M = cv.getPerspectiveTransform(srcTri, dstTri);
          let warped = new cv.Mat();
          cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight), cv.INTER_CUBIC);

          let sharpened = new cv.Mat();
          let sharpenKernel = cv.matFromArray(3, 3, cv.CV_32F, [ 0, -1, 0, -1, 5, -1, 0, -1, 0 ]);
          cv.filter2D(warped, sharpened, cv.CV_8U, sharpenKernel);
          cv.imshow(canvas, sharpened);

          srcTri.delete(); dstTri.delete(); M.delete(); warped.delete(); sharpened.delete(); sharpenKernel.delete(); src.delete();
          resolve(canvas.toDataURL('image/jpeg', 1.0));
        } catch (e) { resolve(imageSrc); }
      };
      img.src = imageSrc;
    });
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    setIsCapturing(true);
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) { setIsCapturing(false); return; }

    const cropped = await cropImageWithOpenCV(screenshot, latestPointsRef.current);

    if (captureStep === 'front') {
      updateData({ managerIdFront: cropped });
      setCaptureStep('back');
    } else if (captureStep === 'back') {
      updateData({ managerIdBack: cropped });
      setCaptureStep('done');
      setUseCamera(false);
      handleExtract(data.managerIdFront, cropped);
    }
    setIsCapturing(false);
  };

  const handleExtract = async (front: string, back: string) => {
    if (!front || !back) return;
    setLoading(true);
    setProgressMsg(locale === 'ar' ? 'جاري تهيئة الماسح الذكي...' : 'Initializing scanner...');
    try {
      const worker = await createWorker();
      await worker.loadLanguage('ara+eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ',
      });

      setProgressMsg(locale === 'ar' ? 'جاري قراءة بيانات الوجه الأمامي...' : 'Reading front side data...');
      const { data: { text: textFront } } = await worker.recognize(front);
      
      setProgressMsg(locale === 'ar' ? 'جاري قراءة بيانات الوجه الخلفي...' : 'Reading back side data...');
      const { data: { text: textBack } } = await worker.recognize(back);

      await worker.terminate();

      const combinedText = (textFront + ' ' + textBack).toUpperCase();

      const idMatch = combinedText.match(/\b\d{18}\b/);
      const nameMatch = combinedText.match(/NAME:\s*([A-Z\s]+)/) || combinedText.match(/FULLNAME:\s*([A-Z\s]+)/);

      if (idMatch) {
        updateData({ signatoryIdNumber: idMatch[0] });
        toast.success(locale === 'ar' ? 'تم استخراج رقم الهوية تلقائياً!' : 'ID number extracted successfully!');
      }
      if (nameMatch) {
        updateData({ signatoryName: nameMatch[1].trim() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Script 
        src="https://docs.opencv.org/4.5.4/opencv.js"
        strategy="lazyOnload"
        onLoad={() => setCvLoaded(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label>{t('الاسم الكامل للمدير / الممثل القانوني *', 'Signatory Full Name *')}</Label>
          <Input 
            placeholder={t('أدخل الاسم الكامل كما في بطاقة الهوية', 'Enter full name as in ID')} 
            value={data.signatoryName || ''} 
            onChange={(e) => updateData({ signatoryName: e.target.value })} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('رقم بطاقة الهوية الشخصية / جواز السفر *', 'ID Card / Passport Number *')}</Label>
          <Input 
            placeholder={t('مثال: 123456789012345678', 'e.g. 123456789012345678')} 
            value={data.signatoryIdNumber || ''} 
            onChange={(e) => updateData({ signatoryIdNumber: e.target.value })} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('البريد الإلكتروني للتواصل *', 'Contact Email Address *')}</Label>
          <Input 
            type="email"
            placeholder={t('example@domain.com', 'example@domain.com')} 
            value={data.signatoryEmail || ''} 
            onChange={(e) => updateData({ signatoryEmail: e.target.value })} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
      </div>

      {isBusiness && (
        <>
          <div className="pt-4 border-t dark:border-slate-800">
            <Label className="text-base font-bold mb-4 block">{t('هل أنت المالك القانوني للشركة؟ *', 'Are you the legal owner of the company? *')}</Label>
            <RadioGroup 
              value={data.isLegalOwner ? 'yes' : 'no'} 
              onValueChange={(val) => updateData({ isLegalOwner: val === 'yes' })}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <RadioGroupItem value="yes" id="owner-yes" />
                <Label htmlFor="owner-yes" className="cursor-pointer">{t('نعم، أنا المالك', 'Yes')}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <RadioGroupItem value="no" id="owner-no" />
                <Label htmlFor="owner-no" className="cursor-pointer">{t('لا، لست المالك (أحمل تفويض رسمي)', 'No')}</Label>
              </div>
            </RadioGroup>
          </div>

          {!data.isLegalOwner && (
            <div className="pt-4 space-y-4">
              <Label className="text-base font-bold text-red-600">{t('وثيقة التفويض القانوني (POA) *', 'Power of Attorney Document (POA) *')}</Label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {t('يرجى إرفاق وثيقة الوكالة أو التوكيل الرسمي المعتمد للتوقيع نيابة عن الشركة.', 'Please attach the official POA or proxy authorization document.')}
              </p>
              <Input 
                type="file" 
                accept=".pdf,.jpg,.png" 
                className="dark:bg-slate-900 dark:border-slate-800"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const uploadToast = toast.loading(locale === 'ar' ? 'جاري رفع مستند التفويض...' : 'Uploading POA...');
                  const formData = new FormData();
                  formData.append('file', file);

                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    const json = await res.json();
                    if (json.success) {
                      updateData({ powerOfAttorneyFile: json.url });
                      toast.success(locale === 'ar' ? 'تم رفع تفويض التوقيع بنجاح!' : 'POA uploaded successfully!', { id: uploadToast });
                    } else {
                      toast.error(json.error || 'فشل رفع الملف', { id: uploadToast });
                    }
                  } catch (err) {
                    toast.error('حدث خطأ أثناء رفع الملف', { id: uploadToast });
                  }
                }} 
              />
              {data.powerOfAttorneyFile && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('تم الرفع بنجاح', 'Uploaded successfully')}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => onPreviewFile(data.powerOfAttorneyFile)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {t('معاينة الملف', 'Preview File')}
                    </button>
                    <span className="text-gray-300 dark:text-slate-700">|</span>
                    <a 
                      href={data.powerOfAttorneyFile} 
                      download
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {t('تحميل الملف', 'Download File')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="pt-6 border-t dark:border-slate-800 space-y-4">
        <Label className="text-base font-bold">{t('إثبات الهوية الشخصية للمدير أو الممثل القانوني *', 'Identity Proof (Manager / Owner) *')}</Label>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('يرجى تحميل نسخة ضوئية ملونة لبطاقة الهوية الوطنية من الوجهين (أو جواز السفر).', 'Please upload a clear color scan of both sides of the identity card (or passport).')}
        </p>
        
        {!useCamera ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`border-2 border-dashed rounded-lg p-4 text-center relative flex flex-col justify-center items-center min-h-[140px] ${data.managerIdFront ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'bg-muted/20 dark:bg-slate-800/30 dark:border-slate-800'}`}>
                {data.managerIdFront ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onPreviewFile(data.managerIdFront)}
                      className="cursor-zoom-in hover:opacity-80 transition-opacity"
                    >
                      <img src={data.managerIdFront} alt="Front" className="w-full h-24 object-contain rounded" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateData({ managerIdFront: null })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">{t('تم رفع الوجه الأول', 'Front face uploaded')}</p>
                  </div>
                ) : (
                  <label className="cursor-pointer block w-full h-full">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm font-medium">{t('الوجه الأول (اضغط للرفع)', 'Front Side (Click to upload)')}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG, JPEG</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateData({ managerIdFront: reader.result as string });
                            if (data.managerIdBack) {
                              handleExtract(reader.result as string, data.managerIdBack);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center relative flex flex-col justify-center items-center min-h-[140px] ${data.managerIdBack ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'bg-muted/20 dark:bg-slate-800/30 dark:border-slate-800'}`}>
                {data.managerIdBack ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onPreviewFile(data.managerIdBack)}
                      className="cursor-zoom-in hover:opacity-80 transition-opacity"
                    >
                      <img src={data.managerIdBack} alt="Back" className="w-full h-24 object-contain rounded" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateData({ managerIdBack: null })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">{t('تم رفع الوجه الثاني', 'Back face uploaded')}</p>
                  </div>
                ) : (
                  <label className="cursor-pointer block w-full h-full">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm font-medium">{t('الوجه الثاني (اضغط للرفع)', 'Back Side (Click to upload)')}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG, JPEG</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateData({ managerIdBack: reader.result as string });
                            if (data.managerIdFront) {
                              handleExtract(data.managerIdFront, reader.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button type="button" variant="outline" size="sm" className="text-xs rounded-xl" onClick={() => setUseCamera(true)}>
                <Camera className="h-3.5 w-3.5 mr-1 ml-1" />
                {t('استخدام كاميرا الجهاز المباشرة', 'Use Device Live Camera')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="relative border rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode }}
                className="w-full h-full object-cover"
              />
              {/* Box Overlay Guide */}
              <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-white text-[10px] bg-black/40 px-2 py-0.5 rounded">
                  {captureStep === 'front' 
                    ? t('ضع وجه الهوية الأمامي هنا', 'Align ID Front') 
                    : t('ضع ظهر الهوية هنا', 'Align ID Back')
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setUseCamera(false)}>
                {t('إلغاء الكاميرا', 'Cancel Camera')}
              </Button>
              <Button type="button" size="sm" className="bg-primary text-white rounded-xl text-xs px-6" onClick={handleCapture} disabled={isCapturing}>
                {isCapturing ? '...' : t('التقاط الصورة', 'Capture Image')}
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}>
                <SwitchCamera className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="p-4 bg-muted/40 rounded-xl flex items-center justify-center gap-3">
          <ScanLine className="h-5 w-5 text-primary animate-pulse" />
          <p className="text-xs font-semibold">{progressMsg}</p>
        </div>
      )}
    </div>
  );
}
