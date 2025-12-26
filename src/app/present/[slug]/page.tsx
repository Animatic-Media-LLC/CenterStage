import { redirect } from 'next/navigation';
import { getProjectBySlug, getPresentationConfig } from '@/lib/db/projects';
import { getApprovedSubmissions } from '@/lib/db/submissions';
import { PresentationSlideshow } from '@/components/presentation/presentation-slideshow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

interface PresentationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Presentation Page
 * Public-facing slideshow of approved submissions
 */
export default async function PresentationPage({ params }: PresentationPageProps) {
  // Await params and fetch project data
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Redirect if project not found
  if (!project) {
    redirect('/');
  }

  // Show message if project is not active
  if (project.status !== 'active') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1a1a1a',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#ffffff' }}>
              Presentation Not Available
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af', mt: 2 }}>
              This presentation is currently unavailable.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  // Fetch presentation config
  const config = await getPresentationConfig(project.id);

  // Fetch all approved submissions
  const submissions = await getApprovedSubmissions(project.id);

  // Use default values if config doesn't exist
  const presentationConfig = {
    fontFamily: config?.font_family || 'Inter',
    fontSize: config?.font_size || 24,
    textColor: config?.text_color || '#FFFFFF',
    outlineColor: config?.outline_color || '#000000',
    backgroundColor: config?.background_color || '#1a1a1a',
    backgroundImageUrl: config?.background_image_url || null,
    transitionDuration: config?.transition_duration || 5,
    animationStyle: (config?.animation_style as 'fade' | 'slide' | 'zoom') || 'fade',
    randomizeOrder: config?.randomize_order ?? false,
    allowVideoFinish: config?.allow_video_finish ?? false,
  };

  return (
    <PresentationSlideshow
      projectId={project.id}
      projectName={project.name}
      clientName={project.client_name}
      submissions={submissions}
      config={presentationConfig}
    />
  );
}
