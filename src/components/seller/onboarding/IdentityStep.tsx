'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Camera, Upload, ScanLine, CheckCircle2, SwitchCamera, X } from 'lucide-react';
import Webcam from 'react-webcam';
import Script from 'next/script';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';

export default function IdentityStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

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
  const requestRef = React.useRef<number>();

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
          const points = [];
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

  const handleCapture = React.useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      let imageSrc = webcamRef.current?.getScreenshot();
      try {
        const track = (webcamRef.current?.video as any)?.srcObject?.getVideoTracks()[0];
        if (track && 'ImageCapture' in window) {
          const imageCapture = new (window as any).ImageCapture(track);
          const photoBlob = await imageCapture.takePhoto();
          imageSrc = await new Promise<string>((resolve) => {
            const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(photoBlob);
          });
        }
      } catch (e) {}

      if (imageSrc) {
        const activePoints = latestPointsRef.current;
        toast.info(activePoints ? 'جاري معالجة البطاقة...' : 'تم الالتقاط (بدون رصد الحواف)');
        
        const finalImageSrc = await cropImageWithOpenCV(imageSrc, activePoints);
        
        if (captureStep === 'front') {
          updateData({ managerIdFront: finalImageSrc });
          setCaptureStep('back');
          toast.success('الآن قم بقلب البطاقة للوجه الخلفي');
        } else if (captureStep === 'back') {
          updateData({ managerIdBack: finalImageSrc });
          setCaptureStep('done');
          setUseCamera(false);
          toast.success('اكتمل التقاط الوجهين بنجاح!');
          handleExtract(data.managerIdFront || finalImageSrc, finalImageSrc);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  }, [webcamRef, captureStep, isCapturing, data.managerIdFront]);

  const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','), mimeMatch = arr[0].match(/:(.*?);/), mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  };

  const handleExtract = async (frontData: string, backData: string) => {
    setLoading(true);
    setProgressMsg('جاري استخراج وقراءة البيانات...');
    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status.includes('recognizing text')) setProgressMsg('جاري استخراج وقراءة البيانات الخلفية...');
        }
      });

      const backFile = dataURLtoFile(backData, 'back.jpg');
      const { data: { text: backText } } = await worker.recognize(backFile);
      const mrzRegex = /(?:[A-Z0-9<]{30,}\n?){2,3}/g;
      const mrzMatches = backText.match(mrzRegex);
      
      let parsedId: any = {};
      
      if (mrzMatches && mrzMatches.length > 0) {
        const mrz = mrzMatches[0].replace(/\s+/g, '');
        if (mrz.length >= 90) {
           const line1 = mrz.substring(0, 30); const line2 = mrz.substring(30, 60); const line3 = mrz.substring(60, 90);
           parsedId.nin = line1.substring(5, 14).replace(/</g, '');
           const dobRaw = line2.substring(0, 6);
           parsedId.dob = `${parseInt(dobRaw.substring(0,2)) > 24 ? '19' : '20'}${dobRaw.substring(0,2)}-${dobRaw.substring(2,4)}-${dobRaw.substring(4,6)}`;
           parsedId.gender = line2.substring(7, 8) === 'M' ? 'ذكر' : 'أنثى';
           const names = line3.split('<<');
           if (names.length >= 2) {
             parsedId.lastName = names[0].replace(/</g, ' ').trim();
             parsedId.firstName = names[1].replace(/</g, ' ').trim();
           }
        }
      }

      await worker.reinitialize('ara+fra+eng');
      const frontFile = dataURLtoFile(frontData, 'front.jpg');
      const { data: { text: frontText } } = await worker.recognize(frontFile);
      
      const ninMatch = frontText.match(/(?:الوطني|رقم|التعويف|التعريف)[^\d]*(\d{18})/i) || frontText.match(/\b\d{18}\b/);
      if (ninMatch && !parsedId.nin) parsedId.nin = ninMatch[1];
      const arabicLastName = frontText.match(/(?:اللقب|النقب)[^\n:]*[:;\-]\s*([^\n]+)/i);
      if (arabicLastName) parsedId.lastNameAr = arabicLastName[1].trim();
      const arabicFirstName = frontText.match(/(?:الاسم|السم)[^\n:]*[:;\-]\s*([^\n]+)/i);
      if (arabicFirstName) parsedId.firstNameAr = arabicFirstName[1].trim();

      await worker.terminate();

      // Auto-fill form
      const name = `${parsedId.firstNameAr || parsedId.firstName || ''} ${parsedId.lastNameAr || parsedId.lastName || ''}`.trim();
      
      updateData({ 
        extractedIdData: JSON.stringify(parsedId),
        signatoryName: data.signatoryName || name || ''
      });
      toast.success('تم قراءة الهوية وتعبئة البيانات بنجاح!');
    } catch (e) {
      toast.error('حدث خطأ أثناء القراءة التلقائية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js" 
        strategy="afterInteractive" 
        onReady={() => {
          const checkCv = setInterval(() => {
            if ((window as any).cv && (window as any).cv.Mat) { clearInterval(checkCv); setCvLoaded(true); }
          }, 200);
          setTimeout(() => clearInterval(checkCv), 15000);
        }} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('onboarding.identity.signatoryName')}</Label>
          <Input 
            placeholder={t('onboarding.identity.signatoryName')} 
            value={data.signatoryName || ''} 
            onChange={(e) => updateData({ signatoryName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.identity.signatoryEmail')}</Label>
          <Input 
            type="email"
            placeholder={t('onboarding.identity.signatoryEmail')} 
            value={data.signatoryEmail || ''} 
            onChange={(e) => updateData({ signatoryEmail: e.target.value })} 
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-base font-bold mb-4 block">{t('onboarding.identity.isOwner')}</Label>
        <RadioGroup 
          value={data.isLegalOwner ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ isLegalOwner: val === 'yes' })}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="yes" id="owner-yes" />
            <Label htmlFor="owner-yes" className="cursor-pointer">{t('onboarding.identity.yes')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="no" id="owner-no" />
            <Label htmlFor="owner-no" className="cursor-pointer">{t('onboarding.identity.no')}</Label>
          </div>
        </RadioGroup>
      </div>

      {!data.isLegalOwner && (
        <div className="pt-4 space-y-4">
          <Label className="text-base font-bold text-red-600">{t('onboarding.identity.poa')}</Label>
          <p className="text-sm text-gray-500">الرجاء إرفاق التفويض القانوني أو الوكالة</p>
          <Input 
            type="file" 
            accept=".pdf,.jpg,.png" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updateData({ powerOfAttorneyFile: 'https://fake-s3.com/poa.pdf' });
            }} 
          />
        </div>
      )}

      <div className="pt-6 border-t space-y-4">
        <Label className="text-base font-bold">{t('onboarding.identity.uploadId')}</Label>
        <p className="text-sm text-gray-500">{t('onboarding.identity.idDesc')}</p>
        
        {!useCamera ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${data.managerIdFront ? 'border-primary bg-primary/5' : 'bg-muted/20'}`}>
                {data.managerIdFront ? (
                  <div className="relative">
                    <img src={data.managerIdFront} alt="Front" className="w-full h-24 object-contain rounded" />
                    <CheckCircle2 className="absolute top-1 right-1 h-5 w-5 text-green-500 bg-white rounded-full" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm font-medium">الأمامي</p>
                  </>
                )}
              </div>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${data.managerIdBack ? 'border-primary bg-primary/5' : 'bg-muted/20'}`}>
                {data.managerIdBack ? (
                  <div className="relative">
                    <img src={data.managerIdBack} alt="Back" className="w-full h-24 object-contain rounded" />
                    <CheckCircle2 className="absolute top-1 right-1 h-5 w-5 text-green-500 bg-white rounded-full" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm font-medium">الخلفي</p>
                  </>
                )}
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 border-brand text-brand hover:bg-brand hover:text-white" 
              onClick={() => {
                setUseCamera(true);
                setCaptureStep('front');
              }}
            >
              <ScanLine className="h-4 w-4" />
              تشغيل الماسح الذكي للهوية (OCR)
            </Button>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={1}
              videoConstraints={{ width: { ideal: 4096 }, height: { ideal: 2160 }, facingMode }}
              className="w-full h-auto max-h-[60vh] object-contain bg-black"
            />
            <div className="absolute inset-0 pointer-events-none">
              {polygonPoints ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <polygon points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(26, 187, 156, 0.2)" stroke="#1ABB9C" strokeWidth="0.5" />
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-[80%] h-[50%] border-2 border-dashed border-white/40 rounded-xl relative">
                    <div className="absolute -top-8 w-full text-center text-white font-bold text-sm bg-black/40 py-1 rounded">
                      {!cvLoaded ? "تحميل OpenCV..." : captureStep === 'front' ? "وجه الأمامية..." : "وجه الخلفية (شريط MRZ)..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <canvas ref={hiddenCanvasRef} className="hidden" />

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
              <Button variant="secondary" size="icon" className="rounded-full bg-white/20 text-white" onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}>
                <SwitchCamera className="h-5 w-5" />
              </Button>
              <Button className="rounded-full px-8 bg-brand text-white disabled:opacity-50" onClick={handleCapture} disabled={isCapturing}>
                {isCapturing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Camera className="mr-2 h-4 w-4" />}
                {isCapturing ? 'جاري...' : captureStep === 'front' ? 'التقاط الوجه الأمامي' : 'التقاط الوجه الخلفي'}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full opacity-80" onClick={() => setUseCamera(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
            <span>{progressMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
