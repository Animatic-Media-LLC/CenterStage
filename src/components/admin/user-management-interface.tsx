'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectWithAssignment extends Project {
  isAssigned: boolean;
}

interface UserManagementInterfaceProps {
  users: User[];
  currentUserId: string;
}

export default function UserManagementInterface({
  users: initialUsers,
  currentUserId,
}: UserManagementInterfaceProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  // Project assignment state for edit dialog
  const [projects, setProjects] = useState<ProjectWithAssignment[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Project assignments for table display
  const [userProjectAssignments, setUserProjectAssignments] = useState<Record<string, any[]>>({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Fetch project assignments for all users on mount
  useEffect(() => {
    const fetchAllUserAssignments = async () => {
      setLoadingAssignments(true);
      try {
        // Fetch all projects first to get project names
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
        const allProjects: Project[] = await projectsResponse.json();

        // Create a map of project IDs to project objects for quick lookup
        const projectMap = new Map(allProjects.map(p => [p.id, p]));

        const assignments: Record<string, any[]> = {};

        // Fetch assignments for each non-super admin user
        for (const user of users) {
          if (user.role !== 'super_admin') {
            try {
              const response = await fetch(`/api/users/${user.id}/projects`);
              if (response.ok) {
                const userAssignments: { project_id: string }[] = await response.json();
                // Map project IDs to full project objects
                assignments[user.id] = userAssignments
                  .map(a => projectMap.get(a.project_id))
                  .filter(Boolean); // Remove any undefined values
              } else {
                assignments[user.id] = [];
              }
            } catch (error) {
              console.error(`Failed to fetch assignments for user ${user.id}:`, error);
              assignments[user.id] = [];
            }
          }
        }

        setUserProjectAssignments(assignments);
      } catch (error) {
        console.error('Failed to fetch project assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAllUserAssignments();
  }, [users]);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const { user, password } = await response.json();
      setUsers([user, ...users]);
      setGeneratedPassword(password);
      setCreateDialogOpen(false);
      setFormData({ email: '', name: '', role: 'admin' });

      setSnackbar({
        open: true,
        message: `User created successfully! Password: ${password}`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create user',
        severity: 'error',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Update user info
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const updatedUser = await response.json();

      // Update password if provided
      if (newPassword.trim()) {
        const passwordResponse = await fetch(`/api/users/${selectedUser.id}/password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        });

        if (!passwordResponse.ok) {
          const error = await passwordResponse.json();
          throw new Error(error.message || 'Failed to update password');
        }

        const { password } = await passwordResponse.json();
        setSnackbar({
          open: true,
          message: `User updated successfully! New password: ${password}`,
          severity: 'success',
        });
      }

      // Update project assignments (only for non-super admins)
      if (formData.role !== 'super_admin') {
        const currentAssignments = projects.filter(p => p.isAssigned).map(p => p.id);
        const assignmentResponse = await fetch(`/api/users/${selectedUser.id}/projects`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectIds: currentAssignments,
            assignedBy: currentUserId,
          }),
        });

        if (!assignmentResponse.ok) {
          const error = await assignmentResponse.json();
          throw new Error(error.message || 'Failed to update project assignments');
        }
      }

      setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setEditDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');

      if (!newPassword.trim()) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update user',
        severity: 'error',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);

      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete user',
        severity: 'error',
      });
    }
  };

  const generateRandomPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
  };

  const loadProjectsAndAssignments = async (userId: string) => {
    setLoadingProjects(true);
    try {
      // Fetch all projects
      const projectsResponse = await fetch('/api/projects');
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const allProjects: Project[] = await projectsResponse.json();

      // Fetch user's current assignments
      const assignmentsResponse = await fetch(`/api/users/${userId}/projects`);
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
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load projects',
        severity: 'error',
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleToggleAssignment = (projectId: string) => {
    setProjects(
      projects.map(p =>
        p.id === projectId ? { ...p, isAssigned: !p.isAssigned } : p
      )
    );
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setNewPassword('');
    setShowCurrentPassword(false);
    setEditDialogOpen(true);
    // Load projects and assignments
    loadProjectsAndAssignments(user.id);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Users</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create User
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Projects</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => {
                  const userProjects = userProjectAssignments[user.id] || [];
                  const visibleProjects = userProjects.slice(0, 2);
                  const remainingCount = userProjects.length - 2;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          color={user.role === 'super_admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {loadingAssignments ? (
                          <CircularProgress size={20} />
                        ) : user.role === 'super_admin' ? (
                          <Typography variant="body2" color="text.secondary">
                            All Projects
                          </Typography>
                        ) : userProjects.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {visibleProjects.map((project: Project) => (
                              <Chip
                                key={project.id}
                                label={project.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {remainingCount > 0 && (
                              <Chip
                                label={`+${remainingCount} more`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No projects assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(user)}
                          title="Edit user"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.id === currentUserId}
                          title={user.id === currentUserId ? "Can't delete yourself" : 'Delete user'}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              A random password will be generated automatically and displayed after creation.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {/* User Information Section */}
            <Typography variant="subtitle1" fontWeight="bold">User Information</Typography>
            <TextField
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>

            {/* Password Management Section */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3 }}>Password Management</Typography>

            {selectedUser?.password_plain && (
              <TextField
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={selectedUser.password_plain}
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            )}

            <TextField
              label="New Password (optional)"
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
              placeholder="Leave blank to keep current password"
              helperText="Leave blank to keep current password, or enter a new one"
            />

            <Button
              variant="outlined"
              onClick={generateRandomPassword}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Generate Random Password
            </Button>

            {/* Project Assignments Section */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3 }}>Project Assignments</Typography>

            {formData.role === 'super_admin' && (
              <Alert severity="info">
                This user is a Super Admin and has automatic access to all projects. Assignments are not required.
              </Alert>
            )}

            {loadingProjects ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <Alert severity="warning">
                No projects found. Create some projects first before assigning them to users.
              </Alert>
            ) : (
              <FormGroup>
                {projects.map(project => (
                  <FormControlLabel
                    key={project.id}
                    sx={{
                      alignItems: 'flex-start',
                      '& .MuiCheckbox-root': {
                        paddingTop: 0
                      }
                    }}
                    control={
                      <Checkbox
                        checked={project.isAssigned}
                        onChange={() => handleToggleAssignment(project.id)}
                        disabled={formData.role === 'super_admin'}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
