'use client';

import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isPortrait: boolean;
  is1080p: boolean;
  is4K: boolean;
  isUltraWide: boolean;
  aspectRatio: number;
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        isPortrait: false,
        is1080p: true,
        is4K: false,
        isUltraWide: false,
        aspectRatio: 16 / 9,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    return {
      width,
      height,
      isPortrait: height > width,
      is1080p: width >= 1920 && width < 2560 && height >= 1080 && height < 1440,
      is4K: width >= 3840 || height >= 2160,
      isUltraWide: aspectRatio > 2,
      aspectRatio,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      setScreenSize({
        width,
        height,
        isPortrait: height > width,
        is1080p: width >= 1920 && width < 2560 && height >= 1080 && height < 1440,
        is4K: width >= 3840 || height >= 2160,
        isUltraWide: aspectRatio > 2,
        aspectRatio,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
