'use client';

import { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SubmissionCard } from './submission-card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];
type SubmissionStatus = 'pending' | 'approved' | 'declined' | 'deleted' | 'archived';

interface ReviewInterfaceProps {
  projectId: string;
  projectSlug: string;
}

export function ReviewInterface({ projectId, projectSlug }: ReviewInterfaceProps) {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((submission) => (
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
