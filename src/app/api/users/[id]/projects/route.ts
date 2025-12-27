import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getUserProjectAssignments,
  assignUserToProject,
  removeUserFromProject,
  isSuperAdmin,
} from '@/lib/db/users';

/**
 * GET /api/users/[id]/projects
 * Get all project assignments for a user (super admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can view assignments
    const isSuperAdminUser = await isSuperAdmin(session.user.id);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const assignments = await getUserProjectAssignments(id);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]/projects
 * Update all project assignments for a user (super admin only)
 * Replaces all existing assignments with the provided list
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can manage assignments
    const isSuperAdminUser = await isSuperAdmin(session.user.id);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { projectIds, assignedBy } = await request.json();

    if (!Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: 'projectIds must be an array' },
        { status: 400 }
      );
    }

    // Get current assignments
    const currentAssignments = await getUserProjectAssignments(id);
    const currentProjectIds = new Set(currentAssignments.map(a => a.project_id));
    const newProjectIds = new Set(projectIds);

    // Determine which to add and remove
    const toAdd = projectIds.filter(pid => !currentProjectIds.has(pid));
    const toRemove = currentAssignments
      .filter(a => !newProjectIds.has(a.project_id))
      .map(a => a.project_id);

    // Remove old assignments
    for (const projectId of toRemove) {
      await removeUserFromProject(id, projectId);
    }

    // Add new assignments
    for (const projectId of toAdd) {
      await assignUserToProject(id, projectId, assignedBy || session.user.id);
    }

    // Return updated assignments
    const updatedAssignments = await getUserProjectAssignments(id);
    return NextResponse.json(updatedAssignments);
  } catch (error) {
    console.error('Failed to update assignments:', error);
    return NextResponse.json(
      {
        error: 'Failed to update assignments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
