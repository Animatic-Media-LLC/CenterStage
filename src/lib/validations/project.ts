import { z } from 'zod';

/**
 * Project creation validation schema
 * Uses snake_case to match database field names
 */
export const createProjectSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters'),

  client_name: z.string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must be less than 100 characters'),

  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, and hyphens only'),

  team_id: z.string().uuid().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Project update validation schema
 * Uses snake_case to match database field names
 */
export const updateProjectSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters')
    .optional(),

  client_name: z.string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must be less than 100 characters')
    .optional(),

  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, and hyphens only')
    .optional(),

  status: z.enum(['active', 'archived', 'deleted']).optional(),

  team_id: z.string().uuid().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Presentation configuration validation schema
 * Uses snake_case to match database field names
 */
export const presentationConfigSchema = z.object({
  font_family: z.string()
    .min(1, 'Font family is required')
    .default('Inter')
    .optional(),

  font_size: z.number()
    .int('Font size must be an integer')
    .min(16, 'Font size must be at least 16px')
    .max(72, 'Font size must be at most 72px')
    .default(24)
    .optional(),

  text_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Text color must be a valid hex color (e.g., #FFFFFF)')
    .default('#FFFFFF')
    .optional(),

  outline_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Outline color must be a valid hex color (e.g., #000000)')
    .default('#000000')
    .optional(),

  background_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid hex color (e.g., #1a1a1a)')
    .default('#1a1a1a')
    .optional(),

  transition_duration: z.number()
    .int('Transition duration must be an integer')
    .min(1, 'Transition duration must be at least 1 second')
    .max(30, 'Transition duration must be at most 30 seconds')
    .default(5)
    .optional(),

  animation_style: z.enum(['fade', 'slide', 'zoom'])
    .default('fade')
    .optional(),

  layout_template: z.string()
    .min(1, 'Layout template is required')
    .default('standard')
    .optional(),
});

export type PresentationConfigInput = z.infer<typeof presentationConfigSchema>;

/**
 * Combined project with presentation config schema
 */
export const createProjectWithConfigSchema = z.object({
  project: createProjectSchema,
  presentationConfig: presentationConfigSchema,
});

export type CreateProjectWithConfigInput = z.infer<typeof createProjectWithConfigSchema>;
