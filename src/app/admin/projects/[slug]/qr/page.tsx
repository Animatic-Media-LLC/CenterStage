import { redirect } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { auth } from '@/auth';
import { getProjectBySlug } from '@/lib/db/projects';
import { getUserById, getUserAccessibleProjects } from '@/lib/db/users';
import { AdminLayout } from '@/components/layout/admin-layout';
import { QRCodeDisplay } from '@/components/admin/qr-code-display';
import { ArrowLeft } from 'lucide-react';

interface QRCodePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * QR Code Generation Page
 * Display and download QR codes for project URLs
 */
export default async function QRCodePage({ params }: QRCodePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const user = await getUserById(session.user.id);

  // Await params and fetch project data
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    redirect('/admin/projects');
  }

  // Check if user has access to this project
  const accessibleProjectIds = await getUserAccessibleProjects(session.user.id);
  if (!accessibleProjectIds.includes(project.id)) {
    redirect('/admin/projects');
  }

  // Generate URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const commentUrl = `${baseUrl}/comment/${project.slug}`;
  const presentUrl = `${baseUrl}/present/${project.slug}`;

  return (
    <AdminLayout userName={session.user.name || undefined} userRole={user?.role}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ px: 4, py: 3 }}>
          <Link
            href="/admin/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.6)',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              QR Codes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Download QR codes for {project.name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        <QRCodeDisplay
          project={{
            name: project.name,
            slug: project.slug,
            commentUrl,
            presentUrl,
          }}
        />
      </Box>
    </AdminLayout>
  );
}
