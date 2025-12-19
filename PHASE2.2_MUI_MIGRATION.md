# Phase 2.2: Material-UI Migration Plan

## Overview

Migrate the entire application from custom Radix UI components with Tailwind styling to Material-UI (MUI) v5 for a consistent, accessible, and maintainable component library.

## Goals

- ✅ Unified design system across admin and public interfaces
- ✅ Better out-of-the-box accessibility
- ✅ Reduced custom component maintenance
- ✅ Professional, polished UI with MUI's design language
- ✅ Responsive design with MUI's Grid and breakpoint system
- ✅ Rich ecosystem of pre-built components

## Current Component Inventory

### Components to Replace

**UI Components (`src/components/ui/`):**
- ❌ `button.tsx` → MUI `Button`
- ❌ `input.tsx` → MUI `TextField`
- ❌ `select.tsx` → MUI `Select`, `MenuItem`
- ❌ `textarea.tsx` → MUI `TextField` (multiline)
- ❌ `label.tsx` → MUI `FormLabel` (built into TextField)
- ❌ `card.tsx` → MUI `Card`, `CardContent`, `CardHeader`, `CardActions`
- ❌ `dialog.tsx` → MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
- ❌ `slider.tsx` → MUI `Slider`
- ❌ `color-picker.tsx` → Custom MUI-wrapped component
- ❌ `popover.tsx` → MUI `Popover`

**Layout Components:**
- 🔄 `src/components/layout/admin-layout.tsx` → MUI `Drawer`, `AppBar`, `List`

**Form Components:**
- 🔄 `src/components/forms/project-form.tsx`
- 🔄 `src/components/forms/project-edit-form.tsx`

**Admin Components:**
- 🔄 `src/components/admin/qr-code-display.tsx`

**Notification System:**
- ❌ Sonner toast → MUI `Snackbar` + `Alert`

## Installation

### Step 1: Install MUI Core Packages

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

### Step 2: Install Additional MUI Packages (Optional)

```bash
npm install @mui/x-date-pickers  # For future date picker needs
npm install @mui/lab              # For experimental components
```

### Step 3: Configure Next.js for MUI

MUI requires Emotion for styling with Next.js App Router. Configuration is handled automatically with the packages installed above.

## Theme Configuration

### Create Custom Theme

**File:** `src/lib/theme/mui-theme.ts`

```typescript
import { createTheme } from '@mui/material/styles';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Admin Theme (Professional)
export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue-600
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#6b7280', // Gray-500
      light: '#9ca3af',
      dark: '#4b5563',
    },
    error: {
      main: '#dc2626', // Red-600
    },
    warning: {
      main: '#f59e0b', // Amber-500
    },
    success: {
      main: '#10b981', // Green-500
    },
    background: {
      default: '#f9fafb', // Gray-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: geistSans.style.fontFamily,
    fontFamilyMono: geistMono.style.fontFamily,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase
          borderRadius: '0.375rem', // rounded-md
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // rounded-lg
        },
      },
    },
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 8, // 8px base spacing
});

// Public Theme (User-friendly, mobile-first)
export const publicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#6b7280',
    },
  },
  typography: {
    fontFamily: geistSans.style.fontFamily,
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },
  },
});
```

### Update App Layout

**File:** `src/app/layout.tsx`

```typescript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from '@/lib/theme/mui-theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={adminTheme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

## Migration Checklist

### Phase 1: Setup (30 min)
- [ ] Install MUI packages
- [ ] Create theme configuration file
- [ ] Update root layout with ThemeProvider
- [ ] Test that app still loads

### Phase 2: Core Components (2-3 hours)
- [ ] Create MUI Button wrapper (if needed for consistency)
- [ ] Create MUI TextField wrapper
- [ ] Create MUI Select wrapper
- [ ] Create MUI Card wrapper
- [ ] Create MUI Dialog wrapper
- [ ] Create MUI Slider wrapper
- [ ] Create MUI Snackbar notification system
- [ ] Test each component in isolation

### Phase 3: Admin Login (30 min)
- [ ] Update login page to use MUI TextField
- [ ] Update login button to use MUI Button
- [ ] Update error display to use MUI Alert
- [ ] Test login flow

### Phase 4: Admin Dashboard (1 hour)
- [ ] Update statistics cards to use MUI Card
- [ ] Update layout to use MUI Grid
- [ ] Update "New Project" button
- [ ] Test responsive layout

### Phase 5: Project List Page (1 hour)
- [ ] Update project cards to use MUI Card
- [ ] Update status badges to use MUI Chip
- [ ] Update action buttons to use MUI IconButton
- [ ] Update links to use MUI Link component
- [ ] Test grid layout and interactions

### Phase 6: Admin Layout (1-2 hours)
- [ ] Migrate sidebar to MUI Drawer
- [ ] Update navigation to use MUI List components
- [ ] Update user profile to use MUI Avatar
- [ ] Add MUI Divider for sections
- [ ] Test navigation and responsive behavior

### Phase 7: Project Forms (2-3 hours)
- [ ] Update ProjectForm inputs to MUI TextField
- [ ] Update select dropdowns to MUI Select
- [ ] Update sliders to MUI Slider
- [ ] Update color picker (wrap react-colorful in MUI Popover)
- [ ] Update form layout with MUI FormControl
- [ ] Add proper error states with FormHelperText
- [ ] Test form submission and validation

### Phase 8: Project Edit Form (1-2 hours)
- [ ] Same as ProjectForm
- [ ] Update archive/delete dialogs to MUI Dialog
- [ ] Test all form operations

### Phase 9: QR Code Page (1 hour)
- [ ] Update QR display cards to MUI Card
- [ ] Update color pickers
- [ ] Update download buttons to MUI Button
- [ ] Update copy buttons to MUI IconButton
- [ ] Test QR generation and download

### Phase 10: Cleanup (1 hour)
- [ ] Remove unused Radix UI components
- [ ] Uninstall Radix UI dependencies
- [ ] Update all imports
- [ ] Remove sonner (replace with MUI Snackbar)
- [ ] Clean up unused CSS

### Phase 11: Testing (2 hours)
- [ ] Test all admin pages
- [ ] Test all forms
- [ ] Test dialogs and modals
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Run build and fix TypeScript errors
- [ ] Visual QA

## Component Mapping Reference

### Buttons
```typescript
// Before (Radix + Tailwind)
<Button variant="default" size="default">Click me</Button>

// After (MUI)
<Button variant="contained" size="medium">Click me</Button>
```

### Text Inputs
```typescript
// Before
<Input
  id="name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter name"
/>

// After
<TextField
  id="name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter name"
  fullWidth
  size="small"
/>
```

### Select Dropdowns
```typescript
// Before
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

// After
<FormControl fullWidth size="small">
  <Select
    value={value}
    onChange={(e) => setValue(e.target.value)}
  >
    <MenuItem value="option1">Option 1</MenuItem>
  </Select>
</FormControl>
```

### Cards
```typescript
// Before
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// After
<Card>
  <CardHeader title="Title" />
  <CardContent>Content</CardContent>
</Card>
```

### Dialogs
```typescript
// Before
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// After
<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>
    <DialogContentText>Description</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Confirm</Button>
  </DialogActions>
</Dialog>
```

### Sliders
```typescript
// Before
<Slider
  min={16}
  max={72}
  step={1}
  value={[fontSize]}
  onValueChange={(value) => setFontSize(value[0])}
/>

// After
<Slider
  min={16}
  max={72}
  step={1}
  value={fontSize}
  onChange={(e, value) => setFontSize(value as number)}
  valueLabelDisplay="auto"
/>
```

### Notifications
```typescript
// Before
import { toast } from 'sonner';
toast.success('Success!');

// After
import { useSnackbar } from '@/hooks/useSnackbar';
const { showSnackbar } = useSnackbar();
showSnackbar('Success!', 'success');
```

## Styling Strategy

### Recommended Approach: Hybrid

- **MUI Components:** Use MUI's `sx` prop for component-specific styling
- **Tailwind:** Keep for layout utilities (flex, grid, spacing)
- **Custom Theme:** Define all colors, typography, spacing in MUI theme

**Example:**
```typescript
<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  <div className="flex gap-4">
    <TextField label="Name" sx={{ flex: 1 }} />
    <Button variant="contained">Submit</Button>
  </div>
</Box>
```

## Breaking Changes

### Event Handler Signatures
- **Select onChange:** `(e) => setValue(e.target.value)` instead of `onValueChange={setValue}`
- **Slider onChange:** `(e, value) => setValue(value)` instead of `onValueChange={value}`

### Prop Name Changes
- `variant`: Different values (`contained`, `outlined`, `text` for buttons)
- `size`: `small`, `medium`, `large` (instead of `sm`, `default`, `lg`)
- No `asChild` prop in MUI

### Component Structure
- Form labels are built into TextField (no separate Label component needed)
- Card structure slightly different (CardHeader has `title` prop)
- Dialog has separate DialogActions instead of DialogFooter

## Testing Checklist

- [ ] All pages render without errors
- [ ] All forms submit correctly
- [ ] Validation error messages display properly
- [ ] Dialogs open and close
- [ ] Navigation works correctly
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Theme colors applied correctly
- [ ] Build completes successfully
- [ ] No console errors or warnings

## Rollback Plan

If issues arise:
1. Git branch for migration: `feature/mui-migration`
2. Keep old components until migration complete
3. Can revert entire branch if needed
4. Test thoroughly before merging to main

## Resources

- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [MUI Components](https://mui.com/material-ui/react-button/)
- [MUI Theming](https://mui.com/material-ui/customization/theming/)
- [MUI with Next.js](https://mui.com/material-ui/integrations/nextjs/)
- [Migration from other libraries](https://mui.com/material-ui/migration/migration-v4/)

## Timeline

**Total Estimated Time:** 8-12 hours

- **Day 1 (3-4 hours):** Setup, core components, login page
- **Day 2 (3-4 hours):** Dashboard, project list, admin layout
- **Day 3 (2-4 hours):** Forms, QR page, cleanup, testing

## Success Criteria

✅ All pages migrated to MUI
✅ No Radix UI dependencies (except react-colorful if kept)
✅ Consistent visual design across all pages
✅ Build passes with no errors
✅ All features working as before
✅ Improved accessibility scores
✅ Mobile responsive design
