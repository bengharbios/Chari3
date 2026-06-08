'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react';

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError('');
    setUploadSuccess(false);
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                تغيير
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500/90 hover:bg-red-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </div>
          {uploadSuccess && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              تم الرفع
            </div>
          )}
        </div>
      ) : (
        /* Upload zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-6 
            flex flex-col items-center justify-center gap-2 text-center
            transition-all duration-200
            ${isDragOver 
              ? 'border-brand bg-brand/5 scale-[1.02]' 
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'}
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
              <p className="text-xs font-bold text-brand">جاري رفع الصورة...</p>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-brand/10' : 'bg-slate-200/80 dark:bg-slate-800'}`}>
                <ImageIcon className={`w-6 h-6 ${isDragOver ? 'text-brand' : 'text-slate-400 dark:text-slate-500'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {isDragOver ? 'أفلت الصورة هنا' : 'اسحب وأفلت أو انقر للاختيار'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  JPG, PNG أو WebP — حتى {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {hint && !error && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
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
