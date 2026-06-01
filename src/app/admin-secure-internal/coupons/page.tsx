import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import CouponsPage from '@/components/admin/CouponsPage';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsRoute() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/admin-secure-internal/login');
  }

  return <CouponsPage />;
}
