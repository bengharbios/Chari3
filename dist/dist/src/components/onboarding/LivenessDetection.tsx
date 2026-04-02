'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Check, AlertTriangle, Loader2, RefreshCw, ScanFace, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/types';

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

// Movement challenges
interface Challenge {
  id: string;
  ar: string;
  en: string;
  icon: string;
  duration: number;
}

const ALL_CHALLENGES: Challenge[] = [
  { id: 'head_left', ar: 'التففت يساراً', en: 'Turn Left', icon: '←', duration: 1500 },
  { id: 'head_right', ar: 'التففت يميناً', en: 'Turn Right', icon: '→', duration: 1500 },
  { id: 'smile', ar: 'ابتسم', en: 'Smile', icon: '😊', duration: 2000 },
  { id: 'eyes_closed', ar: 'أغمض عينيك', en: 'Close Eyes', icon: '😌', duration: 1500 },
  { id: 'raise_eyebrows', ar: 'ارفع حاجبيك', en: 'Raise Eyebrows', icon: '🤨', duration: 1500 },
];

interface LivenessProps {
  locale: Locale;
  isCompleted: boolean;
  onComplete: (selfieDataUrl: string) => void;
  onSkip?: () => void;
}

export default function LivenessDetection({ locale, isCompleted, onComplete, onSkip }: LivenessProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const challengeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const drawFrameRef = useRef<number>(0);

  // All hooks at top level — no conditionals
  const [phase, setPhase] = useState<'idle' | 'init' | 'countdown' | 'active' | 'success' | 'error'>(
    isCompleted ? 'success' : 'idle'
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [challengeHoldTime, setChallengeHoldTime] = useState(0);
  const [showSpoofWarning, setShowSpoofWarning] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);

  // Create offscreen canvas once (not conditionally)
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Generate 3 random challenges
  const generateChallenges = useCallback(() => {
    const shuffled = [...ALL_CHALLENGES].sort(() => Math.random() - 0.5);
    setChallenges(shuffled.slice(0, 3));
    setCurrentChallengeIdx(0);
    setProgress(0);
    setChallengeHoldTime(0);
  }, []);

  // Copy video frame to display canvas (mirrored for selfie)
  const drawVideoToCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the video horizontally (selfie mode)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  // Analyze frame for face detection and brightness
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = offscreenCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let totalBrightness = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    const avgBrightness = totalBrightness / Math.max(pixelCount, 1);
    setBrightness(avgBrightness);

    // Simple skin-tone detection in center region
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    const sx = Math.max(0, Math.floor(cx - radius));
    const sy = Math.max(0, Math.floor(cy - radius));
    const size = Math.floor(radius * 2);
    if (size <= 0) return;

    const centerData = ctx.getImageData(sx, sy, size, size);
    let skinPixels = 0;
    let totalPx = 0;
    for (let i = 0; i < centerData.data.length; i += 4) {
      const r = centerData.data[i], g = centerData.data[i + 1], b = centerData.data[i + 2];
      if (r > 80 && g > 50 && b > 30 && (r > g) && (r > b) && (Math.abs(r - g) > 15) && avgBrightness > 40) {
        skinPixels++;
      }
      totalPx++;
    }
    const hasFace = totalPx > 0 && skinPixels / totalPx > 0.2;
    setFaceDetected(hasFace);
  }, []);

  // Capture selfie
  const captureSelfie = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror + draw
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw frame border
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(canvas.width, canvas.height) * 0.35;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Timestamp watermark
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '14px monospace';
    ctx.fillText(new Date().toISOString(), 10, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelfieDataUrl(dataUrl);
    return dataUrl;
  }, []);

  // Advance to next challenge or finish
  const advanceChallenge = useCallback(() => {
    const nextIdx = currentChallengeIdx + 1;
    if (challenges.length > 0 && nextIdx >= challenges.length) {
      const dataUrl = captureSelfie();
      if (dataUrl) {
        setPhase('success');
        onComplete(dataUrl);
      }
    } else if (challenges.length > 0) {
      setCurrentChallengeIdx(nextIdx);
      setChallengeHoldTime(0);
      setProgress((nextIdx / challenges.length) * 100);
    }
  }, [currentChallengeIdx, challenges.length, captureSelfie, onComplete]);

  // Challenge timer — auto-advance when hold time is met
  useEffect(() => {
    if (phase !== 'active' || challenges.length === 0) return;
    if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);

    if (currentChallengeIdx < challenges.length && challengeHoldTime >= challenges[currentChallengeIdx].duration) {
      challengeTimerRef.current = setTimeout(advanceChallenge, 300);
      return;
    }

    challengeTimerRef.current = setTimeout(() => {
      setChallengeHoldTime((prev) => prev + 500);
    }, 500);

    return () => {
      if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
    };
  }, [phase, challengeHoldTime, challenges, currentChallengeIdx, advanceChallenge]);

  // Animation loop: draw video frames to canvas + analyze for face/brightness
  useEffect(() => {
    if (phase !== 'active' && phase !== 'countdown') return;

    let animFrameId: number;
    let analyzeCount = 0;

    const loop = () => {
      drawVideoToCanvas();

      // Analyze every ~500ms (every 30 frames at 60fps)
      if (phase === 'active') {
        analyzeCount++;
        if (analyzeCount >= 30) {
          analyzeFrame();
          analyzeCount = 0;
        }
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [phase, drawVideoToCanvas, analyzeFrame]);

  // Countdown before starting
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      startTimeRef.current = Date.now();
      const timer = setTimeout(() => setPhase('active'), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // Start camera
  const startCamera = useCallback(async () => {
    setPhase('init');
    setError('');

    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(t(locale, 'المتصفح لا يدعم الكاميرا. يرجى استخدام متصفح حديث (Chrome, Safari, Firefox).', 'Camera not supported. Please use a modern browser (Chrome, Safari, Firefox).'));
      setPhase('error');
      return;
    }

    // Check HTTPS requirement
    const isSecure = window.isSecureContext;
    if (!isSecure) {
      setError(t(locale, 'يجب استخدام HTTPS للوصول للكاميرا. يرجى فتح الموقع عبر رابط آمن.', 'Camera requires HTTPS. Please open the site via a secure URL.'));
      setPhase('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
        },
        audio: false,
      });

      if (!videoRef.current) {
        stream.getTracks().forEach(tr => tr.stop());
        setError(t(locale, 'خطأ في تشغيل الكاميرا - يرجى إعادة تحميل الصفحة', 'Camera failed to start - please reload the page'));
        setPhase('error');
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.muted = true;

      streamRef.current = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => {
          resolve();
        };
        const onError = () => {
          reject(new Error('Video play failed'));
        };
        video.addEventListener('loadeddata', onLoaded, { once: true });
        video.addEventListener('error', onError, { once: true });
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Camera timeout')), 5000);
        video.play().catch(() => {
          // Some browsers need user gesture
        });
      });

      // Anti-spoof: reject screen sharing
      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        if (settings.displaySurface === 'monitor') {
          stream.getTracks().forEach(tr => tr.stop());
          streamRef.current = null;
          setError(t(locale, 'يرجى استخدام كاميرا حية وليس مشاركة شاشة', 'Please use a live camera, not screen sharing'));
          setShowSpoofWarning(true);
          setPhase('error');
          return;
        }
      }

      generateChallenges();
      setPhase('countdown');
      setCountdown(3);
    } catch (err) {
      console.error('Camera error:', err);

      let errorMessage: string;
      const errName = (err as DOMException)?.name;
      const errMsg = (err as DOMException)?.message;

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        errorMessage = t(locale, 'تم رفض إذن الكاميرا. يرجى الذهاب إلى إعدادات المتصفح والسماح بالوصول للكاميرا ثم المحاولة مرة أخرى.', 'Camera permission denied. Please go to browser settings, allow camera access, and try again.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        errorMessage = t(locale, 'لم يتم العثور على كاميرا في جهازك.', 'No camera found on your device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        errorMessage = t(locale, 'الكاميرا قيد الاستخدام من قبل تطبيق آخر. يرجى إغلاق التطبيقات الأخرى التي تستخدم الكاميرا.', 'Camera is in use by another app. Please close other apps using the camera.');
      } else if (errMsg?.includes('timeout') || errMsg?.includes('Timeout')) {
        errorMessage = t(locale, 'انتهت مهلة تشغيل الكاميرا. يرجى التأكد من أن الكاميرا تعمل والمحاولة مرة أخرى.', 'Camera startup timed out. Please ensure the camera works and try again.');
      } else if (!window.isSecureContext) {
        errorMessage = t(locale, 'يجب استخدام HTTPS للوصول للكاميرا.', 'Camera requires HTTPS connection.');
      } else {
        errorMessage = t(locale, 'حدث خطأ أثناء تشغيل الكاميرا. يرجى المحاولة مرة أخرى. (تفاصيل: ' + (errMsg || String(err)) + ')', 'Camera error occurred. Please try again.');
      }

      setError(errorMessage);
      setPhase('error');
    }
  }, [locale, generateChallenges]);

  // Retry
  const retry = useCallback(() => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tr => tr.stop());
      streamRef.current = null;
    }
    setShowSpoofWarning(false);
    setError('');
    setPhase('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(tr => tr.stop());
        streamRef.current = null;
      }
      if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
      if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current);
    };
  }, []);

  const currentChallenge = challenges[currentChallengeIdx] || null;
  const isLowBrightness = brightness > 0 && brightness < 60;

  // ---- RENDER ----

  // Already completed
  if (phase === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 animate-fade-in">
        {selfieDataUrl && (
          <img src={selfieDataUrl} alt="Selfie" className="w-24 h-24 rounded-full object-cover border-2 border-green-400" />
        )}
        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-base font-semibold text-green-600 dark:text-green-400">
          {t(locale, 'تم التحقق الحي بنجاح', 'Liveness Verified')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(locale, 'تم التقاط صورة حية بنجاح', 'Live selfie captured successfully')}
        </p>
      </div>
    );
  }

  // Error state
  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-sm">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4 me-1.5" />
            {t(locale, 'إعادة المحاولة', 'Retry')}
          </Button>
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              <SkipForward className="h-4 w-4 me-1.5" />
              {t(locale, 'تخطي هذه الخطوة', 'Skip this step')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Idle state — Start button
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ScanFace className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {t(locale, 'التحقق حي نشط (Active Liveness)', 'Active Liveness Check')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t(locale, 'سيُطلب منك 3 حركات عشوائية لتأكيد هويتك. يجب استخدام كاميرا حية وليس صورة مرفوعة.', 'You will be asked to perform 3 random movements. A live camera is required.')}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            {t(locale, 'يتطلب متصفح حديث + كاميرا + إذن الوصول', 'Requires modern browser + camera + permission')}
          </div>
        </div>
        <Button className="gradient-navy text-[var(--navy-foreground)] font-semibold px-8" onClick={startCamera}>
          <Camera className="h-4 w-4 me-2" />
          {t(locale, 'بدء التحقق الحي', 'Start Liveness Check')}
        </Button>
        {onSkip && (
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
            <SkipForward className="h-4 w-4 me-1.5" />
            {t(locale, 'تخطي (سيُطلب لاحقاً)', 'Skip (will be required later)')}
          </Button>
        )}
      </div>
    );
  }

  // Init
  if (phase === 'init') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">{t(locale, 'جاري فتح الكاميرا...', 'Opening camera...')}</p>
      </div>
    );
  }

  // Countdown
  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        <span className="text-6xl font-bold animate-pulse">{countdown}</span>
        <p className="text-sm text-muted-foreground mt-2">{t(locale, 'استعد...', 'Get ready...')}</p>
      </div>
    );
  }

  // Active phase — camera + challenges
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hidden video — always in DOM so ref is available when startCamera is called */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
        aria-hidden="true"
      />
      {/* Camera View */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] max-w-md mx-auto">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Face Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-48 h-60 sm:w-56 sm:h-72 rounded-full border-[3px] transition-all duration-500 ${
              faceDetected
                ? 'border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : 'border-white/60'
            } ${isLowBrightness ? 'animate-pulse' : ''}`}
            style={{
              boxShadow: faceDetected
                ? '0 0 40px rgba(34,197,94,0.2) inset, 0 0 40px rgba(34,197,94,0.15)'
                : '0 0 60px rgba(0,0,0,0.3) inset',
            }}
          />
          {/* Corner markers */}
          <div className="absolute top-4 start-4 w-6 h-6 border-t-2 border-s-2 border-white/80 rounded-tl" />
          <div className="absolute top-4 end-4 w-6 h-6 border-t-2 border-e-2 border-white/80 rounded-tr" />
          <div className="absolute bottom-4 start-4 w-6 h-6 border-b-2 border-s-2 border-white/80 rounded-bl" />
          <div className="absolute bottom-4 end-4 w-6 h-6 border-b-2 border-e-2 border-white/80 rounded-br" />
        </div>

        {/* Face detected indicator */}
        <div className="absolute top-3 start-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
          <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          <span className="text-[10px] text-white font-medium">
            {faceDetected
              ? t(locale, 'وجه مكتشف', 'Face detected')
              : t(locale, 'ابحث عن وجه...', 'Detecting face...')}
          </span>
        </div>

        {/* Brightness */}
        {brightness > 0 && (
          <div className="absolute top-3 end-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
            <span className="text-[10px] text-white/80">{isLowBrightness ? '🌙' : '☀️'}</span>
          </div>
        )}

        {/* Countdown Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {challenges.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  idx < currentChallengeIdx
                    ? 'bg-green-400'
                    : idx === currentChallengeIdx
                      ? challengeHoldTime >= (currentChallenge?.duration || 0)
                        ? 'bg-green-400 scale-125'
                        : 'bg-white scale-125 animate-pulse'
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Current Challenge */}
          {currentChallenge && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">{currentChallenge.icon}</span>
              <p className="text-lg font-bold text-white">
                {locale === 'ar' ? currentChallenge.ar : currentChallenge.en}
              </p>
              {/* Hold progress bar */}
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (challengeHoldTime / (currentChallenge?.duration || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/60">
                {t(locale, 'ثبت الوضع...', 'Hold the position...')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Anti-spoof warning */}
      {showSpoofWarning && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || t(locale, 'يرجى التقاط صورة حية الآن', 'Please take a live photo now')}
          </p>
        </div>
      )}

      {/* Low brightness warning */}
      {isLowBrightness && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            {t(locale, 'الإضاءة منخفضة — يرجى الانتقال لمكان أكثر إضاءة', 'Low lighting — please move to a brighter area')}
          </p>
        </div>
      )}
    </div>
  );
}
