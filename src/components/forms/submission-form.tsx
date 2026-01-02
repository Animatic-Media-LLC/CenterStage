'use client';

import { useState } from 'react';
import { z } from 'zod';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { submissionSchema, type SubmissionInput } from '@/lib/validations/submission';
import { uploadSubmissionPhoto, uploadSubmissionVideo } from '@/lib/utils/file-upload';
import { CloudUpload } from 'lucide-react';
import styles from './submission-form.module.scss';

interface SubmissionFormProps {
  projectId: string;
  projectSlug: string;
  allowVideoUploads?: boolean;
  maxVideoDuration?: number;
  requireEmail?: boolean;
  buttonColor?: string;
}

export function SubmissionForm({ projectId, projectSlug, allowVideoUploads = true, maxVideoDuration = 12, requireEmail = false, buttonColor = '#3b82f6' }: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const characterCount = comment.length;
  const characterLimit = 500;

  // Detect video duration using HTML5 Video API
  const detectVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration * 10) / 10; // Round to 1 decimal place
        resolve(duration);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Handle media file selection (photo or video)
  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ ...errors, media: 'File must be less than 10MB' });
      return;
    }

    // Determine file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

    if (isImage && !allowedImageTypes.includes(file.type)) {
      setErrors({ ...errors, media: 'Only JPEG, PNG, WebP, and HEIC images are allowed' });
      return;
    }

    if (isVideo && !allowedVideoTypes.includes(file.type)) {
      setErrors({ ...errors, media: 'Only MP4, MOV, and WebM videos are allowed' });
      return;
    }

    // Check if videos are allowed for this project
    if (isVideo && !allowVideoUploads) {
      setErrors({ ...errors, media: 'Video uploads are not allowed for this project. Please upload a photo instead.' });
      return;
    }

    if (!isImage && !isVideo) {
      setErrors({ ...errors, media: allowVideoUploads ? 'Only images and videos are allowed' : 'Only images are allowed' });
      return;
    }

    // Detect and validate video duration
    if (isVideo) {
      try {
        const duration = await detectVideoDuration(file);
        setVideoDuration(duration);

        // Validate against max duration
        if (duration > maxVideoDuration) {
          setErrors({
            ...errors,
            media: `Your video is ${duration}s long. Please upload a video that's ${maxVideoDuration}s or less.`
          });
          return;
        }
      } catch (error) {
        console.error('Error detecting video duration:', error);
        setErrors({ ...errors, media: 'Failed to read video file. Please try a different video.' });
        return;
      }
    } else {
      setVideoDuration(null);
    }

    setMediaFile(file);
    setMediaType(isImage ? 'photo' : 'video');
    setErrors({ ...errors, media: '' });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove media file
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setVideoDuration(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields before submitting
    const validationErrors: Record<string, string> = {};

    // Validate full name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      validationErrors.full_name = 'Name is required';
    } else if (trimmedName.length < 2) {
      validationErrors.full_name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      validationErrors.full_name = 'Name must be less than 100 characters';
    }

    // Validate social handle
    const trimmedHandle = socialHandle.trim();
    if (trimmedHandle && trimmedHandle.length > 30) {
      validationErrors.social_handle = 'Social handle must be less than 30 characters';
    }

    // Validate email
    const trimmedEmail = email.trim();
    if (requireEmail && !trimmedEmail) {
      validationErrors.email = 'Email is required';
    } else if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.email = 'Invalid email address';
    }

    // Validate comment
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      validationErrors.comment = 'Comment is required';
    } else if (trimmedComment.length < 10) {
      validationErrors.comment = 'Comment must be at least 10 characters';
    } else if (trimmedComment.length > 500) {
      validationErrors.comment = 'Comment must be less than 500 characters';
    }

    // If there are validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let photoUrl = '';
      let videoUrl = '';

      // Upload media file if one was selected
      if (mediaFile) {
        setIsUploading(true);
        try {
          if (mediaType === 'photo') {
            const result = await uploadSubmissionPhoto(mediaFile, projectSlug);
            photoUrl = result.url;
          } else if (mediaType === 'video') {
            const result = await uploadSubmissionVideo(mediaFile, projectSlug);
            videoUrl = result.url;
          }
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload file';
          setErrors({ media: errorMessage });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Prepare submission data
      const submissionData: SubmissionInput = {
        full_name: fullName,
        social_handle: socialHandle,
        email: email,
        comment: comment,
        photo_url: photoUrl,
        video_url: videoUrl,
      };

      // Create dynamic validation schema based on requireEmail
      const dynamicSchema = requireEmail
        ? submissionSchema.extend({
            email: z.string().min(1, 'Email is required').email('Invalid email address'),
          })
        : submissionSchema;

      // Validate with Zod
      const validation = dynamicSchema.safeParse(submissionData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          submission: submissionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        setServerError(errorData.message || errorData.error || 'Failed to submit. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success!
      setIsSuccess(true);
    } catch (error) {
      console.error('Submission error:', error);
      setServerError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle "Submit Another" button
  const handleSubmitAnother = () => {
    setIsSuccess(false);
    setIsSubmitting(false);
    setIsUploading(false);
    setFullName('');
    setSocialHandle('');
    setEmail('');
    setComment('');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setVideoDuration(null);
    setErrors({});
    setServerError(null);
  };

  // Success screen
  if (isSuccess) {
    return (
      <Card>
        <CardContent className={styles.successContainer}>
          <CheckCircleIcon className={styles.successIcon} />
          <Typography variant="h4" gutterBottom>
            Thank you, {fullName}!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your submission has been received and will be reviewed shortly.
          </Typography>
          <Button
            onClick={handleSubmitAnother}
            variant="contained"
            size="large"
            sx={{ backgroundColor: buttonColor, color: '#ffffff' }}
          >
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className={styles.submissionCard}>
        <CardContent>
          <div className={styles.formContainer}>
            {/* Server Error */}
            {serverError && (
              <Alert severity="error" onClose={() => setServerError(null)}>
                {serverError}
              </Alert>
            )}

            {/* Full Name */}
            <div className={styles.fieldContainer}>
              <TextField
                id="full_name"
                label={<>Full Name <span className={styles.required}>*</span></>}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  // Clear error when user starts typing
                  if (errors.full_name) {
                    setErrors({ ...errors, full_name: '' });
                  }
                }}
                onBlur={(e) => {
                  // Validate on blur
                  const value = e.target.value.trim();
                  if (!value) {
                    setErrors({ ...errors, full_name: 'Name is required' });
                  } else if (value.length < 2) {
                    setErrors({ ...errors, full_name: 'Name must be at least 2 characters' });
                  } else if (value.length > 100) {
                    setErrors({ ...errors, full_name: 'Name must be less than 100 characters' });
                  }
                }}
                placeholder="John Doe"
                error={!!errors.full_name}
                helperText={errors.full_name}
                disabled={isSubmitting}
                fullWidth
                variant="outlined"
                size="small"
              />
            </div>

            {/* Social Handle (Optional) */}
            <div className={styles.fieldContainer}>
              <TextField
                id="social_handle"
                label="Social Handle (Optional)"
                value={socialHandle}
                onChange={(e) => {
                  setSocialHandle(e.target.value);
                  // Clear error when user starts typing
                  if (errors.social_handle) {
                    setErrors({ ...errors, social_handle: '' });
                  }
                }}
                onBlur={(e) => {
                  // Validate on blur
                  const value = e.target.value.trim();
                  if (value && value.length > 30) {
                    setErrors({ ...errors, social_handle: 'Social handle must be less than 30 characters' });
                  }
                }}
                placeholder="@username"
                error={!!errors.social_handle}
                helperText={errors.social_handle}
                disabled={isSubmitting}
                fullWidth
                variant="outlined"
                size="small"
              />
            </div>

            {/* Email (Conditional) */}
            {requireEmail && (
              <div className={styles.fieldContainer}>
                <TextField
                  id="email"
                  label={<>Email Address <span className={styles.required}>*</span></>}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    const value = e.target.value.trim();
                    if (requireEmail && !value) {
                      setErrors({ ...errors, email: 'Email is required' });
                    } else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setErrors({ ...errors, email: 'Invalid email address' });
                    }
                  }}
                  placeholder="your.email@example.com"
                  error={!!errors.email}
                  helperText={errors.email || 'Your email will NOT be posted publicly'}
                  disabled={isSubmitting}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </div>
            )}

            {/* Comment */}
            <div className={styles.fieldContainer}>
              <TextField
                id="comment"
                label={<>Your Comment <span className={styles.required}>*</span></>}
                multiline
                rows={4}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  // Clear error when user starts typing
                  if (errors.comment) {
                    setErrors({ ...errors, comment: '' });
                  }
                }}
                onBlur={(e) => {
                  // Validate on blur
                  const value = e.target.value.trim();
                  if (!value) {
                    setErrors({ ...errors, comment: 'Comment is required' });
                  } else if (value.length < 10) {
                    setErrors({ ...errors, comment: 'Comment must be at least 10 characters' });
                  } else if (value.length > 500) {
                    setErrors({ ...errors, comment: 'Comment must be less than 500 characters' });
                  }
                }}
                placeholder="Share your thoughts..."
                fullWidth
                error={!!errors.comment}
                helperText={errors.comment || `${characterCount}/${characterLimit} characters`}
                disabled={isSubmitting}
                slotProps={{ htmlInput: { maxLength: characterLimit } }}
              />
            </div>

            {/* Photo/Video Upload */}
            <div className={styles.fieldContainer}>
              <Typography variant="body2" component="label" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                {allowVideoUploads ? 'Photo or Video (Optional)' : 'Photo (Optional)'}
              </Typography>

              {mediaPreview ? (
                <div className={styles.photoPreviewContainer}>
                  {mediaType === 'photo' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className={styles.photoPreview}
                    />
                  ) : (
                    <div>
                      <video
                        src={mediaPreview}
                        controls
                        className={styles.photoPreview}
                        aria-label="Video preview"
                      />
                      {videoDuration !== null && (
                        <Typography variant="body2" sx={{ mt: 1, color: '#6b7280', textAlign: 'center' }}>
                          Duration: {videoDuration}s
                        </Typography>
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleRemoveMedia}
                    disabled={isSubmitting}
                    sx={{ mt: 1 }}
                  >
                    Remove {mediaType === 'photo' ? 'Photo' : 'Video'}
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="media-input"
                  className={`${styles.uploadBox} ${errors.media ? styles.error : ''}`}
                >
                  <input
                    id="media-input"
                    type="file"
                    accept={allowVideoUploads
                      ? "image/*,video/*"
                      : "image/*"}
                    capture="environment"
                    onChange={handleMediaChange}
                    disabled={isSubmitting}
                    className={styles.hiddenInput}
                    aria-label={allowVideoUploads ? "Upload photo or video" : "Upload photo"}
                  />
                  <CloudUpload size={48} className={styles.uploadIcon} aria-hidden="true" />
                  <div className={styles.uploadText}>
                    {allowVideoUploads
                      ? 'Click to upload or capture photo/video'
                      : 'Click to upload or capture photo'}
                  </div>
                  <span className={styles.uploadHint}>
                    {allowVideoUploads
                      ? `Images: JPEG, PNG, WebP, HEIC | Videos: MP4, MOV, WebM (Max ${maxVideoDuration}s, 10MB)`
                      : 'Images: JPEG, PNG, WebP, HEIC (Max 10MB)'}
                  </span>
                </label>
              )}

              {errors.media && (
                <span className={styles.errorText} role="alert" aria-live="polite">
                  {errors.media}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              variant="contained"
              size="large"
              fullWidth
              sx={{ backgroundColor: buttonColor, color: '#ffffff' }}
            >
              {isUploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading Photo...
                </>
              ) : isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
