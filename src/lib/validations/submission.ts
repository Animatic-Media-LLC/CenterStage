import { z } from 'zod';

/**
 * Submission validation schema
 * For public form submissions
 */
export const submissionSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  social_handle: z
    .string()
    .max(30, 'Social handle must be less than 30 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim(),

  photo_url: z
    .string()
    .url('Invalid photo URL')
    .optional()
    .or(z.literal('')),

  video_url: z
    .string()
    .url('Invalid video URL')
    .optional()
    .or(z.literal('')),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

/**
 * Update submission validation schema
 * For admin updates to submissions
 */
export const updateSubmissionSchema = z.object({
  status: z.enum(['pending', 'approved', 'declined', 'deleted', 'archived']).optional(),
  display_mode: z.enum(['once', 'repeat']).optional(),
  custom_timing: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .or(z.null()),
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
