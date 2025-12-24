# Responsive Testing Guide

## Screen Size & Resolution Testing

This document outlines how the presentation display adapts to different screen sizes and resolutions.

### Implemented Responsive Features

#### 1. **Screen Detection Hook** (`src/hooks/use-screen-size.ts`)
- Real-time detection of screen dimensions
- Automatic detection of display type (1080p, 4K, portrait, ultra-wide)
- Aspect ratio calculation

#### 2. **Responsive Scaling System**

The presentation slides automatically adjust based on screen characteristics:

##### **4K Displays (3840×2160 or higher)**
- **Font Scale:** 1.5x (50% larger)
- **Padding Scale:** 1.5x
- **Rationale:** Prevents text from appearing too small on high-resolution displays

##### **1080p Displays (1920×1080)**
- **Font Scale:** 1.0x (baseline)
- **Padding Scale:** 1.0x
- **Max Width:** 90vw (with media) / 70vw (text-only)
- **Rationale:** Standard scaling for typical presentation displays

##### **Portrait Orientation** (height > width)
- **Font Scale:** 0.85x (15% smaller)
- **Padding Scale:** 0.75x (25% less padding)
- **Max Width:** 95vw (wider cards)
- **Media Height:** 40vh (vs 50vh in landscape)
- **Rationale:** Maximizes vertical space while maintaining readability

##### **Ultra-Wide Displays** (aspect ratio > 2:1)
- **Max Width:** 60vw (narrower cards)
- **Rationale:** Prevents content from stretching too wide on ultra-wide monitors

##### **Smaller Screens** (< 1920px width)
- **Font Scale:** 0.8x (20% smaller)
- **Padding Scale:** 0.8x
- **Max Width:** 95vw (with media) / 85vw (text-only)
- **Rationale:** Ensures content fits on smaller displays

### Testing Instructions

#### Browser DevTools Testing

1. **Open Presentation Page**
   ```
   http://localhost:3000/present/[your-project-slug]
   ```

2. **Use Browser DevTools to Test Different Resolutions**

   **Chrome/Edge:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Click device toolbar icon or press `Cmd+Shift+M` / `Ctrl+Shift+M`
   - Select or customize device dimensions

   **Recommended Test Resolutions:**

   - **1080p (Full HD)**
     - Resolution: 1920×1080
     - Expected: Standard scaling, comfortable text size

   - **1440p (QHD)**
     - Resolution: 2560×1440
     - Expected: Standard scaling, slightly larger cards

   - **4K (UHD)**
     - Resolution: 3840×2160
     - Expected: 1.5x text scaling, larger padding

   - **Portrait (Tablet/Kiosk)**
     - Resolution: 1080×1920
     - Expected: Taller cards, smaller text, 40vh media height

   - **Ultra-Wide**
     - Resolution: 3440×1440 or 2560×1080
     - Expected: Narrower cards (60vw), centered content

#### Physical Display Testing

1. **Connect to Target Display**
   - Ensure display is set to native resolution
   - Enable fullscreen mode (press spacebar in presentation)

2. **Test Checklist**
   - [ ] Text is readable from typical viewing distance
   - [ ] Images/videos scale appropriately
   - [ ] Cards are centered and well-proportioned
   - [ ] Animations are smooth (no jank)
   - [ ] Transitions work correctly
   - [ ] Padding feels balanced

3. **Long-Running Stability** (6+ hours)
   - [ ] No memory leaks
   - [ ] Consistent performance
   - [ ] Proper handling of new submissions
   - [ ] No visual glitches over time

### Common Issues & Solutions

#### Text Too Small on 4K Display
- **Solution:** Implemented 1.5x scaling for 4K displays
- **Verify:** Check that `screenSize.is4K` is `true` in DevTools

#### Content Stretched on Ultra-Wide
- **Solution:** Reduced max width to 60vw for ultra-wide displays
- **Verify:** Check that `screenSize.isUltraWide` is `true`

#### Cards Too Tall in Portrait Mode
- **Solution:** Reduced media height to 40vh and padding to 0.75x
- **Verify:** Check that `screenSize.isPortrait` is `true`

### Performance Considerations

- **Image Preloading:** Next 3 slides preload automatically
- **Video Preloading:** Next 3 videos preload with `preload="auto"`
- **Next.js Image Optimization:** Automatic responsive images
- **GPU Acceleration:** CSS transforms use `transform` and `opacity`

### Accessibility Notes

- Minimum font size maintained across all resolutions
- High contrast maintained in card design
- Animations can be paused via keyboard controls (Arrow keys)
- Fullscreen mode available (Spacebar)

### Future Enhancements

- [ ] Add user preference for text size override
- [ ] Support for vertical video displays
- [ ] Adaptive quality for images based on connection speed
- [ ] Custom breakpoints via admin configuration
