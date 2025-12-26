import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/submissions/counts
 * Get submission counts by status for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch counts for all statuses in a single query
    const { data, error } = await supabase
      .from('submissions')
      .select('status')
      .eq('project_id', projectId);

    if (error) {
      console.error('Failed to fetch submission counts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submission counts' },
        { status: 500 }
      );
    }

    // Count by status
    const counts = {
      pending: 0,
      approved: 0,
      declined: 0,
      archived: 0,
      deleted: 0,
    };

    data.forEach((submission) => {
      if (submission.status in counts) {
        counts[submission.status as keyof typeof counts]++;
      }
    });

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Get submission counts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
