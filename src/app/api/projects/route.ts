import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createProjectWithConfig, getProjects, getAllSlugs } from '@/lib/db/projects';
import { createProjectWithConfigSchema } from '@/lib/validations/project';
import { slugify } from '@/lib/utils/slugify';

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projects = await getProjects(session.user.id);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project with presentation config
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createProjectWithConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { project, presentationConfig } = validation.data;

    // Ensure slug is unique
    const existingSlugs = await getAllSlugs();
    const uniqueSlug = slugify(project.slug, existingSlugs);

    // Create project with config
    const result = await createProjectWithConfig(
      {
        ...project,
        slug: uniqueSlug,
        created_by: session.user.id,
      },
      presentationConfig
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
