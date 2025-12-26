import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { getDashboardStats, getRecentPendingSubmissions } from '@/lib/db/submissions';
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

  // Fetch dashboard statistics
  const stats = await getDashboardStats(session.user.id);

  // Fetch recent pending submissions
  const recentSubmissions = await getRecentPendingSubmissions(session.user.id, 10);

  return (
    <AdminLayout userName={session.user.name || undefined}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
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
            <Typography variant="h4" component="h1" fontWeight="bold">
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Welcome back, {session.user.name}!
            </Typography>
          </Box>
          <Link href="/admin/projects/new">
            <Button className="w-full sm:w-auto">
              <FolderKanban className="h-4 w-4 mr-2" />
              New Project
            </Button>
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
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Link href="/admin/projects" className="block">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                {/* Desktop: Icon on right, mobile: Count inline with title */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    <span className="md:hidden">{stats.totalProjects} </span>
                    Total Projects
                  </CardTitle>
                  <FolderKanban className="hidden md:block h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="hidden md:block">
                {/* Desktop: Show large number */}
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.totalProjects}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/projects" className="block">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    <span className="md:hidden">{stats.activeProjects} </span>
                    Active Projects
                  </CardTitle>
                  <Clock className="hidden md:block h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="hidden md:block">
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.activeProjects}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Currently active
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <span className="md:hidden">{stats.pendingSubmissions} </span>
                  Pending Submissions
                </CardTitle>
                <FileText className="hidden md:block h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="hidden md:block">
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.pendingSubmissions}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Awaiting review
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <span className="md:hidden">{stats.approvedSubmissions} </span>
                  Approved Submissions
                </CardTitle>
                <CheckCircle className="hidden md:block h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="hidden md:block">
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.approvedSubmissions}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Ready to present
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Pending Submissions</CardTitle>
            {recentSubmissions.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Showing {recentSubmissions.length} most recent
              </Typography>
            )}
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
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
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {submission.full_name}
                        </Typography>
                        {submission.social_handle && (
                          <Typography variant="caption" color="text.secondary">
                            {submission.social_handle}
                          </Typography>
                        )}
                        <Chip
                          label={submission.projects.name}
                          size="small"
                          sx={{ ml: 1 }}
                          variant="outlined"
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
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Link href={`/admin/projects/${submission.projects.slug}/review`}>
                      <Button variant="ghost" size="sm">
                        Review
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
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
