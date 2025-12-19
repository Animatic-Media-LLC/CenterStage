import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from '@/components/forms/login-form';

/**
 * Admin Login Page
 * Allows administrators to sign in to access the admin panel
 */
export default async function LoginPage() {
  // Redirect to dashboard if already authenticated
  const session = await auth();
  if (session?.user) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Animatic Media
          </h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Administration Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage projects and submissions
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Animatic Media. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
