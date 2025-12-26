'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useSnackbar } from '@/components/providers/snackbar-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  updateProjectSchema,
  presentationConfigSchema,
  type UpdateProjectInput,
  type PresentationConfigInput,
} from '@/lib/validations/project';
import { slugify, isValidSlug } from '@/lib/utils/slugify';
import { AVAILABLE_FONTS, DEFAULT_FONT_FAMILY, type FontFamily } from '@/lib/constants/fonts';
import { FontPreview } from '@/components/ui/font-preview';
import { uploadBackgroundImage } from '@/lib/utils/file-upload';
import { CloudUpload, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    client_name: string;
    slug: string;
    status: 'active' | 'archived' | 'deleted';
    archived_at: string | null;
  };
  presentationConfig: {
    font_family: string;
    font_size: number;
    text_color: string;
    outline_color: string;
    background_color: string;
    background_image_url: string | null;
    allow_video_uploads: boolean;
    max_video_duration?: number;
    allow_video_finish?: boolean;
    transition_duration: number;
    animation_style: string;
    layout_template: string;
    randomize_order?: boolean;
    require_email?: boolean;
  } | null;
  existingSlugs: string[];
}

export function ProjectEditForm({ project, presentationConfig, existingSlugs }: ProjectEditFormProps) {
  const router = useRouter();
  const { success, error: showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [projectName, setProjectName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name);
  const [slug, setSlug] = useState(project.slug);
  const [slugTouched, setSlugTouched] = useState(false);

  // Presentation config state - initialize with existing values
  const [fontFamily, setFontFamily] = useState<FontFamily>(
    (presentationConfig?.font_family as FontFamily) || DEFAULT_FONT_FAMILY
  );
  const [fontSize, setFontSize] = useState(presentationConfig?.font_size || 24);
  const [textColor, setTextColor] = useState(presentationConfig?.text_color || '#15598a');
  const [outlineColor, setOutlineColor] = useState(presentationConfig?.outline_color || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(presentationConfig?.background_color || '#e0ecf6');
  const [existingBackgroundImageUrl, setExistingBackgroundImageUrl] = useState(presentationConfig?.background_image_url || null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [allowVideoUploads, setAllowVideoUploads] = useState(presentationConfig?.allow_video_uploads ?? true);
  const [maxVideoDuration, setMaxVideoDuration] = useState(presentationConfig?.max_video_duration || 12);
  const [allowVideoFinish, setAllowVideoFinish] = useState(presentationConfig?.allow_video_finish ?? false);
  const [transitionDuration, setTransitionDuration] = useState(presentationConfig?.transition_duration || 5);
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'zoom'>(
    (presentationConfig?.animation_style as 'fade' | 'slide' | 'zoom') || 'fade'
  );
  const [layoutTemplate, setLayoutTemplate] = useState(presentationConfig?.layout_template || 'standard');
  const [randomizeOrder, setRandomizeOrder] = useState(presentationConfig?.randomize_order ?? false);
  const [requireEmail, setRequireEmail] = useState(presentationConfig?.require_email ?? false);

  // Archive/Delete dialog state
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-generate slug when project name changes (if user hasn't manually edited it)
  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    if (!slugTouched && value) {
      const generatedSlug = slugify(value, existingSlugs);
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
  };

  // Handle background image selection
  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors({ ...errors, background_image_url: 'Background image must be less than 5MB' });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, background_image_url: 'Only JPEG, PNG, WebP, and HEIC images are allowed' });
      return;
    }

    setBackgroundImageFile(file);
    setErrors({ ...errors, background_image_url: '' });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove background image
  const handleRemoveBackgroundImage = () => {
    setBackgroundImageFile(null);
    setBackgroundImagePreview(null);
    setExistingBackgroundImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      let backgroundImageUrl = existingBackgroundImageUrl || '';

      // Upload new background image if one was selected
      if (backgroundImageFile) {
        setIsUploadingBackground(true);
        try {
          const result = await uploadBackgroundImage(backgroundImageFile, slug);
          backgroundImageUrl = result.url;
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload background image';
          setErrors({ background_image_url: errorMessage });
          setIsSubmitting(false);
          setIsUploadingBackground(false);
          return;
        }
        setIsUploadingBackground(false);
      }

      // Prepare project data
      const projectData: UpdateProjectInput = {
        name: projectName,
        client_name: clientName,
        slug: slug,
      };

      // Prepare presentation config data
      const presentationConfigData: PresentationConfigInput = {
        font_family: fontFamily,
        font_size: fontSize,
        text_color: textColor,
        outline_color: outlineColor,
        background_color: backgroundColor,
        background_image_url: backgroundImageUrl,
        allow_video_uploads: allowVideoUploads,
        max_video_duration: maxVideoDuration,
        allow_video_finish: allowVideoFinish,
        transition_duration: transitionDuration,
        animation_style: animationStyle,
        layout_template: layoutTemplate,
        randomize_order: randomizeOrder,
        require_email: requireEmail,
      };

      // Validate project data
      const projectValidation = updateProjectSchema.safeParse(projectData);
      if (!projectValidation.success) {
        const fieldErrors: Record<string, string> = {};
        projectValidation.error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Validate presentation config
      const configValidation = presentationConfigSchema.safeParse(presentationConfigData);
      if (!configValidation.success) {
        const fieldErrors: Record<string, string> = {};
        configValidation.error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: projectData,
          presentationConfig: presentationConfigData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((issue: z.ZodIssue) => {
            const path = issue.path.join('.');
            fieldErrors[path] = issue.message;
          });
          setErrors(fieldErrors);
        } else {
          showError(errorData.error || 'Failed to update project');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      success('Project updated successfully!');
      setIsSubmitting(false);

      // Only redirect if slug changed
      if (result.project.slug !== project.slug) {
        router.push(`/admin/projects/${result.project.slug}/edit`);
      }
    } catch (error) {
      console.error('Update project error:', error);
      showError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to archive project');
        setIsArchiving(false);
        return;
      }

      success('Project archived successfully!');
      setShowArchiveDialog(false);
      setIsArchiving(false);
      router.refresh();
    } catch (error) {
      console.error('Archive project error:', error);
      showError('An unexpected error occurred');
      setIsArchiving(false);
    }
  };

  const handleReactivate = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/archive`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to reactivate project');
        setIsArchiving(false);
        return;
      }

      success('Project reactivated successfully!');
      setShowReactivateDialog(false);
      setIsArchiving(false);
      router.refresh();
    } catch (error) {
      console.error('Reactivate project error:', error);
      showError('An unexpected error occurred');
      setIsArchiving(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/permanent-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: deleteConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete project');
        setIsDeleting(false);
        return;
      }

      success('Project permanently deleted');
      setShowDeleteDialog(false);
      setIsDeleting(false);
      router.push('/admin/projects');
    } catch (error) {
      console.error('Delete project error:', error);
      showError('An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => handleProjectNameChange(e.target.value)}
              placeholder="e.g., Summer Campaign 2024"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className={errors.client_name ? 'border-red-500' : ''}
            />
            {errors.client_name && (
              <p className="text-sm text-red-600 mt-1">{errors.client_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">
              Slug
              <span className="text-gray-500 text-xs ml-2">
                (URL-friendly identifier)
              </span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g., summer-campaign-2024"
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && (
              <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
            )}
            {slug && isValidSlug(slug) && !errors.slug && (
              <p className="text-sm text-gray-500 mt-1">
                Preview URL: /submit/{slug}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Presentation Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Presentation Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="font_family">Font Family</Label>
              <Select
                id="font_family"
                value={fontFamily}
                onValueChange={(value) => setFontFamily(value as FontFamily)}
              >
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="font_size">Font Size: {fontSize}px</Label>
              <Slider
                id="font_size"
                min={16}
                max={72}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="text_color">Text Color</Label>
              <ColorPicker
                value={textColor}
                onChange={setTextColor}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="outline_color">Outline Color</Label>
              <ColorPicker
                value={outlineColor}
                onChange={setOutlineColor}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="background_color">Background Color</Label>
              <ColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
                className="mt-2"
              />
            </div>
          </div>

          {/* Font Preview */}
          <div className="mt-6">
            <FontPreview
              fontFamily={fontFamily}
              fontSize={fontSize}
              textColor={textColor}
              outlineColor={outlineColor}
              backgroundColor={backgroundColor}
            />
          </div>

          {/* Background Image Upload */}
          <div className="mt-4">
            <Label>Background Image (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Upload a background image for the presentation page (Max 5MB)
            </p>

            {backgroundImagePreview || existingBackgroundImageUrl ? (
              <div className="space-y-2">
                <img
                  src={backgroundImagePreview || existingBackgroundImageUrl || ''}
                  alt="Background preview"
                  className="w-full max-h-64 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveBackgroundImage}
                  disabled={isSubmitting}
                >
                  Remove Background Image
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                  errors.background_image_url ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => document.getElementById('background-image-input-edit')?.click()}
              >
                <input
                  id="background-image-input-edit"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                  onChange={handleBackgroundImageChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <CloudUpload size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload background image</p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP, HEIC (Max 5MB)
                </p>
              </div>
            )}

            {errors.background_image_url && (
              <p className="text-sm text-red-600 mt-1">{errors.background_image_url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="transition_duration">Transition Duration: {transitionDuration}s</Label>
              <Slider
                id="transition_duration"
                min={1}
                max={30}
                step={1}
                value={[transitionDuration]}
                onValueChange={(value) => setTransitionDuration(value[0])}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="animation_style">Animation Style</Label>
              <Select
                id="animation_style"
                value={animationStyle}
                onValueChange={(value) =>
                  setAnimationStyle(value as 'fade' | 'slide' | 'zoom')
                }
              >
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
              </Select>
            </div>

            <div>
              <Label htmlFor="layout_template">Layout Template</Label>
              <Input
                id="layout_template"
                value={layoutTemplate}
                onChange={(e) => setLayoutTemplate(e.target.value)}
                placeholder="standard"
              />
            </div>
          </div>

          {/* Presentation Options */}
          <div className="mt-4">
            <Label>Presentation Options</Label>
            <div className="mt-2">
              <FormControlLabel
                control={
                  <Switch
                    checked={randomizeOrder}
                    onChange={(e) => setRandomizeOrder(e.target.checked)}
                  />
                }
                label="Randomize post order"
              />
              <p className="text-sm text-gray-500 ml-8">
                When enabled, submissions will be shuffled once when the presentation loads. The order remains consistent during the session and re-shuffles on each new page load.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Media Upload Options */}
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={allowVideoUploads}
                  onChange={(e) => setAllowVideoUploads(e.target.checked)}
                />
              }
              label="Allow video uploads on submission form"
            />
            <p className="text-sm text-gray-500 ml-8">
              When enabled, users can upload both photos and videos. When disabled, only photos are allowed.
            </p>
          </div>

          {allowVideoUploads && (
            <div className="ml-8 space-y-4">
              <div>
                <Label htmlFor="max_video_duration">Max video length (seconds)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    id="max_video_duration"
                    type="number"
                    min={1}
                    max={60}
                    value={maxVideoDuration}
                    onChange={(e) => setMaxVideoDuration(parseInt(e.target.value) || 12)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">{maxVideoDuration}s</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum allowed video duration. Videos longer than this will be rejected. (1-60 seconds)
                </p>
              </div>

              <div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowVideoFinish}
                      onChange={(e) => setAllowVideoFinish(e.target.checked)}
                    />
                  }
                  label="Allow videos to finish before transition"
                />
                <p className="text-sm text-gray-500 ml-8">
                  When enabled, if a video is longer than the transition duration, the slide will remain visible until the video finishes playing. When disabled, videos will loop or be cut off at the transition time.
                </p>
              </div>
            </div>
          )}

          {/* Require Email */}
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={requireEmail}
                  onChange={(e) => setRequireEmail(e.target.checked)}
                />
              }
              label="Require email address"
            />
            <p className="text-sm text-gray-500 ml-8">
              When enabled, users must provide their email address when submitting. Email addresses are collected but not displayed publicly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Archive/Delete Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                {project.status === 'archived' ? 'Reactivate Project' : 'Archive Project'}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {project.status === 'archived'
                  ? 'Make this project active again and accessible to the public.'
                  : 'Hide this project from public access. You can reactivate it later.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                project.status === 'archived'
                  ? setShowReactivateDialog(true)
                  : setShowArchiveDialog(true)
              }
              disabled={isSubmitting || isUploadingBackground}
              className={project.status === 'archived' ? 'border-blue-500 text-blue-600' : 'border-orange-500 text-orange-600'}
            >
              {project.status === 'archived' ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Reactivate
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Delete Project Permanently</h4>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. All submissions and media will be permanently deleted.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting || isUploadingBackground}
              className="border-red-500 text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Forever
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploadingBackground}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingBackground}>
          {isUploadingBackground ? (
            <>
              <CircularProgress size={20} className="mr-2" />
              Uploading Background...
            </>
          ) : isSubmitting ? (
            'Updating...'
          ) : (
            'Update Project'
          )}
        </Button>
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive "{project.name}"? The project will be hidden from
              public access, but you can reactivate it at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isArchiving ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Archiving...
                </>
              ) : (
                'Archive Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Confirmation Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate "{project.name}"? The project will be accessible
              to the public again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReactivateDialog(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReactivate}
              disabled={isArchiving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isArchiving ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Reactivating...
                </>
              ) : (
                'Reactivate Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project Permanently</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project, all
              submissions, and all associated media files.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-confirmation">
              Type <strong>{project.name}</strong> to confirm deletion
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={project.name}
              className="mt-2"
              disabled={isDeleting}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePermanentDelete}
              disabled={isDeleting || deleteConfirmation !== project.name}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Forever'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
