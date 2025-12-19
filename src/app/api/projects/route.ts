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
    console.log('[API] POST /api/projects - Starting request');

    const session = await auth();
    console.log('[API] Session:', session ? 'authenticated' : 'not authenticated');

    if (!session?.user) {
      console.log('[API] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[API] Request body:', JSON.stringify(body, null, 2));

    // Validate request body
    const validation = createProjectWithConfigSchema.safeParse(body);
    console.log('[API] Validation result:', validation.success ? 'success' : 'failed');

    if (!validation.success) {
      console.log('[API] Validation errors:', validation.error.issues);
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { project, presentationConfig } = validation.data;
    console.log('[API] Validated project:', project);
    console.log('[API] Validated presentationConfig:', presentationConfig);

    // Ensure slug is unique
    console.log('[API] Getting existing slugs');
    const existingSlugs = await getAllSlugs();
    console.log('[API] Existing slugs:', existingSlugs);

    const uniqueSlug = slugify(project.slug, existingSlugs);
    console.log('[API] Unique slug:', uniqueSlug);

    // Create project with config
    console.log('[API] Creating project with config');
    const result = await createProjectWithConfig(
      {
        ...project,
        slug: uniqueSlug,
        created_by: session.user.id,
      },
      presentationConfig
    );
    console.log('[API] Project created successfully:', result.project.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API] Create project error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
