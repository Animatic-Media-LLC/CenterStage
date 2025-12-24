'use client';

import { useEffect, useState } from 'react';
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
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => {
        clearTimeout(enterTimer);
      };
    }
  }, [submission.id, isExiting]);

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
        padding: '4rem 2rem',
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* Card Container */}
      <div
        style={{
          maxWidth: hasMedia ? '90vw' : '70vw',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          border: `6px solid ${config.outlineColor}`,
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          ...getAnimationStyle(),
        }}
      >
        {/* Media Section */}
        {hasMedia && (
          <div
            style={{
              marginBottom: hasText ? '2rem' : '1rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {submission.photo_url && (
              <img
                src={submission.photo_url}
                alt="Submission"
                style={{
                  maxWidth: '100%',
                  maxHeight: '50vh',
                  objectFit: 'contain',
                  borderRadius: '0.75rem',
                }}
              />
            )}
            {submission.video_url && (
              <video
                src={submission.video_url}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  maxWidth: '100%',
                  maxHeight: '50vh',
                  objectFit: 'contain',
                  borderRadius: '0.75rem',
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
                fontSize: (hasMedia ? config.fontSize * 1.2 : config.fontSize * 1.8) * fontSizeMultiplier,
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                fontStyle: 'italic',
                margin: '0 0 1.5rem 0',
              }}
            >
              &ldquo;{submission.comment}&rdquo;
            </blockquote>
          )}

          {/* Attribution */}
          <div
            style={{
              ...textStyle,
              fontSize: hasMedia ? config.fontSize * 0.9 : config.fontSize * 1.2,
              fontWeight: 600,
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              &mdash; {submission.full_name}
            </div>
            {submission.social_handle && (
              <div
                style={{
                  ...textStyle,
                  fontSize: hasMedia ? config.fontSize * 0.7 : config.fontSize * 0.9,
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
