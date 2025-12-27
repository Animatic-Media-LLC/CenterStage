import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProjectById, archiveProject, reactivateProject } from '@/lib/db/projects';
import { getUserAccessibleProjects } from '@/lib/db/users';

/**
 * POST /api/projects/[id]/archive
 * Archive a project
 */
export async function POST(
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

    const archivedProject = await archiveProject(id);

    return NextResponse.json(archivedProject);
  } catch (error) {
    console.error('Archive project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/archive
 * Reactivate an archived project
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

    const reactivatedProject = await reactivateProject(id);

    return NextResponse.json(reactivatedProject);
  } catch (error) {
    console.error('Reactivate project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
