'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FolderKanban, Plus, Search, Edit, QrCode, ExternalLink, FileText } from 'lucide-react';
import { CopyUrlButton } from '@/components/admin/copy-url-button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsListProps {
  projects: Project[];
  pendingCounts: Record<string, number>;
}

export function ProjectsList({ projects, pendingCounts }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const query = searchQuery.toLowerCase();
    return projects.filter((project) => {
      const nameMatch = project.name.toLowerCase().includes(query);
      const clientMatch = project.client_name.toLowerCase().includes(query);
      const slugMatch = project.slug.toLowerCase().includes(query);
      return nameMatch || clientMatch || slugMatch;
    });
  }, [projects, searchQuery]);

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
            <Typography variant="h6" fontWeight="600" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Get started by creating your first CenterStage project.
            </Typography>
            <Link href="/admin/projects/new">
              <Button variant="contained" startIcon={<Plus className="h-4 w-4" />}>
                Create Project
              </Button>
            </Link>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Search */}
      <Box sx={{ mb: 3, maxWidth: 480 }}>
        <TextField
          type="search"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search projects"
          fullWidth
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* No results message */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No projects match your search &quot;{searchQuery}&quot;
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        /* Projects Grid */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredProjects.map((project) => (
            <Box key={project.id}>
              <Card sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 130, 174, 0.15)',
                  transform: 'translateY(-4px)',
                  borderColor: 'rgba(0, 130, 174, 0.3)'
                }
              }}>
                <CardContent sx={{
                  background: 'rgba(0, 130, 174, 0.03)',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  pb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {project.client_name}
                      </Typography>
                    </Box>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                        ...(project.status === 'active' && {
                          bgcolor: 'rgba(16, 185, 129, 0.15)',
                          color: 'rgb(5, 150, 105)',
                          border: '1.5px solid rgba(16, 185, 129, 0.3)'
                        }),
                        ...(project.status === 'archived' && {
                          bgcolor: 'rgba(107, 114, 128, 0.15)',
                          color: 'rgb(75, 85, 99)',
                          border: '1.5px solid rgba(107, 114, 128, 0.3)'
                        })
                      }}
                    />
                  </Box>
                </CardContent>
                <CardContent sx={{ pt: 0 }}>
                  {/* Slug */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      Project Slug
                    </Typography>
                    <Box
                      component="code"
                      sx={{
                        fontSize: '0.875rem',
                        bgcolor: 'rgba(0, 130, 174, 0.08)',
                        color: '#0082ae',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: '8px',
                        fontWeight: 600,
                        border: '1px solid rgba(0, 130, 174, 0.2)',
                        display: 'inline-block'
                      }}
                    >
                      {project.slug}
                    </Box>
                  </Box>

                  {/* URLs */}
                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                        Public Form
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Link
                          href={`/comment/${project.slug}`}
                          target="_blank"
                          className="text-sm font-semibold hover:underline flex items-center gap-1"
                          style={{ color: '#0082ae' }}
                        >
                          /comment/{project.slug}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <CopyUrlButton url={`/comment/${project.slug}`} label="Copy comment form URL" />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                        Presentation
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Link
                          href={`/present/${project.slug}`}
                          target="_blank"
                          className="text-sm font-semibold hover:underline flex items-center gap-1"
                          style={{ color: '#0082ae' }}
                        >
                          /present/{project.slug}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <CopyUrlButton url={`/present/${project.slug}`} label="Copy presentation URL" />
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, pt: 2, borderTop: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
                    <Link href={`/admin/projects/${project.slug}/edit`} style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                          height: '36px',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 130, 174, 0.1)',
                            color: '#0082ae',
                            borderColor: 'rgba(0, 130, 174, 0.3)'
                          }
                        }}
                        startIcon={<Edit className="h-4 w-4" />}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/projects/${project.slug}/review`} style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                          height: '36px',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'rgba(147, 51, 234, 0.05)',
                            color: 'rgb(126, 34, 206)',
                            borderColor: 'rgba(147, 51, 234, 0.3)'
                          }
                        }}
                        startIcon={<FileText className="h-4 w-4" />}
                      >
                        Review {pendingCounts[project.id] > 0 && (
                          <Chip
                            label={pendingCounts[project.id]}
                            size="small"
                            sx={{
                              ml: 0.5,
                              height: '18px',
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(245, 158, 11, 0.2)',
                              color: 'rgb(217, 119, 6)',
                              fontWeight: 700
                            }}
                          />
                        )}
                      </Button>
                    </Link>
                    <Link href={`/admin/projects/${project.slug}/qr`} className="sm:w-auto w-full">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          height: '36px',
                          fontWeight: 600,
                          minWidth: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 130, 174, 0.1)',
                            color: '#0082ae',
                            borderColor: 'rgba(0, 130, 174, 0.3)'
                          }
                        }}
                        aria-label="View QR code"
                      >
                        <QrCode className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
