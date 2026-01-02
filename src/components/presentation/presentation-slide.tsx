'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useScreenSize } from '@/hooks/use-screen-size';
import type { Database } from '@/types/database.types';
import styles from './presentation-slide.module.scss';

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
  onVideoDurationDetected?: (duration: number) => void;
}

const LONG_COMMENT_THRESHOLD = 200;

export function PresentationSlide({
  submission,
  config,
  animationStyle,
  isExiting,
  onVideoDurationDetected,
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

  // Calculate dynamic font size based on available container space
  const getDynamicFontSize = (
    isVerticalLayout: boolean,
    hasMedia: boolean,
    scaleFactor: number
  ): number => {
    if (!submission.comment && !submission.full_name) return config.fontSize * scaleFactor;

    // Calculate available height based on layout - more conservative for vertical with media
    const availableHeight = isVerticalLayout
      ? (hasMedia ? screenSize.height * 0.25 : screenSize.height * 0.75) // Increased from 0.18 to 0.25 for more text space
      : screenSize.height * 0.62; // Side-by-side - account for padding

    // Calculate available width based on layout - much more generous
    const availableWidth = isVerticalLayout
      ? screenSize.width * 0.75
      : screenSize.width * 0.42; // ~42% for side-by-side text area - very wide estimate

    // Estimate content size
    const fullText = submission.comment || '';
    const nameLength = submission.full_name?.length || 0;
    const totalCharacters = fullText.length + nameLength;

    // Start with a much larger base font size
    let baseFontSize = config.fontSize * scaleFactor * 2.2; // 120% larger starting point

    // For side-by-side layout, we have even more vertical space
    if (!isVerticalLayout) {
      baseFontSize *= 2.8; // Start 180% larger for side-by-side
    }

    // For vertical layout without media, we can go much larger
    if (isVerticalLayout && !hasMedia) {
      baseFontSize *= 1.3; // 30% boost for text-only cards
    }

    // Calculate how many characters can fit per line (rough estimate)
    // Average character width is approximately 0.4 * fontSize for even tighter wrapping
    const avgCharWidth = baseFontSize * (isVerticalLayout ? 0.45 : 0.4);
    const charsPerLine = Math.floor(availableWidth / avgCharWidth);

    if (charsPerLine <= 0) return baseFontSize * 0.5; // Safety fallback

    // Calculate how many lines we need
    const estimatedLines = Math.ceil(totalCharacters / charsPerLine);

    // Use actual line height from CSS (1.125 for both layouts)
    const lineHeight = baseFontSize * 1.125;
    const estimatedHeight = estimatedLines * lineHeight;

    // Minimal buffer - use only 3% buffer for very aggressive sizing
    const bufferFactor = 1.03;
    const requiredHeight = estimatedHeight * bufferFactor;

    // If content fits, return base font size
    if (requiredHeight <= availableHeight) {
      return baseFontSize;
    }

    // Calculate scale-down factor needed to fit
    const scaleDown = availableHeight / requiredHeight;
    const adjustedFontSize = baseFontSize * scaleDown;

    // Set minimum font size to maintain readability - lower minimum for vertical to allow more wrapping
    const minFontSize = isVerticalLayout
      ? config.fontSize * 0.55 * scaleFactor // Reduced from 0.8 to 0.55 to allow smaller text and less image cropping
      : config.fontSize * 1.6 * scaleFactor; // Increased from 1.4 to 1.6 (160% minimum for side-by-side)

    return Math.max(adjustedFontSize, minFontSize);
  };

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

  // Text styles
  const textStyle: React.CSSProperties = {
    fontFamily: config.fontFamily,
    color: config.textColor,
  };

  // Determine if this is a long comment that needs side-by-side layout
  const isLongComment = submission.comment && submission.comment.length > LONG_COMMENT_THRESHOLD;
  const useSideBySideLayout = isLongComment && hasMedia;

  // Calculate dynamic font sizes for both layouts
  const sideBySideFontSize = getDynamicFontSize(false, hasMedia, scaleFactor);
  const verticalFontSize = getDynamicFontSize(true, hasMedia, scaleFactor);

  // Instagram-style card render
  const renderInstagramCard = () => {
    if (useSideBySideLayout) {
      // Side-by-side layout for long comments with media
      return (
        <div
          className={styles.cardSideBySide}
          style={{
            borderRadius: `${1.5 * paddingScale}rem`,
            ...getAnimationStyle(),
          }}
        >
          {/* Left: Media - Flexible width up to 50% */}
          <div className={styles.mediaLeft}>
            {submission.photo_url && (
              <img
                src={submission.photo_url}
                alt="Submission"
                className={styles.mediaImage}
              />
            )}
            {submission.video_url && shouldLoadVideo && (
              <video
                src={submission.video_url}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label={`Video submission from ${submission.full_name}`}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (onVideoDurationDetected && video.duration) {
                    const duration = Math.round(video.duration * 10) / 10;
                    onVideoDurationDetected(duration);
                  }
                }}
                className={styles.mediaVideo}
              />
            )}

            {/* Social handle overlay on media */}
            {submission.social_handle && (
              <div
                className={styles.socialHandleSideBySide}
                style={{
                  top: `${1.5 * paddingScale}rem`,
                  right: `${1.5 * paddingScale}rem`,
                  padding: `${0.5 * paddingScale}rem ${1.2 * paddingScale}rem`,
                  borderRadius: `${1.5 * paddingScale}rem`,
                  fontSize: `${config.fontSize * 0.9 * scaleFactor}px`,
                  fontFamily: config.fontFamily,
                }}
              >
                {submission.social_handle}
              </div>
            )}
          </div>

          {/* Right: Content - Flexible width, minimum to maintain readability */}
          <div
            className={styles.contentRight}
            style={{
              padding: `${3 * paddingScale}rem`,
              background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.backgroundColor} 50%, ${config.outlineColor}F2 100%)`,
              borderTopRightRadius: `${1.5 * paddingScale}rem`,
              borderBottomRightRadius: `${1.5 * paddingScale}rem`,
            }}
          >
            {hasText && (
              <blockquote
                className={styles.commentSideBySide}
                style={{
                  ...textStyle,
                  // fontSize: `${sideBySideFontSize}px`,
                  marginBottom: `${2 * paddingScale}rem`,
                }}
              >
                {submission.comment}
              </blockquote>
            )}

            {/* Attribution */}
            <div
              className={styles.sideBySideAttribution}
              style={{
                ...textStyle,
                // fontSize: `${sideBySideFontSize * 0.85}px`,
                marginTop: `${1.5 * paddingScale}rem`,
              }}
            >
              &mdash; {submission.full_name}
            </div>
          </div>
        </div>
      );
    }

    // Standard Instagram-style vertical layout
    return (
      <div
        className={styles.cardVertical}
        style={{
          // maxWidth: `${maxWidthPercent}vw`,
          borderRadius: `${1.5 * paddingScale}rem`,
          ...getAnimationStyle(),
        }}
      >
        {/* Media Section - Full Width, No Padding */}
        {hasMedia && (
          <div
            className={styles.mediaTop}
            style={
              {
                '--background-image': `url(${submission.photo_url || submission.video_url})`,
              } as React.CSSProperties
            }
          >
            {submission.photo_url && (
              <img
                src={submission.photo_url}
                alt="Submission"
                className={styles.mediaTopImage}
              />
            )}
            {submission.video_url && shouldLoadVideo && (
              <video
                src={submission.video_url}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label={`Video submission from ${submission.full_name}`}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (onVideoDurationDetected && video.duration) {
                    const duration = Math.round(video.duration * 10) / 10;
                    onVideoDurationDetected(duration);
                  }
                }}
                className={styles.mediaTopVideo}
              />
            )}

            {/* Social handle overlay on top-right of media */}
            {submission.social_handle && (
              <div
                className={styles.socialHandleVertical}
                style={{
                  top: `${1.5 * paddingScale}rem`,
                  right: `${1.5 * paddingScale}rem`,
                  padding: `${0.5 * paddingScale}rem ${1.2 * paddingScale}rem`,
                  borderRadius: `${1.5 * paddingScale}rem`,
                  fontSize: `${config.fontSize * 0.8125 * scaleFactor}px`,
                  fontFamily: config.fontFamily,
                }}
              >
                {submission.social_handle}
              </div>
            )}
          </div>
        )}

        {/* Content Section - Padded */}
        <div
          className={styles.contentBottom}
          style={{
            padding: `${2.5 * paddingScale}rem ${3 * paddingScale}rem`,
            background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.backgroundColor} 50%, ${config.outlineColor}F2 100%)`,
            borderBottomLeftRadius: `${1.5 * paddingScale}rem`,
            borderBottomRightRadius: `${1.5 * paddingScale}rem`,
          }}
        >
          {/* Comment */}
          {hasText && (
            <blockquote
              className={styles.commentVertical}
              style={{
                ...textStyle,
                marginBottom: `${1.5 * paddingScale}rem`,
              }}
            >
              {submission.comment}
            </blockquote>
          )}

          {/* Attribution - below comment or standalone */}
          {hasText && (
            <div
              className={styles.attribution}
              style={{
                ...textStyle,
              }}
            >
              &mdash; {submission.full_name}
            </div>
          )}

          {/* Just name if no comment */}
          {!hasText && (
            <div
              className={styles.nameOnly}
              style={{
                ...textStyle,
              }}
            >
              {submission.full_name}
            </div>
          )}

          {/* Social handle below if no media (since it's not overlaid) */}
          {!hasMedia && submission.social_handle && (
            <div
              className={styles.socialHandleBelow}
              style={{
                ...textStyle,
                fontSize: `${verticalFontSize * 0.7}px`,
                marginTop: `${0.5 * paddingScale}rem`,
              }}
            >
              {submission.social_handle}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.slideContainer}
      style={{
        padding: `${4 * paddingScale}rem ${2 * paddingScale}rem`,
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {renderInstagramCard()}
    </div>
  );
}
