'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; // Quill styles
import { Maximize2, Minimize2, Code, X } from 'lucide-react';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen]);

  // Define custom toolbar options for the Fullscreen Word-like Editor
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      [{ 'color': [] }, { 'background': [] }],   // dropdown with defaults from theme
      [{ 'script': 'sub'}, { 'script': 'super' }], // superscript/subscript
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],   // outdent/indent
      [{ 'direction': 'rtl' }],                  // text direction (crucial for Urdu/Arabic!)
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']                                  // remove formatting button
    ],
  }), []);

  return (
    <div className="flex flex-col gap-2">
      {/* Sidebar Controls */}
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          محرر Word المتقدم (الوسط)
        </button>
        
        <button 
          onClick={() => setIsRawMode(!isRawMode)}
          className={`flex-none flex items-center justify-center p-2 rounded transition-colors ${isRawMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          title="كتابة HTML / CSS مباشرة"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Raw HTML / Sidebar Editor */}
      {isRawMode ? (
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[250px] p-3 font-mono text-xs text-white bg-slate-900 rounded border border-slate-700 focus:ring-2 focus:ring-brand outline-none direction-ltr text-left"
          placeholder="<h1>Write HTML and CSS directly...</h1>"
        />
      ) : (
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded text-center">
          انقر على "محرر Word المتقدم" لفتح المحرر في وسط الشاشة بحجم كامل.
        </div>
      )}
      
      {/* FULLSCREEN MODAL (The Word-like Center Editor) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-slate-50 w-full max-w-6xl h-full flex flex-col rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-brand/10 text-brand flex items-center justify-center">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">المحرر المتقدم (Advanced Editor)</h2>
                  <p className="text-xs text-slate-500">تصميم وتنسيق المحتوى بجميع خصائص الوورد</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Editor Container (The Center) */}
            <div className="flex-1 bg-slate-50 p-6 overflow-hidden flex flex-col">
              <div className="flex-1 bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col rich-quill-fullscreen">
                <ReactQuill 
                  theme="snow" 
                  value={value} 
                  onChange={onChange} 
                  modules={modules}
                  className="flex-1 flex flex-col h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS overrides for Quill to make it fit perfectly in fullscreen */}
      <style jsx global>{`
        .rich-quill-fullscreen .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rich-quill-fullscreen .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          padding: 12px 16px !important;
          flex-shrink: 0;
        }
        .rich-quill-fullscreen .ql-container {
          border: none !important;
          flex: 1;
          overflow-y: auto;
          font-family: inherit;
          font-size: 1.1rem;
        }
        .rich-quill-fullscreen .ql-editor {
          padding: 2rem !important;
          max-width: 900px;
          margin: 0 auto;
        }
        /* Make sure the toolbar buttons are visible in dark mode since we force background to white */
        .ql-snow .ql-stroke { stroke: #475569; }
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill { fill: #475569; }
        .ql-snow .ql-picker { color: #475569; }
      `}</style>
    </div>
  );
}
