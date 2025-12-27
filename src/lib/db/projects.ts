import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import { getUserById, getUserAccessibleProjects } from './users';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type PresentationConfig = Database['public']['Tables']['presentation_config']['Row'];
type PresentationConfigInsert = Database['public']['Tables']['presentation_config']['Insert'];

/**
 * Get all projects accessible by the current user
 * Super admins see all projects, regular users see only assigned projects
 */
export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createAdminClient();

  // Check if user is super admin
  const user = await getUserById(userId);
  if (user?.role === 'super_admin') {
    // Super admins can see all projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch projects:', error);
      throw new Error('Failed to fetch projects');
    }

    return data;
  }

  // Regular users can only see assigned projects
  const accessibleProjectIds = await getUserAccessibleProjects(userId);

  if (accessibleProjectIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', accessibleProjectIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to fetch projects');
  }

  return data;
}

/**
 * Get all active projects accessible by the current user
 * Super admins see all active projects, regular users see only assigned active projects
 */
export async function getActiveProjects(userId: string): Promise<Project[]> {
  const supabase = createAdminClient();

  // Check if user is super admin
  const user = await getUserById(userId);
  if (user?.role === 'super_admin') {
    // Super admins can see all active projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active projects:', error);
      throw new Error('Failed to fetch active projects');
    }

    return data;
  }

  // Regular users can only see assigned active projects
  const accessibleProjectIds = await getUserAccessibleProjects(userId);

  if (accessibleProjectIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', accessibleProjectIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch active projects:', error);
    throw new Error('Failed to fetch active projects');
  }

  return data;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch project:', error);
    throw new Error('Failed to fetch project');
  }

  return data;
}

/**
 * Get a project by slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch project:', error);
    throw new Error('Failed to fetch project');
  }

  return data;
}

/**
 * Check if a slug already exists
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  let query = supabase
    .from('projects')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to check slug:', error);
    throw new Error('Failed to check slug');
  }

  return data.length > 0;
}

/**
 * Get all existing slugs
 */
export async function getAllSlugs(): Promise<string[]> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .select('slug');

  if (error) {
    console.error('Failed to fetch slugs:', error);
    throw new Error('Failed to fetch slugs');
  }

  return (data || []).map((p: { slug: string }) => p.slug);
}

/**
 * Create a new project
 */
export async function createProject(
  project: ProjectInsert
): Promise<Project> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .insert(project as never)
    .select()
    .single();

  if (error) {
    console.error('Failed to create project:', error);
    throw new Error('Failed to create project');
  }

  return data as Project;
}

/**
 * Create a project with presentation config
 */
export async function createProjectWithConfig(
  project: ProjectInsert,
  config: Omit<PresentationConfigInsert, 'project_id'>
): Promise<{ project: Project; config: PresentationConfig }> {
  const supabase = createAdminClient();

  // Create project first
  console.log('[DB] Inserting project into database');
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert(project as never)
    .select()
    .single();

  if (projectError) {
    console.error('[DB] Failed to create project:', projectError);
    console.error('[DB] Error details:', JSON.stringify(projectError, null, 2));
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  const typedProjectData = projectData as Project;
  console.log('[DB] Project created with ID:', typedProjectData.id);

  // Create presentation config
  console.log('[DB] Inserting presentation config');
  const configToInsert = {
    ...config,
    project_id: typedProjectData.id,
  };
  console.log('[DB] Config to insert:', JSON.stringify(configToInsert, null, 2));

  const { data: configData, error: configError } = await supabase
    .from('presentation_config')
    .insert(configToInsert as never)
    .select()
    .single();

  if (configError) {
    console.error('[DB] Failed to create presentation config:', configError);
    console.error('[DB] Error details:', JSON.stringify(configError, null, 2));
    // Try to rollback project creation
    console.log('[DB] Rolling back project creation');
    await supabase.from('projects').delete().eq('id', typedProjectData.id);
    throw new Error(`Failed to create presentation config: ${configError.message}`);
  }

  console.log('[DB] Presentation config created successfully');

  // Auto-assign the creator to the project if they're not a super admin
  if (project.created_by) {
    const { getUserById } = await import('@/lib/db/users');
    const creator = await getUserById(project.created_by);

    if (creator && creator.role !== 'super_admin') {
      console.log('[DB] Auto-assigning regular admin to project');
      const { error: assignError } = await supabase
        .from('project_users')
        .insert({
          project_id: typedProjectData.id,
          user_id: project.created_by,
          assigned_by: project.created_by,
        } as never);

      if (assignError) {
        console.error('[DB] Failed to auto-assign user to project:', assignError);
        // Don't fail the whole operation, just log the error
      } else {
        console.log('[DB] User auto-assigned to project successfully');
      }
    }
  }

  return {
    project: typedProjectData,
    config: configData as PresentationConfig,
  };
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: ProjectUpdate
): Promise<Project> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to update project');
  }

  return data as Project;
}

/**
 * Archive a project
 */
export async function archiveProject(id: string): Promise<Project> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to archive project:', error);
    throw new Error('Failed to archive project');
  }

  return data as Project;
}

/**
 * Reactivate an archived project
 */
export async function reactivateProject(id: string): Promise<Project> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .update({
      status: 'active',
      archived_at: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to reactivate project:', error);
    throw new Error('Failed to reactivate project');
  }

  return data as Project;
}

/**
 * Delete a project (soft delete by setting status)
 */
export async function deleteProject(id: string): Promise<Project> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error} = await supabase
    .from('projects')
    .update({ status: 'deleted' } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project');
  }

  return data as Project;
}

/**
 * Permanently delete a project (hard delete)
 * Cascades to delete all submissions and associated media files
 */
export async function permanentlyDeleteProject(id: string): Promise<void> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  // First, get all submissions for this project to delete their media files
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    .select('photo_url, video_url')
    .eq('project_id', id);

  if (fetchError) {
    console.error('Failed to fetch submissions for deletion:', fetchError);
    throw new Error('Failed to fetch submissions for deletion');
  }

  // Delete media files from Supabase Storage
  if (submissions && submissions.length > 0) {
    const filesToDelete: string[] = [];

    submissions.forEach((submission: { photo_url: string | null; video_url: string | null }) => {
      // Extract file paths from URLs
      if (submission.photo_url) {
        const photoPath = extractStoragePath(submission.photo_url);
        if (photoPath) filesToDelete.push(photoPath);
      }
      if (submission.video_url) {
        const videoPath = extractStoragePath(submission.video_url);
        if (videoPath) filesToDelete.push(videoPath);
      }
    });

    // Delete files from storage bucket
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('submissions')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Failed to delete media files:', storageError);
        // Don't throw - continue with database deletion even if storage fails
      }
    }
  }

  // Delete presentation config (will cascade from project deletion, but explicit is safer)
  await supabase
    .from('presentation_config')
    .delete()
    .eq('project_id', id);

  // Delete all submissions (database will cascade from foreign key, but explicit is safer)
  await supabase
    .from('submissions')
    .delete()
    .eq('project_id', id);

  // Finally, delete the project itself
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to permanently delete project:', error);
    throw new Error('Failed to permanently delete project');
  }
}

/**
 * Helper function to extract storage path from Supabase URL
 */
function extractStoragePath(url: string): string | null {
  try {
    // Supabase storage URLs follow pattern: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Failed to extract storage path:', error);
    return null;
  }
}

/**
 * Get presentation config for a project
 */
export async function getPresentationConfig(projectId: string): Promise<PresentationConfig | null> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('presentation_config')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch presentation config:', error);
    throw new Error('Failed to fetch presentation config');
  }

  return data;
}

/**
 * Update presentation config
 */
export async function updatePresentationConfig(
  projectId: string,
  updates: Partial<Omit<PresentationConfigInsert, 'project_id'>>
): Promise<PresentationConfig> {
  // Use admin client to bypass RLS since we're using NextAuth (not Supabase Auth)
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('presentation_config')
    .update(updates as never)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update presentation config:', error);
    throw new Error('Failed to update presentation config');
  }

  return data as PresentationConfig;
}
