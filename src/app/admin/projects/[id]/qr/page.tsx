import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjectById } from '@/lib/db/projects';
import { AdminLayout } from '@/components/layout/admin-layout';
import { QRCodeDisplay } from '@/components/admin/qr-code-display';
import { ArrowLeft } from 'lucide-react';

interface QRCodePageProps {
  params: {
    id: string;
  };
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

  // Fetch project data
  const project = await getProjectById(params.id);

  if (!project || project.created_by !== session.user.id) {
    redirect('/admin/projects');
  }

  // Generate URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const commentUrl = `${baseUrl}/comment/${project.slug}`;
  const presentUrl = `${baseUrl}/present/${project.slug}`;

  return (
    <AdminLayout userName={session.user.name || undefined}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <Link
            href="/admin/projects"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Download QR codes for {project.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <QRCodeDisplay
          project={{
            name: project.name,
            slug: project.slug,
            commentUrl,
            presentUrl,
          }}
        />
      </div>
    </AdminLayout>
  );
}
