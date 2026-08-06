'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, CheckCircle2, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  label,
  hint,
  className = '',
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'link'>('upload');
  const [linkInput, setLinkInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError('');
    setUploadSuccess(false);

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الملف يتجاوز ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. استخدم JPG, PNG أو WebP');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      } else {
        setError(data.error || 'فشل رفع الصورة');
      }
    } catch {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsUploading(false);
    }
  }, [maxSizeMB, onChange]);

  const handleLinkSubmit = () => {
    setError('');
    const url = linkInput.trim();
    if (!url) return;
    
    try {
      const parsedUrl = new URL(url);
      // OWASP: Only allow http/https
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        setError('حماية أمنية: الرابط يجب أن يبدأ بـ https:// أو http:// فقط');
        return;
      }
      
      // Additional safety against data URIs and javascript URIs just in case
      if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
        setError('حماية أمنية: هذا النوع من الروابط غير مسموح به.');
        return;
      }

      onChange(url);
      setLinkInput('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch {
      setError('صيغة الرابط غير صحيحة');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (activeMode !== 'upload') return;
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [activeMode, handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (activeMode === 'upload') setIsDragOver(true);
  }, [activeMode]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError('');
    setUploadSuccess(false);
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          {label}
        </label>
      )}

      {value ? (
        /* Preview mode */
        <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <img
            src={value}
            alt="uploaded"
            className="w-full h-36 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500/90 hover:bg-red-500 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
              >
                <X className="w-4 h-4" />
                تغيير الصورة
              </button>
            </div>
          </div>
          {uploadSuccess && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              تم التحديث
            </div>
          )}
        </div>
      ) : (
        /* Input mode */
        <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 select-none">
            <button
              type="button"
              onClick={() => { setActiveMode('upload'); setError(''); }}
              className={`flex-1 py-2.5 text-[11px] font-bold flex justify-center items-center gap-1.5 transition-colors ${activeMode === 'upload' ? 'bg-white dark:bg-slate-800 text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              <Upload className="w-3.5 h-3.5" />
              رفع ملف من الجهاز
            </button>
            <button
              type="button"
              onClick={() => { setActiveMode('link'); setError(''); }}
              className={`flex-1 py-2.5 text-[11px] font-bold flex justify-center items-center gap-1.5 transition-colors ${activeMode === 'link' ? 'bg-white dark:bg-slate-800 text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              إدراج رابط خارجي (URL)
            </button>
          </div>

          <div className="p-4">
            {activeMode === 'upload' ? (
              /* Upload zone */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-[14px] border-2 border-dashed py-5 px-4
                  flex flex-col items-center justify-center gap-2 text-center
                  transition-all duration-200
                  ${isDragOver 
                    ? 'border-brand bg-brand/5 scale-[1.02]' 
                    : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800/80'}
                  ${isUploading ? 'pointer-events-none opacity-70' : ''}
                `}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-7 h-7 text-brand animate-spin" />
                    <p className="text-xs font-bold text-brand">جاري الرفع الآمن والفحص...</p>
                  </>
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-brand/10 text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {isDragOver ? 'أفلت الصورة الآن' : 'اسحب وأفلت الصورة أو انقر للاختيار'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        آمن: يتم الفحص الرقمي | {maxSizeMB}MB كحد أقصى (JPG, PNG, WebP)
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Link Input Zone */
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLinkSubmit())}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 rounded-xl text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-brand focus:ring-1 focus:ring-brand px-3 py-2 outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleLinkSubmit}
                    disabled={!linkInput.trim()}
                    className="bg-brand text-brand-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand/90 disabled:opacity-50 transition-colors shrink-0"
                  >
                    اعتماد
                  </button>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2.5 rounded-lg text-[10px] flex items-start gap-1.5 font-medium leading-relaxed">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>تأكد من أن الرابط مباشر للصورة (وليس لصفحة ويب). لأسباب أمنية (CSP)، يُنصح برفع الصورة بدلاً من استخدام روابط قد تتعطل مستقبلاً.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hint && !error && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
