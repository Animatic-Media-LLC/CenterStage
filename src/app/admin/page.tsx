import { redirect } from 'next/navigation';

/**
 * Admin Index Page
 * Redirects to the dashboard
 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}
