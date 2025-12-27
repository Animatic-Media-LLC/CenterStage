import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjectBySlug } from '@/lib/db/projects';
import { getUserById, getUserAccessibleProjects } from '@/lib/db/users';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ArrowLeft } from 'lucide-react';
import { ReviewInterface } from '@/components/review/review-interface';

interface ReviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Review Submissions Page
 * Review, approve, decline, and manage submissions for a project
 */
export default async function ReviewPage({ params }: ReviewPageProps) {
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

  return (
    <AdminLayout userName={session.user.name || undefined} userRole={user?.role}>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">
                Review and manage submissions for {project.client_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Interface */}
      <div className="px-8 py-6">
        <ReviewInterface projectId={project.id} projectSlug={project.slug} />
      </div>
    </AdminLayout>
  );
}
