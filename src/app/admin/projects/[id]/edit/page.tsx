import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProjectById, getPresentationConfig, getAllSlugs } from '@/lib/db/projects';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProjectEditForm } from '@/components/forms/project-edit-form';
import { ArrowLeft } from 'lucide-react';

interface EditProjectPageProps {
  params: {
    id: string;
  };
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

  // Fetch project data
  const project = await getProjectById(params.id);

  if (!project || project.created_by !== session.user.id) {
    redirect('/admin/projects');
  }

  // Fetch presentation config
  const presentationConfig = await getPresentationConfig(params.id);

  // Get existing slugs (excluding current project's slug)
  const allSlugs = await getAllSlugs();
  const existingSlugs = allSlugs.filter((s) => s !== project.slug);

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-sm text-gray-600 mt-1">
              Update project details and presentation settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 max-w-4xl">
        <ProjectEditForm
          project={project}
          presentationConfig={presentationConfig}
          existingSlugs={existingSlugs}
        />
      </div>
    </AdminLayout>
  );
}
