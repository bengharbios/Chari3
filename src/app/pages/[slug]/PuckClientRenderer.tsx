'use client';

import React from 'react';
import { Render } from '@measured/puck';
import { config, PuckLocaleContext } from '@/lib/puck/config';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function PuckClientRenderer({ data }: { data: any }) {
  const { locale } = useTranslation();
  
  // Convert full locale to puck locale ('ar' | 'en' | 'fr')
  const puckLocale = locale === 'en' ? 'en' : locale === 'fr' ? 'fr' : 'ar';

  return (
    <PuckLocaleContext.Provider value={puckLocale}>
      <Render config={config} data={data} />
    </PuckLocaleContext.Provider>
  );
}
