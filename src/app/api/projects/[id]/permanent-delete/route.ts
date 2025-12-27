import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProjectById, permanentlyDeleteProject } from '@/lib/db/projects';
import { getUserAccessibleProjects } from '@/lib/db/users';

/**
 * DELETE /api/projects/[id]/permanent-delete
 * Permanently delete a project and all associated data
 * This action cannot be undone
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify access
    const accessibleProjectIds = await getUserAccessibleProjects(session.user.id);
    if (!accessibleProjectIds.includes(id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get confirmation from request body
    const body = await request.json();
    const { confirmation } = body;

    // Require user to confirm by typing project name
    if (confirmation !== project.name) {
      return NextResponse.json(
        { error: 'Project name confirmation does not match' },
        { status: 400 }
      );
    }

    // Permanently delete the project and cascade delete all related data
    await permanentlyDeleteProject(id);

    return NextResponse.json({
      success: true,
      message: 'Project permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
