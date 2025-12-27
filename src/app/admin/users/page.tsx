import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAllUsers, isSuperAdmin } from '@/lib/db/users';
import { AdminLayout } from '@/components/layout/admin-layout';
import UserManagementInterface from '@/components/admin/user-management-interface';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: 'User Management | CenterStage Admin',
  description: 'Manage users and their project access',
};

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/admin/login');
  }

  // Only super admins can access this page
  const isSuperAdminUser = await isSuperAdmin(session.user.id);
  if (!isSuperAdminUser) {
    redirect('/admin/dashboard');
  }

  const users = await getAllUsers();

  return (
    <AdminLayout userName={session.user.name || undefined} userRole="super_admin">
      {/* Header */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ px: 4, py: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{
            fontSize: '1.875rem',
            color: '#0082ae'
          }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Create and manage users, assign projects, and control access permissions.
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        <UserManagementInterface users={users} currentUserId={session.user.id} />
      </Box>
    </AdminLayout>
  );
}
