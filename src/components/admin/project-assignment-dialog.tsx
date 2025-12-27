'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectAssignmentDialogProps {
  open: boolean;
  user: User | null;
  currentUserId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface ProjectWithAssignment extends Project {
  isAssigned: boolean;
}

export default function ProjectAssignmentDialog({
  open,
  user,
  currentUserId,
  onClose,
  onSuccess,
  onError,
}: ProjectAssignmentDialogProps) {
  const [projects, setProjects] = useState<ProjectWithAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load projects and assignments when dialog opens
  useEffect(() => {
    if (open && user) {
      loadProjectsAndAssignments();
    }
  }, [open, user]);

  const loadProjectsAndAssignments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all projects
      const projectsResponse = await fetch('/api/projects');
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const allProjects: Project[] = await projectsResponse.json();

      // Fetch user's current assignments
      const assignmentsResponse = await fetch(`/api/users/${user.id}/projects`);
      if (!assignmentsResponse.ok) throw new Error('Failed to fetch assignments');
      const assignments: { project_id: string }[] = await assignmentsResponse.json();

      const assignedProjectIds = new Set(assignments.map(a => a.project_id));

      // Merge projects with assignment status
      const projectsWithAssignment: ProjectWithAssignment[] = allProjects.map(project => ({
        ...project,
        isAssigned: assignedProjectIds.has(project.id),
      }));

      setProjects(projectsWithAssignment);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to load projects');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = (projectId: string) => {
    setProjects(
      projects.map(p =>
        p.id === projectId ? { ...p, isAssigned: !p.isAssigned } : p
      )
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Determine which assignments to add/remove
      const currentAssignments = projects.filter(p => p.isAssigned).map(p => p.id);

      // Send updated assignments
      const response = await fetch(`/api/users/${user.id}/projects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: currentAssignments,
          assignedBy: currentUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update assignments');
      }

      onSuccess('Project assignments updated successfully');
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Project Assignments - {user.name}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Select which projects {user.name} can access. Super admins always have access to all
              projects.
            </Typography>

            {user.role === 'super_admin' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This user is a Super Admin and has automatic access to all projects. Assignments are
                not required.
              </Alert>
            )}

            {projects.length === 0 ? (
              <Alert severity="warning">
                No projects found. Create some projects first before assigning them to users.
              </Alert>
            ) : (
              <FormGroup>
                {projects.map(project => (
                  <FormControlLabel
                    key={project.id}
                    control={
                      <Checkbox
                        checked={project.isAssigned}
                        onChange={() => handleToggleAssignment(project.id)}
                        disabled={user.role === 'super_admin'}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.client_name} • /{project.slug}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving || user.role === 'super_admin'}
        >
          {saving ? 'Saving...' : 'Save Assignments'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
