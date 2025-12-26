'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { submissionSchema, type SubmissionInput } from '@/lib/validations/submission';
import { uploadSubmissionPhoto, uploadSubmissionVideo } from '@/lib/utils/file-upload';
import { CloudUpload, Video } from 'lucide-react';
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
    setErrors({});
    setServerError(null);
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

      // Validate with Zod
      const validation = submissionSchema.safeParse(submissionData);
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
          <Button onClick={handleSubmitAnother} size="lg">
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
              <Label htmlFor="full_name">
                Full Name <span className={styles.required}>*</span>
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={errors.full_name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.full_name && (
                <span className={styles.errorText}>
                  {errors.full_name}
                </span>
              )}
            </div>

            {/* Social Handle (Optional) */}
            <div className={styles.fieldContainer}>
              <Label htmlFor="social_handle">Social Handle (Optional)</Label>
              <Input
                id="social_handle"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="@username"
                className={errors.social_handle ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.social_handle && (
                <span className={styles.errorText}>
                  {errors.social_handle}
                </span>
              )}
            </div>

            {/* Email (Conditional) */}
            {requireEmail && (
              <div className={styles.fieldContainer}>
                <Label htmlFor="email">
                  Email Address <span className={styles.required}>*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your email will NOT be posted publicly
                </p>
                {errors.email && (
                  <span className={styles.errorText}>
                    {errors.email}
                  </span>
                )}
              </div>
            )}

            {/* Comment */}
            <div className={styles.fieldContainer}>
              <Label htmlFor="comment">
                Your Comment <span className={styles.required}>*</span>
              </Label>
              <TextField
                id="comment"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                fullWidth
                error={!!errors.comment}
                helperText={errors.comment || `${characterCount}/${characterLimit} characters`}
                disabled={isSubmitting}
                inputProps={{ maxLength: characterLimit }}
              />
            </div>

            {/* Photo/Video Upload */}
            <div className={styles.fieldContainer}>
              <Label>{allowVideoUploads ? 'Photo or Video (Optional)' : 'Photo (Optional)'}</Label>

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
                    variant="outline"
                    onClick={handleRemoveMedia}
                    disabled={isSubmitting}
                    className={styles.removePhotoButton}
                  >
                    Remove {mediaType === 'photo' ? 'Photo' : 'Video'}
                  </Button>
                </div>
              ) : (
                <div
                  className={`${styles.uploadBox} ${errors.media ? styles.error : ''}`}
                  onClick={() => document.getElementById('media-input')?.click()}
                >
                  <input
                    id="media-input"
                    type="file"
                    accept={allowVideoUploads
                      ? "image/jpeg,image/jpg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm,video/x-m4v"
                      : "image/jpeg,image/jpg,image/png,image/webp,image/heic"}
                    onChange={handleMediaChange}
                    disabled={isSubmitting}
                    className={styles.hiddenInput}
                    capture="environment"
                  />
                  <CloudUpload size={48} className={styles.uploadIcon} />
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
                </div>
              )}

              {errors.media && (
                <span className={styles.errorText}>
                  {errors.media}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              size="lg"
              className={styles.submitButton}
              style={{ backgroundColor: buttonColor, color: '#ffffff' }}
            >
              {isUploading ? (
                <>
                  <CircularProgress size={20} className={styles.buttonIcon} />
                  Uploading Photo...
                </>
              ) : isSubmitting ? (
                <>
                  <CircularProgress size={20} className={styles.buttonIcon} />
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
