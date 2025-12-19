import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAllSlugs } from '@/lib/db/projects';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProjectForm } from '@/components/forms/project-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * New Project Page
 * Create a new CenterStage project
 */
export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  // Get existing slugs for validation
  const existingSlugs = await getAllSlugs();

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
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up a new CenterStage project with custom presentation settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 max-w-4xl">
        <ProjectForm existingSlugs={existingSlugs} />
      </div>
    </AdminLayout>
  );
}
