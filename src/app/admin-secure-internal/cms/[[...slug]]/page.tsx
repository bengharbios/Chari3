import { redirect } from 'next/navigation';

/**
 * This page has been superseded by /settings/homepage
 * which provides a much more powerful homepage management experience.
 * Auto-redirecting using server-side redirect for faster and correct routing.
 */
export default function AdminCMSRedirect() {
  redirect('/admin-secure-internal/settings/homepage');
}
