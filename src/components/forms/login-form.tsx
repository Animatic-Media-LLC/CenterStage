'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      // Validate form data
      const validated = loginSchema.parse(formData);

      // Attempt sign in
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof LoginFormData] = issue.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="admin@animatic.com"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'password-error' : undefined}
        />
        {fieldErrors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {error && (
        <div
          className="rounded-md bg-red-50 border border-red-200 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
