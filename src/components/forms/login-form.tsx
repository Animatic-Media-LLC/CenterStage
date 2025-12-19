'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl fullWidth error={!!fieldErrors.email}>
        <FormLabel htmlFor="email">Email Address</FormLabel>
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
          error={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <FormHelperText id="email-error">{fieldErrors.email}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth error={!!fieldErrors.password}>
        <FormLabel htmlFor="password">Password</FormLabel>
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
          error={!!fieldErrors.password}
        />
        {fieldErrors.password && (
          <FormHelperText id="password-error">{fieldErrors.password}</FormHelperText>
        )}
      </FormControl>

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
}
