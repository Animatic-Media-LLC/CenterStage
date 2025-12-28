import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StyledButton } from '@/components/ui/styled-button';
import { FolderKanban, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { getDashboardStats, getRecentPendingSubmissions } from '@/lib/db/submissions';
import { getUserById } from '@/lib/db/users';
import { getProjects } from '@/lib/db/projects';
import { formatDistanceToNow } from 'date-fns';

/**
 * Admin Dashboard Page
 * Main landing page for authenticated administrators
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  // Fetch user to get role
  const user = await getUserById(session.user.id);

  // Fetch dashboard statistics
  const stats = await getDashboardStats(session.user.id);

  // Fetch recent pending submissions
  const recentSubmissions = await getRecentPendingSubmissions(session.user.id, 10);

  // Fetch projects for sidebar
  const projects = await getProjects(session.user.id);

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
        <Box sx={{
          px: { xs: 2, sm: 4 },
          py: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{
              fontSize: '1.875rem',
              color: '#0082ae'
            }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Welcome back, {session.user.name}!
            </Typography>
          </Box>
          <Link href="/admin/projects/new">
            <StyledButton
              className="w-full sm:w-auto text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)', boxShadow: '0 10px 15px -3px rgba(0, 130, 174, 0.3)' }}
              defaultBackground="linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)"
              hoverBackground="linear-gradient(135deg, #006d94 0%, #0082ae 100%)"
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              New Project
            </StyledButton>
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Link href="/admin/projects" className="block">
            <Card className="cursor-pointer transition-all duration-300 hover:-translate-y-1" sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)',
              boxShadow: '0 4px 6px rgba(0, 130, 174, 0.3)',
              '&:hover': { boxShadow: '0 10px 20px rgba(0, 130, 174, 0.4)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FolderKanban className="h-8 w-8 text-white" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', fontSize: '2rem' }}>
                      {stats.totalProjects}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      Total Projects
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/projects" className="block">
            <Card className="cursor-pointer transition-all duration-300 hover:-translate-y-1" sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
              '&:hover': { boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock className="h-8 w-8 text-white" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', fontSize: '2rem' }}>
                      {stats.activeProjects}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      Active Projects
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Link>

          <Card className="transition-all duration-300 hover:-translate-y-1" sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
            '&:hover': { boxShadow: '0 10px 20px rgba(139, 92, 246, 0.4)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle className="h-8 w-8 text-white" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', fontSize: '2rem' }}>
                    {stats.approvedSubmissions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Card sx={{
          boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between" sx={{
            background: 'rgba(0, 130, 174, 0.05)',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardTitle className="font-bold text-xl">Recent Pending Submissions</CardTitle>
            {recentSubmissions.length > 0 && (
              <Chip
                label={`${recentSubmissions.length} recent`}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 130, 174, 0.1)',
                  color: '#0082ae',
                  fontWeight: 600
                }}
              />
            )}
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6, fontWeight: 500 }}>
                No pending submissions to display.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentSubmissions.map((submission: any) => (
                  <Box
                    key={submission.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2.5,
                      border: 1,
                      borderColor: 'rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      bgcolor: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0, 130, 174, 0.02)',
                        borderColor: 'rgba(0, 130, 174, 0.2)',
                        boxShadow: '0 2px 8px rgba(0, 130, 174, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                          {submission.full_name}
                        </Typography>
                        {submission.social_handle && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {submission.social_handle}
                          </Typography>
                        )}
                        <Chip
                          label={submission.projects.name}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            color: 'rgb(99, 102, 241)',
                            fontWeight: 600,
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {submission.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                        {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Link href={`/admin/projects/${submission.projects.slug}/review`}>
                      <StyledButton
                        variant="ghost"
                        size="sm"
                        className="font-semibold transition-colors"
                        style={{ color: '#0082ae' }}
                        defaultBackground=""
                        hoverBackground="rgba(0, 130, 174, 0.1)"
                      >
                        Review
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </StyledButton>
                    </Link>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}
