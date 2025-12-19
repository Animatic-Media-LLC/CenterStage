import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';

/**
 * Admin Dashboard Page
 * Main landing page for authenticated administrators
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {session.user.name}!
              </p>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/admin/login' });
              }}
            >
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Active Projects</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Pending Submissions</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Approved Submissions</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-600 text-center py-8">
            No recent activity to display.
          </p>
        </div>
      </main>
    </div>
  );
}
