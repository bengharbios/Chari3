import PublicStorePage from '@/components/storefront/PublicStorePage';

interface Props {
  params: { slug: string };
}

export default function StorePublicPage({ params }: Props) {
  return <PublicStorePage slug={params.slug} />;
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `متجر | ChariDay`,
    description: `تسوق من متجرنا على منصة ChariDay`,
  };
}
