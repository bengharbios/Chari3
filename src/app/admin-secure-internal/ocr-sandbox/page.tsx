'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ScanLine, AlertCircle, CheckCircle2, Camera, SwitchCamera, X } from 'lucide-react';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import Webcam from 'react-webcam';
import Script from 'next/script';

export default function OcrSandboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState<any>(null);

  // Camera State
  const [useCamera, setUseCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const webcamRef = React.useRef<Webcam>(null);

  // OpenCV State
  const [cvLoaded, setCvLoaded] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[] | null>(null);
  const hiddenCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const requestRef = React.useRef<number>();

  // OpenCV Real-time Edge Detection Loop
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

      // Process at lower resolution for high FPS tracking
      const width = 400;
      const height = 300;
      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(video, 0, 0, width, height);

      try {
        let src = cv.imread(canvas);
        let gray = new cv.Mat();
        let blur = new cv.Mat();
        let edges = new cv.Mat();

        // 1. Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        // 2. Blur to remove noise
        cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        // 3. Canny edge detection
        cv.Canny(blur, edges, 75, 200, 3, false);

        // 4. Find contours
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        let largestArea = 0;
        let largestContourIndex = -1;
        let bestPoly = new cv.Mat();

        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cv.contourArea(cnt);
          if (area > 4000) { // Minimum area to be considered an ID card
            let peri = cv.arcLength(cnt, true);
            let approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
            
            // If it's a quad (4 points) and largest so far
            if (approx.rows === 4 && area > largestArea) {
              largestArea = area;
              largestContourIndex = i;
              approx.copyTo(bestPoly);
            }
            approx.delete();
          }
          cnt.delete();
        }

        if (largestContourIndex !== -1) {
          // Convert the 4 points to percentages (0-100%) so we can map them to the responsive UI SVG
          const points = [];
          for (let i = 0; i < 4; i++) {
            points.push({
              x: (bestPoly.data32S[i * 2] / width) * 100,
              y: (bestPoly.data32S[i * 2 + 1] / height) * 100
            });
          }
          setPolygonPoints(points);
        } else {
          setPolygonPoints(null); // No ID card found in frame
        }

        src.delete();
        gray.delete();
        blur.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        bestPoly.delete();
      } catch (e) {
        // Silently ignore frame processing errors to prevent crash loop
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [useCamera, cvLoaded]);

  // Helper: Convert DataURI to File
  const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','),
        mimeMatch = arr[0].match(/:(.*?);/),
        mime = mimeMatch ? mimeMatch[1] : 'image/jpeg',
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const cropImageWithOpenCV = async (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = (window as any).cv;
        if (!cv) {
          resolve(imageSrc); // Fallback if OpenCV not loaded
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        try {
          let src = cv.imread(canvas);
          let gray = new cv.Mat();
          let blur = new cv.Mat();
          let edges = new cv.Mat();

          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
          cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
          cv.Canny(blur, edges, 75, 200, 3, false);

          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();
          cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

          let largestArea = 0;
          let bestPoly = new cv.Mat();

          for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);
            // Minimum area threshold (5% of full image size to avoid cropping tiny noise)
            if (area > (img.width * img.height * 0.05)) { 
              let peri = cv.arcLength(cnt, true);
              let approx = new cv.Mat();
              cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
              
              if (approx.rows === 4 && area > largestArea) {
                largestArea = area;
                approx.copyTo(bestPoly);
              }
              approx.delete();
            }
            cnt.delete();
          }

          if (largestArea > 0) {
            // Sort points to identify Top-Left, Top-Right, Bottom-Right, Bottom-Left
            let pts = [];
            for (let i = 0; i < 4; i++) {
              pts.push({ x: bestPoly.data32S[i * 2], y: bestPoly.data32S[i * 2 + 1] });
            }
            
            // TL has smallest x+y, BR has largest x+y
            pts.sort((a, b) => (a.x + a.y) - (b.x + b.y));
            const tl = pts[0];
            const br = pts[3];
            
            // TR has smallest x-y, BL has largest x-y
            const remain = [pts[1], pts[2]];
            remain.sort((a, b) => (a.x - a.y) - (b.x - b.y));
            const tr = remain[0];
            const bl = remain[1];

            // Calculate actual physical width/height of the card
            const widthA = Math.hypot(br.x - bl.x, br.y - bl.y);
            const widthB = Math.hypot(tr.x - tl.x, tr.y - tl.y);
            const maxWidth = Math.max(widthA, widthB);

            const heightA = Math.hypot(tr.x - br.x, tr.y - br.y);
            const heightB = Math.hypot(tl.x - bl.x, tl.y - bl.y);
            const maxHeight = Math.max(heightA, heightB);

            // Warp perspective
            let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
              tl.x, tl.y,
              tr.x, tr.y,
              br.x, br.y,
              bl.x, bl.y
            ]);
            let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
              0, 0,
              maxWidth, 0,
              maxWidth, maxHeight,
              0, maxHeight
            ]);

            let M = cv.getPerspectiveTransform(srcTri, dstTri);
            let warped = new cv.Mat();
            cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight));

            cv.imshow(canvas, warped);
            
            // Cleanup warped
            srcTri.delete(); dstTri.delete(); M.delete(); warped.delete();
          }

          // Cleanup general
          src.delete(); gray.delete(); blur.delete(); edges.delete();
          contours.delete(); hierarchy.delete(); bestPoly.delete();

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          console.error("OpenCV Crop Error", e);
          resolve(imageSrc);
        }
      };
      img.src = imageSrc;
    });
  };

  const handleCapture = React.useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUseCamera(false); // Close camera UI immediately for better UX
      toast.info('جاري قص البطاقة آلياً وتحسين جودتها...');
      
      const croppedImageSrc = await cropImageWithOpenCV(imageSrc);
      const fileFromCamera = dataURLtoFile(croppedImageSrc, 'camera-capture.jpg');
      
      setFile(fileFromCamera);
      setPreview(croppedImageSrc);
      setResult(null);
    }
  }, [webcamRef]);

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

      // Algerian ID Extraction Logic (More resilient for OCR typos)
      const ninMatch = text.match(/(?:الوطني|رقم|التعويف|التعريف)[^\d]*(\d{18})/i) || text.match(/\b\d{18}\b/);
      const lastNameMatch = text.match(/(?:اللقب|النقب)[^\n:]*[:;\-]\s*([^\n]+)/i);
      const firstNameMatch = text.match(/(?:الإسم|الاسم|my)[^\n:]*[:;\-]\s*([^\n]+)/i);
      const dobMatch = text.match(/(?:الميلاد|تريغ|شيلك|تاريخ)[^\d]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i);
      const issueAuthorityMatch = text.match(/(?:سلطة|اسلطة)[^\n:]*الإصدار[^\n:]*[:;\-]\s*([^\n]+)/i);
      const issueDateMatch = text.match(/(?:تاريخ|تريخ)[^\n:]*الإصدار[^\d]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i);
      const expiryDateMatch = text.match(/(?:تاريخ|تاريع)[^\n:]*(?:الإنتهاء|لإتتياء)[^\d]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i);
      const genderMatch = text.match(/الجنس[^\n:]*[:;\-]\s*([^\s\n]+)/i);
      const bloodTypeMatch = text.match(/Rh\s*[:;\-]\s*([A-Z0-9+\-]+)/i);
      const birthPlaceMatch = text.match(/مكان[^\n:]*(?:الميلاد|اشيلاد)[^\n:]*[:;\-]\s*([^\n]+)/i);
      
      const parsedId = {
        republic: text.match(/الجمهورية/i) ? 'الجمهورية الجزائرية الديمقراطية الشعبية' : '',
        cardType: text.match(/(?:بطاقة|التعريف)/i) ? 'بطاقة التعريف الوطنية' : '',
        issueAuthority: issueAuthorityMatch ? issueAuthorityMatch[1].trim() : '',
        issueDate: issueDateMatch ? issueDateMatch[1].trim() : '',
        expiryDate: expiryDateMatch ? expiryDateMatch[1].trim() : '',
        nin: ninMatch ? (ninMatch[1] || ninMatch[0]) : '',
        lastName: lastNameMatch ? lastNameMatch[1].trim() : '',
        firstName: firstNameMatch ? firstNameMatch[1].trim() : '',
        dob: dobMatch ? dobMatch[1].trim() : '',
        gender: genderMatch ? genderMatch[1].trim() : '',
        bloodType: bloodTypeMatch ? bloodTypeMatch[1].trim() : '',
        birthPlace: birthPlaceMatch ? birthPlaceMatch[1].trim() : ''
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
      <Script src="https://docs.opencv.org/4.8.0/opencv.js" strategy="lazyOnload" onLoad={() => setCvLoaded(true)} />
      
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
            {!useCamera ? (
              <>
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
                
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 border-t"></div>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">أو</span>
                  <div className="flex-1 border-t"></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2" 
                  onClick={() => {
                    setUseCamera(true);
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                >
                  <Camera className="h-4 w-4" />
                  افتح الكاميرا لالتقاط صورة
                </Button>

                {preview && (
                  <div className="mt-4 rounded-lg overflow-hidden border bg-black/5 flex justify-center p-2 relative">
                    <img src={preview} alt="Preview" className="w-full h-auto object-contain max-h-[300px] rounded" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 h-8 w-8 rounded-full"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 1920,
                      height: 1080,
                      facingMode: facingMode
                    }}
                    className="w-full h-[350px] object-cover"
                  />
                  
                  {/* Dynamic OpenCV Focus Frame Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {polygonPoints ? (
                      <svg className="w-full h-full transition-all duration-75">
                        <polygon 
                          points={polygonPoints.map(p => `${p.x}%,${p.y}%`).join(' ')} 
                          fill="rgba(26, 187, 156, 0.2)" 
                          stroke="#1ABB9C" 
                          strokeWidth="3" 
                        />
                        {polygonPoints.map((p, i) => (
                          <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="6" fill="#1ABB9C" />
                        ))}
                      </svg>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-[80%] h-[50%] border-2 border-dashed border-white/40 rounded-xl relative transition-all duration-300">
                           <div className="absolute -top-8 w-full text-center text-white font-bold text-sm bg-black/40 py-1 rounded backdrop-blur-sm">
                             {cvLoaded ? "ضع البطاقة أمام الكاميرا..." : "جاري تحميل محرك الرؤية الحاسوبية (OpenCV)..."}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden Canvas for OpenCV Processing */}
                  <canvas ref={hiddenCanvasRef} className="hidden" />

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="rounded-full h-10 w-10 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
                      onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    >
                      <SwitchCamera className="h-5 w-5" />
                    </Button>
                    <Button 
                      className="rounded-full px-8 bg-brand hover:bg-brand-dark text-white font-bold shadow-lg"
                      onClick={handleCapture}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      التقاط
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="rounded-full h-10 w-10 opacity-80"
                      onClick={() => setUseCamera(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
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

                {/* ID Card Extracted Fields Form */}
                {result.parsedId && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <ScanLine className="h-4 w-4" />
                      استمارة بيانات الهوية (قابلة للتعديل)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground">الجمهورية</label>
                        <input type="text" defaultValue={result.parsedId.republic} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground">نوع البطاقة</label>
                        <input type="text" defaultValue={result.parsedId.cardType} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground">سلطة الإصدار</label>
                        <input type="text" defaultValue={result.parsedId.issueAuthority} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">تاريخ الإصدار</label>
                        <input type="text" defaultValue={result.parsedId.issueDate} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">تاريخ الإنتهاء</label>
                        <input type="text" defaultValue={result.parsedId.expiryDate} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground">رقم التعريف الوطني (18 رقم)</label>
                        <input type="text" defaultValue={result.parsedId.nin} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500 font-mono" />
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
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">مكان الميلاد</label>
                        <input type="text" defaultValue={result.parsedId.birthPlace} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">الجنس</label>
                        <input type="text" defaultValue={result.parsedId.gender} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">فصيلة الدم (Rh)</label>
                        <input type="text" defaultValue={result.parsedId.bloodType} className="w-full p-2 text-sm border border-blue-200 dark:border-blue-800 rounded bg-background focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      * قمنا بمحاولة جلب كافة تفاصيل الهوية. أي حقل فارغ أو به خطأ إملائي بسبب جودة الصورة يمكنك تعديله يدوياً الآن.
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
