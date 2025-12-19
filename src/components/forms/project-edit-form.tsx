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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateProjectSchema,
  presentationConfigSchema,
  type UpdateProjectInput,
  type PresentationConfigInput,
} from '@/lib/validations/project';
import { Archive, Trash2 } from 'lucide-react';
import { AVAILABLE_FONTS, DEFAULT_FONT_FAMILY, type FontFamily } from '@/lib/constants/fonts';

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    client_name: string;
    slug: string;
    status: string;
  };
  presentationConfig: {
    font_family: string;
    font_size: number;
    text_color: string;
    outline_color: string;
    background_color: string;
    transition_duration: number;
    animation_style: 'fade' | 'slide' | 'zoom';
    layout_template: string;
  } | null;
  existingSlugs: string[];
}

export function ProjectEditForm({
  project,
  presentationConfig,
  existingSlugs,
}: ProjectEditFormProps) {
  const router = useRouter();
  const { success, error: showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [projectName, setProjectName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name);
  const [slug, setSlug] = useState(project.slug);

  // Presentation config state
  const [fontFamily, setFontFamily] = useState<FontFamily>(
    (presentationConfig?.font_family as FontFamily) || DEFAULT_FONT_FAMILY
  );
  const [fontSize, setFontSize] = useState(presentationConfig?.font_size || 24);
  const [textColor, setTextColor] = useState(presentationConfig?.text_color || '#FFFFFF');
  const [outlineColor, setOutlineColor] = useState(presentationConfig?.outline_color || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(presentationConfig?.background_color || '#1a1a1a');
  const [transitionDuration, setTransitionDuration] = useState(presentationConfig?.transition_duration || 5);
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'zoom'>(
    presentationConfig?.animation_style || 'fade'
  );
  const [layoutTemplate, setLayoutTemplate] = useState(presentationConfig?.layout_template || 'standard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Prepare project data
      const projectData: UpdateProjectInput = {
        name: projectName,
        client_name: clientName,
      };

      // Only include slug if it changed (and warn user)
      if (slug !== project.slug) {
        projectData.slug = slug;
      }

      // Prepare presentation config data
      const presentationConfigData: PresentationConfigInput = {
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
      const projectValidation = updateProjectSchema.safeParse(projectData);
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
      const configValidation = presentationConfigSchema.safeParse(presentationConfigData);
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

      success('Project updated successfully!');
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Update project error:', error);
      showError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to archive project');
        return;
      }

      success('Project archived successfully!');
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Archive project error:', error);
      showError('An unexpected error occurred');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete project');
        return;
      }

      success('Project deleted successfully!');
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Delete project error:', error);
      showError('An unexpected error occurred');
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
                onChange={(e) => setProjectName(e.target.value)}
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
                  (Changing this will break existing URLs)
                </Typography>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                placeholder="e.g., summer-campaign-2024"
                error={!!errors.slug}
              />
              {errors.slug && (
                <FormHelperText error>{errors.slug}</FormHelperText>
              )}
              {slug !== project.slug && (
                <FormHelperText sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography component="span" fontWeight="medium">Warning:</Typography> Changing the slug will invalidate existing QR codes and URLs
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
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {project.status !== 'archived' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowArchiveDialog(true)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Archive Project?</DialogTitle>
                    <DialogDescription>
                      This will archive the project and prevent new submissions. You can restore it later.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleArchive}>
                      Archive Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the project and all associated data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
