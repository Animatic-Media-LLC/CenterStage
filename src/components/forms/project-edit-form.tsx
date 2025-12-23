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
import { CloudUpload } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    client_name: string;
    slug: string;
  };
  presentationConfig: {
    font_family: string;
    font_size: number;
    text_color: string;
    outline_color: string;
    background_color: string;
    background_image_url: string | null;
    transition_duration: number;
    animation_style: string;
    layout_template: string;
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
  const [transitionDuration, setTransitionDuration] = useState(presentationConfig?.transition_duration || 5);
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'zoom'>(
    (presentationConfig?.animation_style as 'fade' | 'slide' | 'zoom') || 'fade'
  );
  const [layoutTemplate, setLayoutTemplate] = useState(presentationConfig?.layout_template || 'standard');

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
        transition_duration: transitionDuration,
        animation_style: animationStyle,
        layout_template: layoutTemplate,
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
    </form>
  );
}
