import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from '@/components/forms/login-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ maxWidth: 480, width: '100%' }}>
        {/* Logo and Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            CenterStage
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 1 }}>
            Administration Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage projects and submissions
          </Typography>
        </Box>

        {/* Login Form Card */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <LoginForm />
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} Animatic Media. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
