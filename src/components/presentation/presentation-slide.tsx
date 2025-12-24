'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useScreenSize } from '@/hooks/use-screen-size';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

interface PresentationConfig {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  backgroundColor: string;
  backgroundImageUrl: string | null;
}

interface PresentationSlideProps {
  submission: Submission;
  config: PresentationConfig;
  animationStyle: 'fade' | 'slide' | 'zoom';
  isExiting: boolean;
}

export function PresentationSlide({
  submission,
  config,
  animationStyle,
  isExiting,
}: PresentationSlideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const screenSize = useScreenSize();

  // Trigger animation on mount and when submission changes
  useEffect(() => {
    if (isExiting) {
      // For exiting slides, start visible then immediately trigger exit animation
      setIsVisible(true);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
      }, 50);

      return () => {
        clearTimeout(exitTimer);
      };
    } else {
      // For entering slides, start invisible then trigger entrance
      setIsVisible(false);
      // Load video immediately when slide is entering
      if (submission.video_url) {
        setShouldLoadVideo(true);
      }
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => {
        clearTimeout(enterTimer);
      };
    }
  }, [submission.id, isExiting, submission.video_url]);

  // Determine layout based on media presence
  const hasMedia = Boolean(submission.photo_url || submission.video_url);
  const hasText = Boolean(submission.comment);

  // Calculate font size adjustment based on comment length
  const getCommentFontSizeMultiplier = () => {
    if (!submission.comment) return 1;

    const commentLength = submission.comment.length;

    if (commentLength > 250) {
      return 0.5; // 50% smaller
    } else if (commentLength > 150) {
      return 0.75; // 25% smaller
    }

    return 1; // Normal size
  };

  const fontSizeMultiplier = getCommentFontSizeMultiplier();

  // Calculate responsive scaling factors based on screen size
  const getResponsiveScaling = () => {
    // Base scaling factor
    let scaleFactor = 1;
    let paddingScale = 1;
    let maxWidthPercent = hasMedia ? 90 : 70;

    // 4K displays (3840x2160 or higher)
    if (screenSize.is4K) {
      scaleFactor = 1.5; // Increase font sizes by 50%
      paddingScale = 1.5; // Increase padding
    }
    // 1080p displays (1920x1080)
    else if (screenSize.is1080p) {
      scaleFactor = 1; // Standard scaling
      paddingScale = 1;
    }
    // Portrait orientation
    else if (screenSize.isPortrait) {
      scaleFactor = 0.85; // Slightly smaller text
      paddingScale = 0.75; // Less padding
      maxWidthPercent = 95; // Wider cards in portrait
    }
    // Ultra-wide displays
    else if (screenSize.isUltraWide) {
      maxWidthPercent = 60; // Narrower cards on ultra-wide
    }
    // Smaller screens (< 1920px)
    else if (screenSize.width < 1920) {
      scaleFactor = 0.8;
      paddingScale = 0.8;
      maxWidthPercent = hasMedia ? 95 : 85;
    }

    return { scaleFactor, paddingScale, maxWidthPercent };
  };

  const { scaleFactor, paddingScale, maxWidthPercent } = getResponsiveScaling();

  // Animation styles
  const getAnimationStyle = () => {
    const baseTransition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    switch (animationStyle) {
      case 'fade':
        // Entering: fade in (0 -> 1)
        // Exiting: fade out (1 -> 0)
        if (isExiting) {
          return {
            opacity: isVisible ? 1 : 0,
            transition: baseTransition,
          };
        }
        return {
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };
      case 'slide':
        // Entering: slide in from right (100% -> 0)
        // Exiting: slide out to left (0 -> -100%)
        if (isExiting) {
          return {
            transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isVisible ? 1 : 0,
            transition: baseTransition,
          };
        }
        return {
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };
      case 'zoom':
        // Entering: zoom in from small (0.8 -> 1)
        // Exiting: zoom out to large (1 -> 1.2)
        if (isExiting) {
          return {
            transform: isVisible ? 'scale(1)' : 'scale(1.2)',
            opacity: isVisible ? 1 : 0,
            transition: baseTransition,
          };
        }
        return {
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };
      default:
        return {
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };
    }
  };

  // Text styles without outline
  const textStyle: React.CSSProperties = {
    fontFamily: config.fontFamily,
    color: config.textColor,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${4 * paddingScale}rem ${2 * paddingScale}rem`,
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* Card Container */}
      <div
        style={{
          maxWidth: `${maxWidthPercent}vw`,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: `${1.5 * paddingScale}rem`,
          border: `${6 * paddingScale}px solid ${config.outlineColor}`,
          padding: `${3 * paddingScale}rem`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          ...getAnimationStyle(),
        }}
      >
        {/* Media Section */}
        {hasMedia && (
          <div
            style={{
              marginBottom: hasText ? `${2 * paddingScale}rem` : `${1 * paddingScale}rem`,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {submission.photo_url && (
              <div style={{ position: 'relative', maxWidth: '100%', maxHeight: screenSize.isPortrait ? '40vh' : '50vh' }}>
                <Image
                  src={submission.photo_url}
                  alt="Submission"
                  width={1920}
                  height={1080}
                  priority={!isExiting}
                  style={{
                    maxWidth: '100%',
                    maxHeight: screenSize.isPortrait ? '40vh' : '50vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: `${0.75 * paddingScale}rem`,
                  }}
                />
              </div>
            )}
            {submission.video_url && shouldLoadVideo && (
              <video
                src={submission.video_url}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                  maxWidth: '100%',
                  maxHeight: screenSize.isPortrait ? '40vh' : '50vh',
                  objectFit: 'contain',
                  borderRadius: `${0.75 * paddingScale}rem`,
                }}
              />
            )}
          </div>
        )}

        {/* Content Section */}
        <div
          style={{
            textAlign: 'center',
          }}
        >
          {/* Comment */}
          {hasText && (
            <blockquote
              style={{
                ...textStyle,
                fontSize: (hasMedia ? config.fontSize * 1.2 : config.fontSize * 1.8) * fontSizeMultiplier * scaleFactor,
                lineHeight: 1.6,
                marginBottom: `${1.5 * paddingScale}rem`,
                fontStyle: 'italic',
                margin: `0 0 ${1.5 * paddingScale}rem 0`,
              }}
            >
              &ldquo;{submission.comment}&rdquo;
            </blockquote>
          )}

          {/* Attribution */}
          <div
            style={{
              ...textStyle,
              fontSize: (hasMedia ? config.fontSize * 0.9 : config.fontSize * 1.2) * scaleFactor,
              fontWeight: 600,
            }}
          >
            <div style={{ marginBottom: `${0.5 * paddingScale}rem` }}>
              &mdash; {submission.full_name}
            </div>
            {submission.social_handle && (
              <div
                style={{
                  ...textStyle,
                  fontSize: (hasMedia ? config.fontSize * 0.7 : config.fontSize * 0.9) * scaleFactor,
                  opacity: 0.8,
                }}
              >
                {submission.social_handle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
