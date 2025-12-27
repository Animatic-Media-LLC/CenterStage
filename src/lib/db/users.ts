import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import bcrypt from 'bcryptjs';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];
type ProjectUser = Database['public']['Tables']['project_users']['Row'];
type ProjectUserInsert = Database['public']['Tables']['project_users']['Insert'];

/**
 * Get all users (super admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users');
  }

  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // User not found
    }
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user');
  }

  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // User not found
    }
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user');
  }

  return data;
}

/**
 * Generate a random password
 */
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Create a new user (super admin only)
 * Returns the created user and the generated password
 */
export async function createUser(
  email: string,
  name: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<{ user: User; password: string }> {
  const supabase = createAdminClient();

  // Generate random password
  const password = generatePassword(12);
  const passwordHash = await bcrypt.hash(password, 10);

  const userInsert: UserInsert = {
    email,
    name,
    role,
    password_hash: passwordHash,
    password_plain: password, // Store plaintext for super admin access
  };

  const { data, error } = await supabase
    .from('users')
    .insert(userInsert as never)
    .select()
    .single();

  if (error) {
    console.error('Failed to create user:', error);
    if (error.code === '23505') {
      throw new Error('A user with this email already exists');
    }
    throw new Error('Failed to create user');
  }

  return { user: data, password };
}

/**
 * Update user information (super admin only)
 */
export async function updateUser(
  userId: string,
  updates: {
    email?: string;
    name?: string;
    role?: 'admin' | 'super_admin';
  }
): Promise<User> {
  const supabase = createAdminClient();

  const userUpdate: UserUpdate = {
    ...updates,
  };

  const { data, error } = await supabase
    .from('users')
    .update(userUpdate as never)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update user:', error);
    if (error.code === '23505') {
      throw new Error('A user with this email already exists');
    }
    throw new Error('Failed to update user');
  }

  return data;
}

/**
 * Reset user password (super admin only)
 * Returns the new password
 */
export async function resetUserPassword(userId: string): Promise<string> {
  const supabase = createAdminClient();

  // Generate new password
  const password = generatePassword(12);
  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      password_plain: password,
    } as never)
    .eq('id', userId);

  if (error) {
    console.error('Failed to reset password:', error);
    throw new Error('Failed to reset password');
  }

  return password;
}

/**
 * Update user password with custom value (super admin only)
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const supabase = createAdminClient();

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      password_plain: newPassword,
    } as never)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update password:', error);
    throw new Error('Failed to update password');
  }
}

/**
 * Delete a user (super admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('users').delete().eq('id', userId);

  if (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.role === 'super_admin';
}

/**
 * Get all project assignments for a user
 */
export async function getUserProjectAssignments(
  userId: string
): Promise<ProjectUser[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('project_users')
    .select('*')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch project assignments:', error);
    throw new Error('Failed to fetch project assignments');
  }

  return data;
}

/**
 * Get all users assigned to a project
 */
export async function getProjectAssignedUsers(
  projectId: string
): Promise<ProjectUser[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('project_users')
    .select('*')
    .eq('project_id', projectId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch assigned users:', error);
    throw new Error('Failed to fetch assigned users');
  }

  return data;
}

/**
 * Assign user to project (super admin only)
 */
export async function assignUserToProject(
  userId: string,
  projectId: string,
  assignedBy: string
): Promise<ProjectUser> {
  const supabase = createAdminClient();

  const projectUserInsert: ProjectUserInsert = {
    user_id: userId,
    project_id: projectId,
    assigned_by: assignedBy,
  };

  const { data, error } = await supabase
    .from('project_users')
    .insert(projectUserInsert as never)
    .select()
    .single();

  if (error) {
    console.error('Failed to assign user to project:', error);
    if (error.code === '23505') {
      throw new Error('User is already assigned to this project');
    }
    throw new Error('Failed to assign user to project');
  }

  return data;
}

/**
 * Remove user from project (super admin only)
 */
export async function removeUserFromProject(
  userId: string,
  projectId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('project_users')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);

  if (error) {
    console.error('Failed to remove user from project:', error);
    throw new Error('Failed to remove user from project');
  }
}

/**
 * Check if user has access to a specific project
 */
export async function hasProjectAccess(
  userId: string,
  projectId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  // Check if user is super admin
  const user = await getUserById(userId);
  if (user?.role === 'super_admin') {
    return true;
  }

  // Check if user is assigned to project
  const { data, error } = await supabase
    .from('project_users')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to check project access:', error);
    throw new Error('Failed to check project access');
  }

  return !!data;
}

/**
 * Get all projects accessible by user (super admin sees all, regular users see assigned)
 */
export async function getUserAccessibleProjects(userId: string): Promise<string[]> {
  const supabase = createAdminClient();

  // Check if user is super admin
  const user = await getUserById(userId);
  if (user?.role === 'super_admin') {
    // Return all project IDs
    const { data, error } = await supabase
      .from('projects')
      .select('id');

    if (error) {
      console.error('Failed to fetch all projects:', error);
      throw new Error('Failed to fetch all projects');
    }

    return (data as Array<{ id: string }>).map(p => p.id);
  }

  // Get assigned project IDs for regular users
  const { data, error } = await supabase
    .from('project_users')
    .select('project_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch accessible projects:', error);
    throw new Error('Failed to fetch accessible projects');
  }

  return (data as Array<{ project_id: string }>).map(p => p.project_id);
}
