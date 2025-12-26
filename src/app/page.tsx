import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LogIn } from 'lucide-react';

/**
 * Root Landing Page
 * Redirects authenticated users to admin dashboard
 * Shows landing page with login link for unauthenticated users
 */
export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to admin dashboard
  if (session?.user) {
    redirect('/admin/dashboard');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f3f4f6',
        px: 2,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        {/* Logo/Title */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            fontWeight: 'bold',
            color: '#1f2937',
            mb: 2,
          }}
        >
          CenterStage
        </Typography>

        {/* Tagline */}
        <Typography
          variant="h5"
          component="p"
          sx={{
            color: '#6b7280',
            mb: 6,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
          }}
        >
          Showcase customer testimonials in style
        </Typography>

        {/* Login Button */}
        <Link href="/admin/login">
          <Button size="lg" className="text-lg px-8 py-6">
            <LogIn className="h-5 w-5 mr-2" />
            Admin Login
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
