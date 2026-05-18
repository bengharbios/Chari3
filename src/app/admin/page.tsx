import { redirect } from 'next/navigation';

export default function AdminRoute() {
  // Deprecated: Admin route has moved to a secure, dynamic slug handled by middleware.
  // Redirecting to home page.
  redirect('/');
}
