import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, getSubmissionsByStatus } from '@/lib/db/submissions';
import { submissionSchema } from '@/lib/validations/submission';
import { auth } from '@/auth';

/**
 * GET /api/submissions
 * Get submissions by project and status (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status') as 'pending' | 'approved' | 'declined' | 'deleted' | 'archived' | null;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const submissions = await getSubmissionsByStatus(projectId, status);

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/submissions
 * Create a new submission (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, submission } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate submission data
    const validation = submissionSchema.safeParse(submission);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid submission data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Create submission
    const newSubmission = await createSubmission(projectId, validation.data);

    return NextResponse.json(
      {
        success: true,
        submission: newSubmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create submission error:', error);
    // Log additional error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
