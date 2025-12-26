import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjectBySlug, getPresentationConfig, getAllSlugs } from '@/lib/db/projects';
import { getPendingCountsForProjects } from '@/lib/db/submissions';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProjectEditForm } from '@/components/forms/project-edit-form';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Edit Project Page
 * Edit an existing project and its presentation configuration
 */
export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  // Await params and fetch project data
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || project.created_by !== session.user.id) {
    redirect('/admin/projects');
  }

  // Fetch presentation config (using project.id since it's the database key)
  const presentationConfig = await getPresentationConfig(project.id);

  // Get existing slugs (excluding current project's slug)
  const allSlugs = await getAllSlugs();
  const existingSlugs = allSlugs.filter((s) => s !== project.slug);

  // Get pending submission count for this project
  const pendingCounts = await getPendingCountsForProjects([project.id]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
              <p className="text-sm text-gray-600 mt-1">
                Update project details and presentation settings
              </p>
            </div>
            <Link href={`/admin/projects/${slug}/review`}>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Review Submissions {pendingCounts[project.id] > 0 && `(${pendingCounts[project.id]})`}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 max-w-4xl">
        <ProjectEditForm
          project={{
            id: project.id,
            name: project.name,
            client_name: project.client_name,
            slug: project.slug,
            status: project.status,
            archived_at: project.archived_at,
          }}
          presentationConfig={presentationConfig}
          existingSlugs={existingSlugs}
        />
      </div>
    </AdminLayout>
  );
}
