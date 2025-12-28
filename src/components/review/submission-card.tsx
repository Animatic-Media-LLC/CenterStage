'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import {
  Check,
  X,
  Archive,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
  Video as VideoIcon,
  User,
  MessageSquare,
  Clock,
  Download,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];
type SubmissionStatus = 'pending' | 'approved' | 'declined' | 'deleted' | 'archived';

interface SubmissionCardProps {
  submission: Submission;
  onStatusChange: (id: string, status: SubmissionStatus) => Promise<void>;
  onInlineUpdate: (id: string, updates: { display_mode?: 'once' | 'repeat'; custom_timing?: number | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentTab: SubmissionStatus;
}

export function SubmissionCard({
  submission,
  onStatusChange,
  onInlineUpdate,
  onDelete,
  currentTab,
}: SubmissionCardProps) {
  const [displayMode, setDisplayMode] = useState<'once' | 'repeat'>(submission.display_mode);
  const [customTiming, setCustomTiming] = useState<number | null>(submission.custom_timing);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');
  const timingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle display mode change
  const handleDisplayModeChange = async (newMode: 'once' | 'repeat') => {
    setDisplayMode(newMode);
    setIsUpdating(true);
    try {
      await onInlineUpdate(submission.id, { display_mode: newMode });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle custom timing change with debouncing
  const handleCustomTimingChange = (value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    if (numValue !== null && (isNaN(numValue) || numValue < 1 || numValue > 30)) {
      return; // Invalid value
    }

    // Update local state immediately for responsive UI
    setCustomTiming(numValue);

    // Clear existing timeout
    if (timingDebounceRef.current) {
      clearTimeout(timingDebounceRef.current);
    }

    // Set new timeout to update via API after 500ms
    timingDebounceRef.current = setTimeout(async () => {
      setIsUpdating(true);
      try {
        await onInlineUpdate(submission.id, { custom_timing: numValue });
      } finally {
        setIsUpdating(false);
      }
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timingDebounceRef.current) {
        clearTimeout(timingDebounceRef.current);
      }
    };
  }, []);

  // Handle media download
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (type: 'soft' | 'permanent') => {
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    if (deleteType === 'soft') {
      await onStatusChange(submission.id, 'deleted');
    } else {
      await onDelete(submission.id);
    }
  };

  const hasMedia = submission.photo_url || submission.video_url;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Media Preview */}
          {hasMedia && (
            <div className="flex-shrink-0 w-full sm:w-auto">
              {submission.photo_url && (
                <div className="relative w-full sm:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={submission.photo_url}
                    alt="Submission"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <Chip
                      icon={<ImageIcon size={14} />}
                      label="Photo"
                      size="small"
                      sx={{ bgcolor: 'white' }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(submission.photo_url!, `${submission.full_name.replace(/\s+/g, '_')}_photo.jpg`)}
                      sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e5e7eb' } }}
                      aria-label="Download photo"
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </div>
              )}
              {submission.video_url && (
                <div className="relative w-full sm:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={submission.video_url}
                    className="w-full h-full object-cover"
                    controls
                    aria-label={`Video submission from ${submission.full_name}`}
                  />
                  <div className="absolute top-2 left-2">
                    <Chip
                      icon={<VideoIcon size={14} />}
                      label="Video"
                      size="small"
                      sx={{ bgcolor: 'white' }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(submission.video_url!, `${submission.full_name.replace(/\s+/g, '_')}_video.mp4`)}
                      sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e5e7eb' } }}
                      aria-label="Download video"
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-gray-400" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {submission.full_name}
                  </Typography>
                  {submission.social_handle && (
                    <Typography variant="body2" color="text.secondary">
                      {submission.social_handle}
                    </Typography>
                  )}
                </div>
                {submission.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail size={14} className="text-gray-400" />
                    <span>{submission.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Status Badge */}
              <Chip
                label={submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                color={
                  submission.status === 'approved' ? 'success' :
                  submission.status === 'pending' ? 'warning' :
                  submission.status === 'declined' ? 'error' :
                  'default'
                }
                size="small"
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                <Typography variant="body1">
                  {submission.comment}
                </Typography>
              </div>
            </div>

            {/* Inline Editing for Approved Submissions */}
            {currentTab === 'approved' && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                  Display Settings
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="display-mode-label">Display Mode</InputLabel>
                    <Select
                      labelId="display-mode-label"
                      value={displayMode}
                      onChange={(e) => handleDisplayModeChange(e.target.value as 'once' | 'repeat')}
                      disabled={isUpdating}
                      label="Display Mode"
                    >
                      <MenuItem value="once">Show Once</MenuItem>
                      <MenuItem value="repeat">Repeat</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    type="number"
                    label="Custom Timing (seconds)"
                    value={customTiming || ''}
                    onChange={(e) => handleCustomTimingChange(e.target.value)}
                    placeholder="Default"
                    disabled={isUpdating}
                    size="small"
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        max: 30
                      }
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {currentTab === 'pending' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                    sx={{
                      color: 'success.main',
                      borderColor: 'success.main',
                      '&:hover': {
                        backgroundColor: 'success.lighter',
                        borderColor: 'success.dark'
                      }
                    }}
                    startIcon={<Check size={16} />}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'declined')}
                    sx={{
                      color: 'warning.main',
                      borderColor: 'warning.main',
                      '&:hover': {
                        backgroundColor: 'warning.lighter',
                        borderColor: 'warning.dark'
                      }
                    }}
                    startIcon={<X size={16} />}
                  >
                    Decline
                  </Button>
                </>
              )}

              {currentTab === 'approved' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                    startIcon={<RotateCcw size={16} />}
                  >
                    Move to Pending
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'archived')}
                    startIcon={<Archive size={16} />}
                  >
                    Archive
                  </Button>
                </>
              )}

              {currentTab === 'declined' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                    sx={{
                      color: 'success.main',
                      borderColor: 'success.main',
                      '&:hover': {
                        backgroundColor: 'success.lighter',
                        borderColor: 'success.dark'
                      }
                    }}
                    startIcon={<Check size={16} />}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                    startIcon={<RotateCcw size={16} />}
                  >
                    Move to Pending
                  </Button>
                </>
              )}

              {currentTab === 'archived' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                    startIcon={<RotateCcw size={16} />}
                  >
                    Restore to Approved
                  </Button>
                </>
              )}

              {currentTab === 'deleted' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                    startIcon={<RotateCcw size={16} />}
                  >
                    Restore to Pending
                  </Button>
                </>
              )}

              {/* Delete button (soft delete - moves to deleted tab) */}
              {currentTab !== 'deleted' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDeleteClick('soft')}
                  sx={{
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.lighter',
                      borderColor: 'error.dark'
                    }
                  }}
                  startIcon={<Trash2 size={16} />}
                >
                  Delete
                </Button>
              )}

              {/* Permanent delete (only in deleted tab) */}
              {currentTab === 'deleted' && (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteClick('permanent')}
                  startIcon={<Trash2 size={16} />}
                >
                  Delete Permanently
                </Button>
              )}
            </Box>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
        >
          <DialogTitle>
            {deleteType === 'permanent' ? 'Permanently Delete Submission?' : 'Delete Submission?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {deleteType === 'permanent'
                ? 'This action cannot be undone. The submission will be permanently removed from the database.'
                : 'This will move the submission to the Deleted tab. You can restore it later if needed.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              {deleteType === 'permanent' ? 'Delete Permanently' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
