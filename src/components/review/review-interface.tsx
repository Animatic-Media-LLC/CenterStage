'use client';

import { useState, useEffect, useMemo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Search, Calendar } from 'lucide-react';
import { SubmissionCard } from './submission-card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];
type SubmissionStatus = 'pending' | 'approved' | 'declined' | 'deleted' | 'archived';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface ReviewInterfaceProps {
  projectId: string;
  projectSlug: string;
}

export function ReviewInterface({ projectId, projectSlug }: ReviewInterfaceProps) {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  // Fetch submissions when tab changes
  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab, projectId]);

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
    if (!confirm('Are you sure you want to permanently delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      // Remove from state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError('Failed to delete submission. Please try again.');
    }
  };

  const getTabCount = (status: SubmissionStatus) => {
    // This could be enhanced with real-time counts from the API
    return submissions.length;
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
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
              sx={{ minWidth: 150 }}
            />
            <TextField
              type="date"
              size="small"
              label="End Date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
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
                badgeContent={activeTab === 'pending' ? submissions.length : 0}
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
                badgeContent={activeTab === 'approved' ? submissions.length : 0}
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
                badgeContent={activeTab === 'declined' ? submissions.length : 0}
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
                badgeContent={activeTab === 'archived' ? submissions.length : 0}
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
                badgeContent={activeTab === 'deleted' ? submissions.length : 0}
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
    </div>
  );
}
