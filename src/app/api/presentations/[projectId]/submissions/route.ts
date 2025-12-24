import { NextRequest, NextResponse } from 'next/server';
import { getApprovedSubmissions } from '@/lib/db/submissions';

/**
 * GET /api/presentations/[projectId]/submissions
 * Get approved submissions for a project (public endpoint for presentation display)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const submissions = await getApprovedSubmissions(projectId);

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error('Get approved submissions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
