'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useSnackbar } from '@/components/providers/snackbar-provider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
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
        transition_duration: transitionDuration,
        animation_style: animationStyle,
        layout_template: layoutTemplate,
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
      router.push(`/admin/projects/${result.project.slug}/edit`);
    } catch (error) {
      console.error('Create project error:', error);
      showError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                placeholder="e.g., Summer Campaign 2024"
                error={!!errors.name}
              />
              {errors.name && (
                <FormHelperText error>{errors.name}</FormHelperText>
              )}
            </Box>

            <Box>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                error={!!errors.client_name}
              />
              {errors.client_name && (
                <FormHelperText error>{errors.client_name}</FormHelperText>
              )}
            </Box>

            <Box>
              <Label htmlFor="slug">
                Slug
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (URL-friendly identifier)
                </Typography>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g., summer-campaign-2024"
                error={!!errors.slug}
              />
              {errors.slug && (
                <FormHelperText error>{errors.slug}</FormHelperText>
              )}
              {slug && isValidSlug(slug) && !errors.slug && (
                <FormHelperText>
                  Preview URL: /submit/{slug}
                </FormHelperText>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Presentation Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Presentation Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}>
            <Box>
              <Label htmlFor="font_family">Font Family</Label>
              <Select
                value={fontFamily}
                onValueChange={(value) => setFontFamily(value as FontFamily)}
              >
                <SelectTrigger id="font_family">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>

            <Box>
              <Label htmlFor="font_size">Font Size: {fontSize}px</Label>
              <Box sx={{ mt: 2 }}>
                <Slider
                  id="font_size"
                  min={16}
                  max={72}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="text_color">Text Color</Label>
              <Box sx={{ mt: 2 }}>
                <ColorPicker
                  value={textColor}
                  onChange={setTextColor}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="outline_color">Outline Color</Label>
              <Box sx={{ mt: 2 }}>
                <ColorPicker
                  value={outlineColor}
                  onChange={setOutlineColor}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="background_color">Background Color</Label>
              <Box sx={{ mt: 2 }}>
                <ColorPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="transition_duration">Transition Duration: {transitionDuration}s</Label>
              <Box sx={{ mt: 2 }}>
                <Slider
                  id="transition_duration"
                  min={1}
                  max={30}
                  step={1}
                  value={[transitionDuration]}
                  onValueChange={(value) => setTransitionDuration(value[0])}
                />
              </Box>
            </Box>

            <Box>
              <Label htmlFor="animation_style">Animation Style</Label>
              <Select
                value={animationStyle}
                onValueChange={(value) =>
                  setAnimationStyle(value as 'fade' | 'slide' | 'zoom')
                }
              >
                <SelectTrigger id="animation_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </Box>

            <Box>
              <Label htmlFor="layout_template">Layout Template</Label>
              <Input
                id="layout_template"
                value={layoutTemplate}
                onChange={(e) => setLayoutTemplate(e.target.value)}
                placeholder="standard"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </Box>
    </Box>
  );
}
