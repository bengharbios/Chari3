'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Quill styles

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  // Define custom toolbar options
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
    <div className="bg-white text-black min-h-[300px] border border-gray-200 rounded">
      {/* We use standard styling for the editor itself so the user sees clear contrasts */}
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        style={{ height: '300px', backgroundColor: 'white' }}
      />
      
      {/* Optional: Add some custom CSS overrides for Quill to make it fit perfectly in the side panel if needed */}
      <style jsx global>{`
        .ql-toolbar {
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          background: #f8fafc;
        }
        .ql-container {
          border-bottom-left-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
          font-family: inherit;
        }
        /* Make sure the toolbar buttons are visible in dark mode since we force background to white */
        .ql-snow .ql-stroke {
          stroke: #475569;
        }
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
          fill: #475569;
        }
        .ql-snow .ql-picker {
          color: #475569;
        }
      `}</style>
    </div>
  );
}
