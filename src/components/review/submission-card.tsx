'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
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
  Clock
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

  // Handle custom timing change
  const handleCustomTimingChange = async (value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    if (numValue !== null && (isNaN(numValue) || numValue < 1 || numValue > 30)) {
      return; // Invalid value
    }
    setCustomTiming(numValue);
    setIsUpdating(true);
    try {
      await onInlineUpdate(submission.id, { custom_timing: numValue });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasMedia = submission.photo_url || submission.video_url;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Media Preview */}
          {hasMedia && (
            <div className="flex-shrink-0">
              {submission.photo_url && (
                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={submission.photo_url}
                    alt="Submission"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Chip
                      icon={<ImageIcon size={14} />}
                      label="Photo"
                      size="small"
                      sx={{ bgcolor: 'white' }}
                    />
                  </div>
                </div>
              )}
              {submission.video_url && (
                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={submission.video_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <div className="absolute top-2 left-2">
                    <Chip
                      icon={<VideoIcon size={14} />}
                      label="Video"
                      size="small"
                      sx={{ bgcolor: 'white' }}
                    />
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
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <Typography variant="caption" fontWeight="bold" className="block mb-2">
                  Display Settings
                </Typography>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Display Mode</label>
                    <Select
                      value={displayMode}
                      onValueChange={(value) => handleDisplayModeChange(value as 'once' | 'repeat')}
                      disabled={isUpdating}
                    >
                      <SelectItem value="once">Show Once</SelectItem>
                      <SelectItem value="repeat">Repeat</SelectItem>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Custom Timing (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={customTiming || ''}
                      onChange={(e) => handleCustomTimingChange(e.target.value)}
                      placeholder="Default"
                      disabled={isUpdating}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {currentTab === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'declined')}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <X size={16} className="mr-1" />
                    Decline
                  </Button>
                </>
              )}

              {currentTab === 'approved' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                  >
                    <RotateCcw size={16} className="mr-1" />
                    Move to Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'archived')}
                  >
                    <Archive size={16} className="mr-1" />
                    Archive
                  </Button>
                </>
              )}

              {currentTab === 'declined' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                  >
                    <RotateCcw size={16} className="mr-1" />
                    Move to Pending
                  </Button>
                </>
              )}

              {currentTab === 'archived' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'approved')}
                  >
                    <RotateCcw size={16} className="mr-1" />
                    Restore to Approved
                  </Button>
                </>
              )}

              {currentTab === 'deleted' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(submission.id, 'pending')}
                  >
                    <RotateCcw size={16} className="mr-1" />
                    Restore to Pending
                  </Button>
                </>
              )}

              {/* Delete button (soft delete - moves to deleted tab) */}
              {currentTab !== 'deleted' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(submission.id, 'deleted')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              )}

              {/* Permanent delete (only in deleted tab) */}
              {currentTab === 'deleted' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(submission.id)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete Permanently
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
