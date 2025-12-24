import { redirect } from 'next/navigation';
import { getProjectBySlug, getPresentationConfig } from '@/lib/db/projects';
import { SubmissionForm } from '@/components/forms/submission-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

interface CommentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Public Submission Form Page
 * Allows users to submit comments and photos for a project
 */
export default async function CommentPage({ params }: CommentPageProps) {
  const { slug } = await params;

  // Fetch project
  const project = await getProjectBySlug(slug);

  // 404 if project not found or not active
  if (!project || project.status !== 'active') {
    redirect('/404');
  }

  // Fetch presentation config
  const config = await getPresentationConfig(project.id);

  // Use default values if config doesn't exist
  const fontFamily = config?.font_family || 'Inter';
  const fontSize = config?.font_size || 24;
  const textColor = config?.text_color || '#15598a';
  const backgroundColor = config?.background_color || '#e0ecf6';
  const allowVideoUploads = config?.allow_video_uploads ?? true;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: backgroundColor,
        backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: `"${fontFamily}", sans-serif`,
              fontSize: `${fontSize * 1.5}px`, // Scale up for h1
              color: textColor,
              fontWeight: 600,
              marginBottom: '0px',
            }}
          >
            {project.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: `"${fontFamily}", sans-serif`,
              fontSize: `${fontSize}px`,
              color: textColor,
              opacity: 0.8,
              lineHeight: 1.15,
            }}
          >
            Share your thoughts with {project.client_name}
          </Typography>
        </Box>

        {/* Submission Form */}
        <SubmissionForm
          projectId={project.id}
          projectSlug={project.slug}
          allowVideoUploads={allowVideoUploads}
        />
      </Container>
    </Box>
  );
}
