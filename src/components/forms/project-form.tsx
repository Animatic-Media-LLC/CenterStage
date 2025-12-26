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
  createProjectSchema,
  presentationConfigSchema,
  type CreateProjectInput,
  type PresentationConfigInput,
} from '@/lib/validations/project';
import { slugify, isValidSlug } from '@/lib/utils/slugify';
import { AVAILABLE_FONTS, DEFAULT_FONT_FAMILY, type FontFamily } from '@/lib/constants/fonts';
import { FontPreview } from '@/components/ui/font-preview';
import { uploadBackgroundImage } from '@/lib/utils/file-upload';
import { CloudUpload } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface ProjectFormProps {
  existingSlugs: string[];
}

export function ProjectForm({ existingSlugs }: ProjectFormProps) {
  const router = useRouter();
  const { success, error: showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  // Presentation config state
  const [fontFamily, setFontFamily] = useState<FontFamily>(DEFAULT_FONT_FAMILY);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#15598a');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#e0ecf6');
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [allowVideoUploads, setAllowVideoUploads] = useState(true);
  const [transitionDuration, setTransitionDuration] = useState(5);
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [layoutTemplate, setLayoutTemplate] = useState('standard');

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      let backgroundImageUrl = '';

      // Upload background image if one was selected
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
      const projectData: CreateProjectInput = {
        name: projectName,
        client_name: clientName,
        slug: slug,
      };

      // Prepare presentation config data
      const presentationConfig: PresentationConfigInput = {
        font_family: fontFamily,
        font_size: fontSize,
        text_color: textColor,
        outline_color: outlineColor,
        background_color: backgroundColor,
        background_image_url: backgroundImageUrl,
        allow_video_uploads: allowVideoUploads,
        max_video_duration: 12,
        allow_video_finish: false,
        transition_duration: transitionDuration,
        animation_style: animationStyle,
        layout_template: layoutTemplate,
        randomize_order: false,
        require_email: false,
      };

      // Validate project data
      const projectValidation = createProjectSchema.safeParse(projectData);
      if (!projectValidation.success) {
        const fieldErrors: Record<string, string> = {};
        projectValidation.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Validate presentation config
      const configValidation = presentationConfigSchema.safeParse(presentationConfig);
      if (!configValidation.success) {
        const fieldErrors: Record<string, string> = {};
        configValidation.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: projectData,
          presentationConfig: presentationConfig,
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
          showError(errorData.error || 'Failed to create project');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      success('Project created successfully!');
      router.push(`/admin/projects/${result.project.id}`);
    } catch (error) {
      console.error('Create project error:', error);
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

            {backgroundImagePreview ? (
              <div className="space-y-2">
                <img
                  src={backgroundImagePreview}
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
                onClick={() => document.getElementById('background-image-input')?.click()}
              >
                <input
                  id="background-image-input"
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

          {/* Media Upload Options */}
          <div className="mt-4">
            <Label>Media Upload Options</Label>
            <div className="mt-2">
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
            'Creating...'
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </form>
  );
}
