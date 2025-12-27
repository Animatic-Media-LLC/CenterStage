import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BACKGROUND_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, allowedTypes: string[] = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]): UploadError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: 'File size must be less than 10MB',
      code: 'FILE_TOO_LARGE',
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const isImageOnly = allowedTypes.every(type => type.startsWith('image/'));
    const isVideoOnly = allowedTypes.every(type => type.startsWith('video/'));

    if (isImageOnly) {
      return {
        message: 'Only JPEG, PNG, WebP, and HEIC images are allowed',
        code: 'INVALID_FILE_TYPE',
      };
    } else if (isVideoOnly) {
      return {
        message: 'Only MP4, MOV, and WebM videos are allowed',
        code: 'INVALID_FILE_TYPE',
      };
    } else {
      return {
        message: 'Only images (JPEG, PNG, WebP, HEIC) and videos (MP4, MOV, WebM) are allowed',
        code: 'INVALID_FILE_TYPE',
      };
    }
  }

  return null;
}

/**
 * Get file extension from MIME type to prevent extension spoofing
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'video/x-m4v': 'm4v',
  };
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadSubmissionPhoto(
  file: File,
  projectSlug: string
): Promise<UploadResult> {
  // Validate file
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const supabase = createClient();

  // Generate unique filename using MIME type for extension (prevent spoofing)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = getExtensionFromMimeType(file.type);
  const filename = `${projectSlug}/${timestamp}-${randomStr}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload photo');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('submissions')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadSubmissionVideo(
  file: File,
  projectSlug: string
): Promise<UploadResult> {
  // Validate file
  const validationError = validateFile(file, ALLOWED_VIDEO_TYPES);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const supabase = createClient();

  // Generate unique filename using MIME type for extension (prevent spoofing)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = getExtensionFromMimeType(file.type);
  const filename = `${projectSlug}/videos/${timestamp}-${randomStr}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload video');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('submissions')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteSubmissionPhoto(path: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from('submissions')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
}

/**
 * Get upload progress (for future implementation)
 */
export function createUploadProgress() {
  let progress = 0;

  return {
    get: () => progress,
    set: (value: number) => {
      progress = Math.min(100, Math.max(0, value));
    },
  };
}

/**
 * Validate background image file before upload
 */
export function validateBackgroundImage(file: File): UploadError | null {
  // Check file size (5MB limit for background images)
  if (file.size > MAX_BACKGROUND_IMAGE_SIZE) {
    return {
      message: 'Background image must be less than 5MB',
      code: 'FILE_TOO_LARGE',
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      message: 'Only JPEG, PNG, WebP, and HEIC images are allowed',
      code: 'INVALID_FILE_TYPE',
    };
  }

  return null;
}

/**
 * Upload background image to Supabase Storage
 */
export async function uploadBackgroundImage(
  file: File,
  projectSlug: string
): Promise<UploadResult> {
  // Validate file
  const validationError = validateBackgroundImage(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const supabase = createClient();

  // Generate unique filename using MIME type for extension (prevent spoofing)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = getExtensionFromMimeType(file.type);
  const filename = `${projectSlug}/background/${timestamp}-${randomStr}.${extension}`;

  // Upload to Supabase Storage (submissions bucket)
  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload background image');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('submissions')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}
