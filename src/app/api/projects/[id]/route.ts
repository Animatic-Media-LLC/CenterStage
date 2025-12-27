import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getProjectById,
  updateProject,
  archiveProject,
  deleteProject,
  getPresentationConfig,
  updatePresentationConfig,
} from '@/lib/db/projects';
import { getUserAccessibleProjects } from '@/lib/db/users';
import { updateProjectSchema, presentationConfigSchema } from '@/lib/validations/project';

/**
 * GET /api/projects/[id]
 * Get a single project by ID with its presentation config
 */
export async function GET(
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

    // Get presentation config
    const presentationConfig = await getPresentationConfig(id);

    return NextResponse.json({
      project,
      presentationConfig,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project and/or its presentation config
 */
export async function PATCH(
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

    const body = await request.json();

    let updatedProject = project;
    let updatedConfig = null;

    // Update project if project data is provided
    if (body.project) {
      const projectValidation = updateProjectSchema.safeParse(body.project);

      if (!projectValidation.success) {
        return NextResponse.json(
          {
            error: 'Invalid project data',
            details: projectValidation.error.issues,
          },
          { status: 400 }
        );
      }

      updatedProject = await updateProject(id, projectValidation.data);
    }

    // Update presentation config if provided
    if (body.presentationConfig) {
      const configValidation = presentationConfigSchema.safeParse(body.presentationConfig);

      if (!configValidation.success) {
        return NextResponse.json(
          {
            error: 'Invalid presentation config data',
            details: configValidation.error.issues,
          },
          { status: 400 }
        );
      }

      updatedConfig = await updatePresentationConfig(
        id,
        configValidation.data
      );
    }

    return NextResponse.json({
      project: updatedProject,
      presentationConfig: updatedConfig,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft delete a project
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

    const deletedProject = await deleteProject(id);

    return NextResponse.json(deletedProject);
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
