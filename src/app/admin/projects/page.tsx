import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjects } from '@/lib/db/projects';
import { getPendingCountsForProjects } from '@/lib/db/submissions';
import { getUserById } from '@/lib/db/users';
import { AdminLayout } from '@/components/layout/admin-layout';
import { StyledButton } from '@/components/ui/styled-button';
import { Plus } from 'lucide-react';
import { ProjectsList } from '@/components/admin/projects-list';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Projects List Page
 * Displays all projects for the authenticated user
 */
export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const user = await getUserById(session.user.id);
  const projects = await getProjects(session.user.id);

  // Get pending submission counts for all projects
  const projectIds = projects.map(p => p.id);
  const pendingCounts = await getPendingCountsForProjects(projectIds);

  return (
    <AdminLayout
      userName={session.user.name || undefined}
      userRole={user?.role}
      projects={projects.map(p => ({ id: p.id, name: p.name, slug: p.slug }))}
    >
      {/* Header */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{
              fontSize: '1.875rem',
              color: '#0082ae'
            }}>
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Manage your CenterStage projects
            </Typography>
          </Box>
          <Link href="/admin/projects/new">
            <StyledButton
              sx={{ color: 'white', fontWeight: 600 }}
              style={{ background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)', boxShadow: '0 10px 15px -3px rgba(0, 130, 174, 0.3)' }}
              defaultBackground="linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)"
              hoverBackground="linear-gradient(135deg, #006d94 0%, #0082ae 100%)"
              startIcon={<Plus className="h-4 w-4" />}
            >
              New Project
            </StyledButton>
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        <ProjectsList projects={projects} pendingCounts={pendingCounts} />
      </Box>
    </AdminLayout>
  );
}
