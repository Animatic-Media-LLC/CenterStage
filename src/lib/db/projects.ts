import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type PresentationConfig = Database['public']['Tables']['presentation_config']['Row'];
type PresentationConfigInsert = Database['public']['Tables']['presentation_config']['Insert'];

/**
 * Get all projects for the current user
 */
export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to fetch projects');
  }

  return data;
}

/**
 * Get all active projects
 */
export async function getActiveProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', userId)
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

  // Create project first
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert(project as never)
    .select()
    .single();

  if (projectError) {
    console.error('Failed to create project:', projectError);
    throw new Error('Failed to create project');
  }

  const typedProjectData = projectData as Project;

  // Create presentation config
  const { data: configData, error: configError } = await supabase
    .from('presentation_config')
    .insert({
      ...config,
      project_id: typedProjectData.id,
    } as never)
    .select()
    .single();

  if (configError) {
    console.error('Failed to create presentation config:', configError);
    // Try to rollback project creation
    await supabase.from('projects').delete().eq('id', typedProjectData.id);
    throw new Error('Failed to create presentation config');
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
 * Delete a project (soft delete by setting status)
 */
export async function deleteProject(id: string): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
 */
export async function permanentlyDeleteProject(id: string): Promise<void> {
  const supabase = await createClient();

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
 * Get presentation config for a project
 */
export async function getPresentationConfig(projectId: string): Promise<PresentationConfig | null> {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
