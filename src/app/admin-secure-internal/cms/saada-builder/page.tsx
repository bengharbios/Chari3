'use client';

import React, { useState, useEffect } from 'react';
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

// SAADA Configuration (Blocks definition)
const config = {
  components: {
    Columns: {
      fields: {
        distribution: {
          type: "radio",
          options: [
            { label: "1 Column (100%)", value: "1fr" },
            { label: "2 Columns (50/50)", value: "1fr 1fr" },
            { label: "3 Columns (33/33/33)", value: "1fr 1fr 1fr" },
            { label: "1/4 + 3/4", value: "1fr 3fr" },
            { label: "3/4 + 1/4", value: "3fr 1fr" },
          ],
        },
      },
      defaultProps: {
        distribution: "1fr 1fr",
      },
      render: ({ distribution, puck: { renderDropZone } }: any) => {
        return (
          <div className="w-full max-w-7xl mx-auto my-4">
            <div 
              style={{ display: "grid", gridTemplateColumns: distribution, gap: "16px" }}
              className="w-full"
            >
              {distribution.split(" ").map((_: any, i: number) => (
                <div key={i} className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-2 bg-gray-50/50">
                  {renderDropZone({ zone: \`column-\${i}\` })}
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    Heading: {
      fields: {
        title: { type: "text" },
        alignment: {
          type: "radio",
          options: [
            { label: "Right", value: "text-right" },
            { label: "Center", value: "text-center" },
            { label: "Left", value: "text-left" },
          ]
        }
      },
      defaultProps: {
        title: "عنوان جديد",
        alignment: "text-right"
      },
      render: ({ title, alignment }: any) => (
        <h2 className={\`text-2xl font-bold text-slate-800 dark:text-white \${alignment} my-4\`}>{title}</h2>
      ),
    },
    CustomBanner: {
      fields: {
        imageUrl: { type: "text" },
        link: { type: "text" },
      },
      defaultProps: {
        imageUrl: "https://via.placeholder.com/1200x300?text=Banner+Placeholder",
        link: "#"
      },
      render: ({ imageUrl, link }: any) => (
        <a href={link} className="block w-full rounded-2xl overflow-hidden my-4 hover:opacity-90 transition">
          <img src={imageUrl} alt="banner" className="w-full h-auto object-cover" />
        </a>
      )
    },
    Text: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: {
        content: "أدخل النص هنا...",
      },
      render: ({ content }: any) => (
        <p className="text-gray-600 dark:text-gray-300 my-2 whitespace-pre-wrap">{content}</p>
      ),
    }
  },
};

export default function SaadaBuilderPage() {
  const [data, setData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetch('/api/admin/saada-homepage')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setData({ content: [], root: {}, zones: {} });
        }
      });
  }, []);

  const save = async (newData: any) => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/saada-homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full" dir="ltr">
      {/* 
        Note: Puck is currently best supported in LTR, 
        so we force LTR for the editor wrapper itself. 
      */}
      <Puck 
        config={config as any} 
        data={data} 
        onPublish={save}
        headerTitle="SAADA Page Builder"
      />
    </div>
  );
}
