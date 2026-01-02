'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PresentationSlide } from './presentation-slide';
import type { Database } from '@/types/database.types';
import styles from './presentation-slideshow.module.scss';

type Submission = Database['public']['Tables']['submissions']['Row'];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface PresentationConfig {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  transitionDuration: number;
  animationStyle: 'fade' | 'slide' | 'zoom';
  randomizeOrder?: boolean;
  allowVideoFinish?: boolean;
}

interface PresentationSlideshowProps {
  projectId: string;
  projectName: string;
  clientName: string;
  submissions: Submission[];
  config: PresentationConfig;
}

export function PresentationSlideshow({
  projectId,
  projectName,
  clientName,
  submissions: initialSubmissions,
  config,
}: PresentationSlideshowProps) {
  // Shuffle submissions once on mount if randomizeOrder is enabled
  const shuffledSubmissions = useMemo(() => {
    return config.randomizeOrder ? shuffleArray(initialSubmissions) : initialSubmissions;
  }, []); // Empty dependency array ensures this only runs once on mount

  const [submissions, setSubmissions] = useState<Submission[]>(shuffledSubmissions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayedOnce, setDisplayedOnce] = useState<Set<string>>(new Set());
  const [currentVideoDuration, setCurrentVideoDuration] = useState<number | null>(null);

  // Filter submissions: remove "once" items that have already been displayed
  const activeSubmissions = submissions.filter((submission) => {
    if (submission.display_mode === 'once' && displayedOnce.has(submission.id)) {
      return false;
    }
    return true;
  });

  const currentSubmission = activeSubmissions[currentIndex];
  const previousSubmission = previousIndex !== null ? activeSubmissions[previousIndex] : null;

  // Callback for PresentationSlide to report video duration
  const handleVideoDurationDetected = useCallback((duration: number) => {
    setCurrentVideoDuration(duration);
  }, []);

  // Reset video duration when slide changes
  useEffect(() => {
    setCurrentVideoDuration(null);
  }, [currentIndex]);

  // Get the duration for the current slide
  const getCurrentDuration = () => {
    if (!currentSubmission) return config.transitionDuration;

    const baseDuration = currentSubmission.custom_timing || config.transitionDuration;

    // If allowVideoFinish is enabled and we have a video with duration > baseDuration
    if (
      config.allowVideoFinish &&
      currentSubmission.video_url &&
      currentVideoDuration !== null &&
      currentVideoDuration > baseDuration
    ) {
      return currentVideoDuration;
    }

    return baseDuration;
  };

  // Auto-advance to next slide
  useEffect(() => {
    if (activeSubmissions.length === 0) return;

    const duration = getCurrentDuration() * 1000; // Convert to milliseconds
    const timer = setTimeout(() => {
      // Mark current submission as displayed if it's "once" mode
      if (currentSubmission && currentSubmission.display_mode === 'once') {
        setDisplayedOnce((prev) => new Set([...prev, currentSubmission.id]));
      }

      // Move to next slide
      setCurrentIndex((prev) => {
        setPreviousIndex(prev); // Store current as previous
        const next = prev + 1;
        // Loop back to start if we've reached the end
        if (next >= activeSubmissions.length) {
          return 0;
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, activeSubmissions.length, currentSubmission, currentVideoDuration]);

  // Clear previous slide after transition completes
  useEffect(() => {
    if (previousIndex !== null) {
      const clearTimer = setTimeout(() => {
        setPreviousIndex(null);
      }, 1000); // Match the transition duration (0.8s + buffer)

      return () => clearTimeout(clearTimer);
    }
  }, [previousIndex]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ': // Spacebar - toggle fullscreen
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          // Manual next (for testing)
          setCurrentIndex((prev) => {
            setPreviousIndex(prev);
            return (prev + 1) % activeSubmissions.length;
          });
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          // Manual previous (for testing)
          setCurrentIndex((prev) => {
            setPreviousIndex(prev);
            return prev === 0 ? activeSubmissions.length - 1 : prev - 1;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSubmissions.length, toggleFullscreen]);

  // Auto-enter fullscreen on load (requires user interaction)
  useEffect(() => {
    const handleClick = () => {
      if (!document.fullscreenElement) {
        toggleFullscreen();
      }
      document.removeEventListener('click', handleClick);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [toggleFullscreen]);

  // Poll for new submissions every 30 seconds
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/presentations/${projectId}/submissions`);
        if (!response.ok) {
          console.error('Failed to fetch submissions');
          return;
        }

        const data = await response.json();
        if (data.success && data.submissions) {
          setSubmissions(data.submissions);
        }
      } catch (error) {
        console.error('Error polling for submissions:', error);
      }
    };

    const pollInterval = setInterval(fetchSubmissions, 30000);

    return () => clearInterval(pollInterval);
  }, [projectId]);

  // Preload ALL images and videos upfront when component mounts
  useEffect(() => {
    if (submissions.length === 0) return;

    const preloadImages: HTMLImageElement[] = [];
    const preloadVideos: HTMLVideoElement[] = [];

    // Preload ALL images and videos
    submissions.forEach((submission) => {
      // Preload image
      if (submission.photo_url) {
        const img = new Image();
        img.src = submission.photo_url;
        preloadImages.push(img);
      }

      // Preload video
      if (submission.video_url) {
        const video = document.createElement('video');
        video.src = submission.video_url;
        video.preload = 'auto';
        video.muted = true;
        preloadVideos.push(video);
      }
    });

    // Cleanup function to abort preloading if component unmounts
    return () => {
      preloadImages.forEach((img) => {
        img.src = '';
      });
      preloadVideos.forEach((video) => {
        video.src = '';
      });
    };
  }, [submissions]); // Only re-run when submissions change

  // Show holding screen if no active submissions
  if (activeSubmissions.length === 0) {
    return (
      <div
        className={styles.holdingScreen}
        style={{
          backgroundColor: config.backgroundColor,
          backgroundImage: config.backgroundImageUrl
            ? `url(${config.backgroundImageUrl})`
            : undefined,
          fontFamily: config.fontFamily,
        }}
      >
        <div className={styles.holdingContent}>
          <h1
            className={styles.holdingTitle}
            style={{
              fontSize: config.fontSize * 2,
              color: config.textColor,
              textShadow: `2px 2px 4px ${config.outlineColor}`,
            }}
          >
            {clientName}
          </h1>
          <p
            style={{
              fontSize: config.fontSize,
              color: config.textColor,
              textShadow: `1px 1px 2px ${config.outlineColor}`,
            }}
          >
            Check back soon for feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: config.backgroundColor,
        backgroundImage: config.backgroundImageUrl
          ? `url(${config.backgroundImageUrl})`
          : undefined,
      }}
    >
      {/* Previous slide - exiting */}
      {previousSubmission && (
        <PresentationSlide
          key={previousSubmission.id}
          submission={previousSubmission}
          config={config}
          animationStyle={config.animationStyle}
          isExiting={true}
          onVideoDurationDetected={handleVideoDurationDetected}
        />
      )}

      {/* Current slide - entering */}
      <PresentationSlide
        key={currentSubmission.id}
        submission={currentSubmission}
        config={config}
        animationStyle={config.animationStyle}
        isExiting={false}
        onVideoDurationDetected={handleVideoDurationDetected}
      />

      {/* Hidden controls info (for admin testing) */}
      {!isFullscreen && (
        <div className={styles.controls}>
          <div>Press Space for fullscreen</div>
          <div>Arrows to navigate</div>
          <div>
            Slide {currentIndex + 1} of {activeSubmissions.length}
          </div>
        </div>
      )}
    </div>
  );
}
