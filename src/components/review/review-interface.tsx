'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { Search, Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { SubmissionCard } from './submission-card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { useSnackbar } from '@/components/providers/snackbar-provider';
import type { Database } from '@/types/database.types';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

type Submission = Database['public']['Tables']['submissions']['Row'];
type SubmissionStatus = 'pending' | 'approved' | 'declined' | 'deleted' | 'archived';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface ReviewInterfaceProps {
  projectId: string;
  projectSlug: string;
}

export function ReviewInterface({ projectId, projectSlug }: ReviewInterfaceProps) {
  const { success: showSuccess } = useSnackbar();
  const previousPendingCount = useRef<number>(0);
  const activeTabRef = useRef<SubmissionStatus>('pending');

  const [activeTab, setActiveTab] = useState<SubmissionStatus>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
    archived: 0,
    deleted: 0,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStatuses, setExportStatuses] = useState<{
    pending: boolean;
    approved: boolean;
    declined: boolean;
    archived: boolean;
    deleted: boolean;
  }>({
    pending: true,
    approved: true,
    declined: false,
    archived: false,
    deleted: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Export comments to Excel
  const handleExportComments = async () => {
    setIsExporting(true);
    try {
      const selectedStatuses = Object.entries(exportStatuses)
        .filter(([_, selected]) => selected)
        .map(([status, _]) => status as SubmissionStatus);

      if (selectedStatuses.length === 0) {
        showSuccess('Please select at least one submission type');
        setIsExporting(false);
        return;
      }

      // Fetch submissions for selected statuses
      const allSubmissions: Submission[] = [];
      for (const status of selectedStatuses) {
        const response = await fetch(`/api/submissions?projectId=${projectId}&status=${status}`);
        if (response.ok) {
          const data = await response.json();
          allSubmissions.push(...(data.submissions || []));
        }
      }

      if (allSubmissions.length === 0) {
        showSuccess('No submissions found for the selected types');
        setIsExporting(false);
        setIsExportDialogOpen(false);
        return;
      }

      // Prepare data for Excel
      const exportData = allSubmissions.map(submission => ({
        'Full Name': submission.full_name,
        'Date Posted': new Date(submission.created_at).toLocaleString(),
        'Date Approved': submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString() : '',
        'Social Handle': submission.social_handle || '',
        'Comment': submission.comment,
        'Email': submission.email || '',
        'Status': submission.status,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Full Name
        { wch: 20 }, // Date Posted
        { wch: 20 }, // Date Approved
        { wch: 15 }, // Social Handle
        { wch: 50 }, // Comment
        { wch: 25 }, // Email
        { wch: 12 }, // Status
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

      // Generate and download file
      XLSX.writeFile(wb, `${projectSlug}_comments.xlsx`);

      showSuccess(`Exported ${allSubmissions.length} comment(s) to Excel`);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting comments:', error);
      showSuccess('Failed to export comments');
    } finally {
      setIsExporting(false);
    }
  };

  // Download all images as ZIP
  const handleDownloadAllImages = async () => {
    setIsDownloading(true);
    try {
      // Fetch all submissions for this project (all statuses)
      const allSubmissions: Submission[] = [];
      const statuses: SubmissionStatus[] = ['pending', 'approved', 'declined', 'archived', 'deleted'];

      for (const status of statuses) {
        const response = await fetch(`/api/submissions?projectId=${projectId}&status=${status}`);
        if (response.ok) {
          const data = await response.json();
          allSubmissions.push(...(data.submissions || []));
        }
      }

      // Filter submissions that have media
      const submissionsWithMedia = allSubmissions.filter(s => s.photo_url || s.video_url);

      if (submissionsWithMedia.length === 0) {
        showSuccess('No images or videos found to download');
        setIsDownloading(false);
        return;
      }

      // Create ZIP file
      const zip = new JSZip();
      const folder = zip.folder(projectSlug);

      // Download and add each media file to ZIP
      for (const submission of submissionsWithMedia) {
        const mediaUrl = submission.photo_url || submission.video_url;
        if (!mediaUrl) continue;

        try {
          const response = await fetch(mediaUrl);
          const blob = await response.blob();
          const extension = submission.photo_url ? 'jpg' : 'mp4';
          const filename = `${submission.full_name.replace(/\s+/g, '_')}_${submission.id.substring(0, 8)}.${extension}`;
          folder?.file(filename, blob);
        } catch (err) {
          console.error(`Failed to download media for ${submission.full_name}:`, err);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectSlug}_media.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`Downloaded ${submissionsWithMedia.length} media file(s)`);
    } catch (error) {
      console.error('Error downloading images:', error);
      showSuccess('Failed to download media files');
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch tab counts
  const fetchTabCounts = async (showNotification = false) => {
    try {
      const response = await fetch(`/api/submissions/counts?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tab counts');
      }

      const data = await response.json();
      const newPendingCount = data.counts.pending;

      // Show notification if there are new pending submissions
      if (showNotification && previousPendingCount.current > 0 && newPendingCount > previousPendingCount.current) {
        const newCount = newPendingCount - previousPendingCount.current;
        showSuccess(`${newCount} new pending submission${newCount > 1 ? 's' : ''} received`);

        // Refresh pending tab if it's active (use ref to get current value)
        if (activeTabRef.current === 'pending') {
          fetchSubmissions('pending');
        }
      }

      previousPendingCount.current = newPendingCount;
      setTabCounts(data.counts);
    } catch (err) {
      console.error('Error fetching tab counts:', err);
    }
  };

  // Fetch submissions for the active tab
  const fetchSubmissions = async (status: SubmissionStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions?projectId=${projectId}&status=${status}`);

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch submissions and counts when tab changes
  useEffect(() => {
    activeTabRef.current = activeTab; // Keep ref in sync
    fetchSubmissions(activeTab);
    fetchTabCounts();
  }, [activeTab, projectId]);

  // Poll for new pending submissions every 12 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchTabCounts(true); // Pass true to enable notifications
    }, 12000); // 12 seconds

    return () => clearInterval(pollInterval);
  }, [projectId]);

  // Handle status change for a submission
  const handleStatusChange = async (submissionId: string, newStatus: SubmissionStatus) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission');
      }

      // Remove the submission from current view (it moved to another tab)
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));

      // Refresh tab counts
      fetchTabCounts();
    } catch (err) {
      console.error('Error updating submission:', err);
      setError('Failed to update submission. Please try again.');
    }
  };

  // Handle inline updates (display_mode, custom_timing)
  const handleInlineUpdate = async (
    submissionId: string,
    updates: { display_mode?: 'once' | 'repeat'; custom_timing?: number | null }
  ) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission');
      }

      const updatedSubmission = await response.json();

      // Update the submission in state
      setSubmissions(prev =>
        prev.map(s => (s.id === submissionId ? updatedSubmission.submission : s))
      );
    } catch (err) {
      console.error('Error updating submission:', err);
      setError('Failed to update submission. Please try again.');
    }
  };

  // Handle permanent deletion
  const handleDelete = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      // Remove from state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));

      // Refresh tab counts
      fetchTabCounts();

      showSuccess('Submission permanently deleted');
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError('Failed to delete submission. Please try again.');
    }
  };

  // Helper function to check if a date is within the filter range
  const isDateInRange = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    switch (dateFilter) {
      case 'all':
        return true;

      case 'today': {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return date >= today;
      }

      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }

      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      }

      case 'custom': {
        if (!customStartDate && !customEndDate) return true;

        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          return date >= start && date <= end;
        }

        if (customStartDate) {
          const start = new Date(customStartDate);
          return date >= start;
        }

        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return date <= end;
        }

        return true;
      }

      default:
        return true;
    }
  };

  // Filter submissions based on search query and date range
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((submission) => {
        const nameMatch = submission.full_name?.toLowerCase().includes(query);
        const handleMatch = submission.social_handle?.toLowerCase().includes(query);
        const commentMatch = submission.comment?.toLowerCase().includes(query);
        return nameMatch || handleMatch || commentMatch;
      });
    }

    // Apply date filter
    filtered = filtered.filter((submission) =>
      isDateInRange(submission.created_at)
    );

    return filtered;
  }, [submissions, searchQuery, dateFilter, customStartDate, customEndDate]);

  return (
    <div>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
          <TextField
            fullWidth
            placeholder="Search by name, handle, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-5 w-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        {/* Date Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: 1, sm: 'initial' } }}>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <Calendar className="h-4 w-4 text-gray-400" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        {/* Download All Media Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download size={16} />}
          onClick={handleDownloadAllImages}
          disabled={isDownloading}
          sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
        >
          {isDownloading ? 'Downloading...' : 'Download All Media'}
        </Button>

        {/* Export Comments Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileSpreadsheet size={16} />}
          onClick={() => setIsExportDialogOpen(true)}
          sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
        >
          Export Comments
        </Button>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <>
            <TextField
              type="date"
              size="small"
              label="Start Date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: 1, sm: 'initial' } }}
            />
            <TextField
              type="date"
              size="small"
              label="End Date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: 1, sm: 'initial' } }}
            />
          </>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue as SubmissionStatus)}
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                badgeContent={tabCounts.pending}
                color="primary"
                sx={{ '& .MuiBadge-badge': { right: -10 } }}
              >
                Pending
              </Badge>
            }
            value="pending"
          />
          <Tab
            label={
              <Badge
                badgeContent={tabCounts.approved}
                color="success"
                sx={{ '& .MuiBadge-badge': { right: -10 } }}
              >
                Approved
              </Badge>
            }
            value="approved"
          />
          <Tab
            label={
              <Badge
                badgeContent={tabCounts.declined}
                color="error"
                sx={{ '& .MuiBadge-badge': { right: -10 } }}
              >
                Declined
              </Badge>
            }
            value="declined"
          />
          <Tab
            label={
              <Badge
                badgeContent={tabCounts.archived}
                color="default"
                sx={{ '& .MuiBadge-badge': { right: -10 } }}
              >
                Archived
              </Badge>
            }
            value="archived"
          />
          <Tab
            label={
              <Badge
                badgeContent={tabCounts.deleted}
                color="default"
                sx={{ '& .MuiBadge-badge': { right: -10 } }}
              >
                Deleted
              </Badge>
            }
            value="deleted"
          />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : submissions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {activeTab} submissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'pending' && 'New submissions will appear here for review.'}
            {activeTab === 'approved' && 'Approved submissions will appear here.'}
            {activeTab === 'declined' && 'Declined submissions will appear here.'}
            {activeTab === 'archived' && 'Archived submissions will appear here.'}
            {activeTab === 'deleted' && 'Deleted submissions will appear here.'}
          </Typography>
        </Box>
      ) : filteredSubmissions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No matches found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search query
          </Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onStatusChange={handleStatusChange}
              onInlineUpdate={handleInlineUpdate}
              onDelete={handleDelete}
              currentTab={activeTab}
            />
          ))}
        </div>
      )}

      {/* Export Dialog */}
      <Dialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Comments</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select which submission types to include in the export:
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportStatuses.pending}
                  onChange={(e) => setExportStatuses({ ...exportStatuses, pending: e.target.checked })}
                />
              }
              label="Pending"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportStatuses.approved}
                  onChange={(e) => setExportStatuses({ ...exportStatuses, approved: e.target.checked })}
                />
              }
              label="Approved"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportStatuses.declined}
                  onChange={(e) => setExportStatuses({ ...exportStatuses, declined: e.target.checked })}
                />
              }
              label="Declined"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportStatuses.archived}
                  onChange={(e) => setExportStatuses({ ...exportStatuses, archived: e.target.checked })}
                />
              }
              label="Archived"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportStatuses.deleted}
                  onChange={(e) => setExportStatuses({ ...exportStatuses, deleted: e.target.checked })}
                />
              }
              label="Deleted"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExportDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExportComments}
            variant="contained"
            disabled={isExporting}
            startIcon={<FileSpreadsheet size={16} />}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
