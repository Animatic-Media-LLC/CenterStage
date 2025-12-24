import { createClient as createServerClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import type { SubmissionInput, UpdateSubmissionInput } from '@/lib/validations/submission';

/**
 * Create anonymous Supabase client for public submissions
 */
function createAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a new submission (public endpoint)
 */
export async function createSubmission(projectId: string, data: SubmissionInput) {
  console.log('createSubmission called with:', { projectId, data });

  // TODO: Once RLS policy is applied, switch back to createAnonClient()
  // const supabase = createAnonClient();
  const supabase = createAdminClient();
  console.log('Supabase client created');

  const insertData = {
    project_id: projectId,
    full_name: data.full_name,
    social_handle: data.social_handle || null,
    comment: data.comment,
    photo_url: data.photo_url || null,
    video_url: data.video_url || null,
    status: 'pending' as const,
  };

  console.log('Attempting to insert:', insertData);

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to create submission: ${error.message}`);
  }

  console.log('Submission created successfully:', submission);
  return submission;
}

/**
 * Get all submissions for a project (admin only)
 */
export async function getSubmissionsByProject(projectId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get submissions error:', error);
    throw new Error('Failed to fetch submissions');
  }

  return data;
}

/**
 * Get submissions by status (admin only)
 */
export async function getSubmissionsByStatus(
  projectId: string,
  status: 'pending' | 'approved' | 'declined' | 'deleted' | 'archived'
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get submissions by status error:', error);
    throw new Error('Failed to fetch submissions');
  }

  return data;
}

/**
 * Get approved submissions for presentation (public endpoint)
 */
export async function getApprovedSubmissions(projectId: string) {
  const supabase = createAnonClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get approved submissions error:', error);
    throw new Error('Failed to fetch approved submissions');
  }

  return data;
}

/**
 * Update a submission (admin only)
 */
export async function updateSubmission(
  submissionId: string,
  data: UpdateSubmissionInput,
  reviewedBy?: string
) {
  const supabase = createAdminClient();

  const updateData: any = { ...data };

  // If status is being changed, add reviewed_at and reviewed_by
  if (data.status) {
    updateData.reviewed_at = new Date().toISOString();
    if (reviewedBy) {
      updateData.reviewed_by = reviewedBy;
    }
  }

  // Workaround for Supabase type inference issue
  const supabaseAny = supabase as any;
  const { data: submission, error } = await supabaseAny
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Update submission error:', error);
    throw new Error('Failed to update submission');
  }

  return submission;
}

/**
 * Delete a submission (admin only)
 */
export async function deleteSubmission(submissionId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    console.error('Delete submission error:', error);
    throw new Error('Failed to delete submission');
  }

  return true;
}

/**
 * Get submission by ID (admin only)
 */
export async function getSubmissionById(submissionId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('Get submission error:', error);
    return null;
  }

  return data;
}

/**
 * Get dashboard statistics (admin only)
 * Returns counts for pending and approved submissions across all projects
 */
export async function getDashboardStats(userId: string) {
  const supabase = createAdminClient();

  // Get all projects for this user to filter submissions
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('created_by', userId);

  if (projectsError || !projects || projects.length === 0) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
    };
  }

  const projectIds = projects.map((p: { id: string }) => p.id);

  // Get project counts
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId);

  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId)
    .eq('status', 'active');

  // Get submission counts
  const { count: pendingSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds)
    .eq('status', 'pending');

  const { count: approvedSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds)
    .eq('status', 'approved');

  return {
    totalProjects: totalProjects || 0,
    activeProjects: activeProjects || 0,
    pendingSubmissions: pendingSubmissions || 0,
    approvedSubmissions: approvedSubmissions || 0,
  };
}

/**
 * Get recent pending submissions across all user's projects (admin only)
 * Returns the 10 most recent pending submissions
 */
export async function getRecentPendingSubmissions(userId: string, limit: number = 10) {
  const supabase = createAdminClient();

  // Get all projects for this user
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('created_by', userId);

  if (projectsError || !projects || projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((p: { id: string }) => p.id);

  // Get recent pending submissions with project info
  const { data, error } = await supabase
    .from('submissions')
    .select('*, projects!inner(id, name, slug)')
    .in('project_id', projectIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Get recent pending submissions error:', error);
    throw new Error('Failed to fetch recent pending submissions');
  }

  return data;
}

/**
 * Get pending submission counts for multiple projects (admin only)
 * Returns a map of project IDs to pending submission counts
 */
export async function getPendingCountsForProjects(projectIds: string[]): Promise<Record<string, number>> {
  if (projectIds.length === 0) {
    return {};
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('project_id')
    .in('project_id', projectIds)
    .eq('status', 'pending');

  if (error) {
    console.error('Get pending counts error:', error);
    return {};
  }

  // Count submissions by project
  const counts: Record<string, number> = {};
  projectIds.forEach(id => counts[id] = 0);

  data.forEach((submission: { project_id: string }) => {
    counts[submission.project_id] = (counts[submission.project_id] || 0) + 1;
  });

  return counts;
}
