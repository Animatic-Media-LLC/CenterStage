import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjects } from '@/lib/db/projects';
import { getPendingCountsForProjects } from '@/lib/db/submissions';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Plus, Search, Edit, QrCode, ExternalLink, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CopyUrlButton } from '@/components/admin/copy-url-button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';

/**
 * Projects List Page
 * Displays all projects for the authenticated user
 */
export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const projects = await getProjects(session.user.id);

  // Get pending submission counts for all projects
  const projectIds = projects.map(p => p.id);
  const pendingCounts = await getPendingCountsForProjects(projectIds);

  return (
    <AdminLayout userName={session.user.name || undefined}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your CenterStage projects
            </Typography>
          </Box>
          <Link href="/admin/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        {/* Search */}
        <Box sx={{ mb: 3, maxWidth: 480 }}>
          <Input
            type="search"
            placeholder="Search projects..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-gray-400" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  No projects yet
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  Get started by creating your first CenterStage project.
                </Typography>
                <Link href="/admin/projects/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {projects.map((project) => (
              <Box key={project.id}>
                <Card sx={{ '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                  <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {project.client_name}
                        </Typography>
                      </Box>
                      <Chip
                        label={project.status}
                        size="small"
                        color={
                          project.status === 'active'
                            ? 'success'
                            : project.status === 'archived'
                            ? 'default'
                            : 'error'
                        }
                      />
                    </Box>
                  </CardHeader>
                  <CardContent>
                    {/* Slug */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Project Slug
                      </Typography>
                      <Box
                        component="code"
                        sx={{
                          fontSize: '0.875rem',
                          bgcolor: 'grey.100',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {project.slug}
                      </Box>
                    </Box>

                    {/* URLs */}
                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Public Form
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Link
                            href={`/comment/${project.slug}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            /comment/{project.slug}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <CopyUrlButton url={`/comment/${project.slug}`} label="Copy comment form URL" />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Presentation
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Link
                            href={`/present/${project.slug}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            /present/{project.slug}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <CopyUrlButton url={`/present/${project.slug}`} label="Copy presentation URL" />
                        </Box>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Link href={`/admin/projects/${project.slug}/edit`} style={{ flex: 1 }}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/admin/projects/${project.slug}/review`} style={{ flex: 1 }}>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-1" />
                          Review {pendingCounts[project.id] > 0 && `(${pendingCounts[project.id]})`}
                        </Button>
                      </Link>
                      <Link href={`/admin/projects/${project.slug}/qr`} className="sm:w-auto w-full">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <QrCode className="h-6 w-6" />
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
}
