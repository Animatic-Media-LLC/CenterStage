'use client';

import { useState, useEffect, useCallback } from 'react';
import { PresentationSlide } from './presentation-slide';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

interface PresentationConfig {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  transitionDuration: number;
  animationStyle: 'fade' | 'slide' | 'zoom';
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
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayedOnce, setDisplayedOnce] = useState<Set<string>>(new Set());

  // Filter submissions: remove "once" items that have already been displayed
  const activeSubmissions = submissions.filter((submission) => {
    if (submission.display_mode === 'once' && displayedOnce.has(submission.id)) {
      return false;
    }
    return true;
  });

  const currentSubmission = activeSubmissions[currentIndex];
  const previousSubmission = previousIndex !== null ? activeSubmissions[previousIndex] : null;

  // Get the duration for the current slide
  const getCurrentDuration = () => {
    if (!currentSubmission) return config.transitionDuration;
    return currentSubmission.custom_timing || config.transitionDuration;
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
  }, [currentIndex, activeSubmissions.length, currentSubmission]);

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

  // Show holding screen if no active submissions
  if (activeSubmissions.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: config.backgroundColor,
          backgroundImage: config.backgroundImageUrl
            ? `url(${config.backgroundImageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: config.fontFamily,
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1
            style={{
              fontSize: config.fontSize * 2,
              color: config.textColor,
              textShadow: `2px 2px 4px ${config.outlineColor}`,
              marginBottom: '1rem',
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
      style={{
        minHeight: '100vh',
        backgroundColor: config.backgroundColor,
        backgroundImage: config.backgroundImageUrl
          ? `url(${config.backgroundImageUrl})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
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
        />
      )}

      {/* Current slide - entering */}
      <PresentationSlide
        key={currentSubmission.id}
        submission={currentSubmission}
        config={config}
        animationStyle={config.animationStyle}
        isExiting={false}
      />

      {/* Hidden controls info (for admin testing) */}
      {!isFullscreen && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            opacity: 0.7,
          }}
        >
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
