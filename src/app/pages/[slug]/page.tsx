import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PuckClientRenderer from './PuckClientRenderer';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await db.customPage.findUnique({
    where: { slug: params.slug, isPublished: true }
  });

  if (!page) {
    return { title: 'Page Not Found' };
  }

  // Next.js generates metadata on the server, we don't have access to useTranslation hook here.
  // We can just use titleEn or try to detect locale from cookies if possible, 
  // but for now we'll just return a generic title or all of them.
  return {
    title: page.titleAr, // Defaulting to Arabic for metadata since it's the primary market
  };
}

export default async function CustomPageViewer({ params }: { params: { slug: string } }) {
  const page = await db.customPage.findUnique({
    where: { slug: params.slug, isPublished: true }
  });

  if (!page) {
    notFound();
  }

  let puckData = { content: [], root: {}, zones: {} };
  if (page.content) {
    try {
      const parsed = JSON.parse(page.content);
      if (parsed && typeof parsed === 'object') {
        puckData = parsed;
        if (!puckData.content) puckData.content = [];
        if (!puckData.root) puckData.root = {};
        if (!puckData.zones) puckData.zones = {};
      }
    } catch(e) {
      console.error('Failed to parse page content');
    }
  }

  return (
    <div className="w-full flex-1">
      <PuckClientRenderer data={puckData} />
    </div>
  );
}
