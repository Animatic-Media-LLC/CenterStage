import { NextRequest, NextResponse } from 'next/server';
import { updateSubmission, deleteSubmission, getSubmissionById } from '@/lib/db/submissions';
import { updateSubmissionSchema } from '@/lib/validations/submission';
import { auth } from '@/auth';

/**
 * PATCH /api/submissions/[id]
 * Update a submission (admin only)
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
    const body = await request.json();

    // Validate update data
    const validation = updateSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid update data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await updateSubmission(
      id,
      validation.data,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Update submission error:', error);
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
 * DELETE /api/submissions/[id]
 * Permanently delete a submission (admin only)
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

    // Verify submission exists and is in deleted status
    const submission = await getSubmissionById(id);
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if submission is in deleted status
    if ((submission as any).status !== 'deleted') {
      return NextResponse.json(
        { error: 'Can only permanently delete submissions that are already in deleted status' },
        { status: 400 }
      );
    }

    // Permanently delete
    await deleteSubmission(id);

    return NextResponse.json({
      success: true,
      message: 'Submission permanently deleted',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
