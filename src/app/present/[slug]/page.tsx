import { redirect } from 'next/navigation';
import { getProjectBySlug, getPresentationConfig } from '@/lib/db/projects';
import { getApprovedSubmissions } from '@/lib/db/submissions';
import { PresentationSlideshow } from '@/components/presentation/presentation-slideshow';

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

  // Redirect if project not found or not active
  if (!project || project.status !== 'active') {
    redirect('/');
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
