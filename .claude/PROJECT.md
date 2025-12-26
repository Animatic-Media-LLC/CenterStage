# Animatic CenterStage - Project Specification

## Project Summary

**Producer:** Animatic Media

**Hosting:** Sub-domain on www.animatic.com (sub domain name to be determined)

**Tech Stack:** Next.js 15+, Supabase (Database & Storage), NextAuth.js (Authentication), Tailwind CSS

### Overview
An application where administrators can setup a project for a specific client. It generates a QR code that is a link to a specific URL endpoint, with the slug setup in the administration site. Public users can then enter their name, a comment/review, and upload a photo or video for administrators to review and approve to be shown on a read-only presentation website.

This project will consist of 4 separate endpoints, an administration portal will configure a specific partner's interface and endpoint. There can be many partner sites, and the QR code is specific to the site that is configured. A partner can have many sites under the same "team", but each site operates independently.

---

## System Architecture

### Technology Choices

#### Authentication: NextAuth.js v5 (Auth.js)
- **Why NextAuth.js:** Native Next.js integration, supports App Router, built-in session management
- **Provider:** Credentials provider for admin login with bcrypt password hashing
- **Session Storage:** JWT tokens stored in secure HTTP-only cookies
- **Integration:** Middleware protection for admin routes (`/admin/*`)
- **Future-proof:** Easy to add OAuth providers (Google, GitHub) if needed

#### Database: Supabase PostgreSQL
- **Why Supabase:**
  - Real-time subscriptions for live comment updates
  - Built-in authentication (can be used alongside NextAuth)
  - Row Level Security (RLS) for data protection
  - Generous free tier with scalability
  - Storage solution for photos/videos included
  - REST and GraphQL APIs auto-generated

#### File Storage: Supabase Storage
- **Media Upload:** Photos and videos from public users
- **QR Code Storage:** Generated QR codes for projects
- **CDN:** Automatic CDN distribution for fast media delivery
- **Security:** Signed URLs for controlled access, file size limits, type validation

---

## Database Schema (Supabase)

### Tables

#### `users` (Admin Authentication)
```sql
- id: uuid (primary key)
- email: varchar (unique)
- password_hash: varchar
- name: varchar
- role: enum ('admin', 'super_admin')
- created_at: timestamp
- updated_at: timestamp
```

#### `projects`
```sql
- id: uuid (primary key)
- slug: varchar (unique, indexed)
- name: varchar
- client_name: varchar
- team_id: uuid (for grouping multiple projects)
- qr_code_url: varchar (Supabase Storage URL)
- status: enum ('active', 'archived', 'deleted')
- created_by: uuid (foreign key -> users.id)
- created_at: timestamp
- updated_at: timestamp
- archived_at: timestamp (nullable)
```

#### `presentation_config`
```sql
- id: uuid (primary key)
- project_id: uuid (foreign key -> projects.id, unique)
- font_family: varchar (default: 'Inter')
- font_size: integer (default: 24)
- text_color: varchar (hex color, default: '#FFFFFF')
- outline_color: varchar (hex color, default: '#000000')
- background_color: varchar (hex color, default: '#1a1a1a')
- background_image_url: text (nullable, Supabase Storage URL for presentation page background, max 5MB)
- transition_duration: integer (seconds, default: 5)
- animation_style: enum ('fade', 'slide', 'zoom')
- layout_template: varchar (default: 'standard')
- created_at: timestamp
- updated_at: timestamp
```

#### `submissions`
```sql
- id: uuid (primary key)
- project_id: uuid (foreign key -> projects.id, indexed)
- full_name: varchar
- social_handle: varchar (nullable)
- comment: text (max 500 chars)
- photo_url: varchar (nullable, Supabase Storage URL)
- video_url: varchar (nullable, Supabase Storage URL)
- status: enum ('pending', 'approved', 'declined', 'deleted', 'archived')
- display_mode: enum ('once', 'repeat') (default: 'repeat')
- custom_timing: integer (nullable, seconds - overrides project default)
- submitted_at: timestamp
- reviewed_at: timestamp (nullable)
- reviewed_by: uuid (nullable, foreign key -> users.id)
- created_at: timestamp
- updated_at: timestamp
```

#### `teams` (Optional - for multi-team support)
```sql
- id: uuid (primary key)
- name: varchar
- created_at: timestamp
```

---

## Page Features - Detailed Breakdown

### 1. Administration Control Panel (`/admin`)

#### Authentication (`/admin/login`)
- **Features:**
  - Email and password login form
  - "Remember me" checkbox (extends session)
  - Password reset flow (email-based via Supabase)
  - Session timeout after 24 hours of inactivity
  - Protected routes with middleware redirect
  - CSRF protection via NextAuth

#### Dashboard (`/admin/dashboard`)
- **Features:**
  - Overview cards: Total projects, Active projects, Pending submissions, Approved submissions
  - Recent activity feed (last 10 submissions across all projects)
  - Quick actions: "Create New Project" button
  - Project list with search and filter (Active/Archived)
  - Each project card shows:
    - Project name and client
    - Submission counts by status
    - Quick links to Review page and Presentation page
    - Edit/Archive/Delete buttons

#### Project Creation/Edit (`/admin/projects/new`, `/admin/projects/[slug]/edit`)
- **Features:**
  - **Project Details Section:**
    - Project name (required)
    - Client name (required)
    - Slug generator (auto-generates from project name, editable, validates uniqueness)
    - Team assignment (dropdown if multi-team)

  - **URL Generation Section:**
    - Auto-generates 3 URLs based on slug:
      - Public Form: `https://[subdomain].animatic.com/comment/[slug]`
      - Review Page: `https://[subdomain].animatic.com/review/[slug]`
      - Presentation: `https://[subdomain].animatic.com/present/[slug]`
    - Copy-to-clipboard buttons for each URL
    - QR code preview (real-time generation as slug changes)
    - Download QR code button (PNG, SVG formats)

  - **Presentation Styling Section:**
    - Font family selector (dropdown: Inter, Roboto, Montserrat, Playfair Display, etc.)
    - Font size slider (16px - 72px)
    - Text color picker
    - Outline/stroke color picker
    - Background color picker
    - Live preview panel showing sample post with current settings

  - **Animation Settings:**
    - Transition duration (1-30 seconds, slider with number input)
    - Animation style selector (Fade/Slide/Zoom)
    - Layout template selector (visual thumbnails)

  - **Actions:**
    - Save button (validates all fields)
    - Cancel button
    - Archive project button (for edit page)
    - Delete project button (with confirmation modal)

#### QR Code Management (`/admin/projects/[slug]/qr`)
- **Features:**
  - Large QR code preview
  - Download in multiple formats:
    - PNG (high resolution, 1000x1000px)
    - SVG (vector, scalable)
    - PDF (printable)
  - QR code customization:
    - Color selection (foreground/background)
    - Logo overlay option (Animatic Media logo)
    - Size presets (Small/Medium/Large)
  - Regenerate button (if slug changes)
  - Print-friendly view

---

### 2. Client Review Page (`/review/[slug]`)

#### Access & Layout
- **Access Control:** Public URL but can optionally be password-protected per project
- **Responsive Design:** Works on desktop, tablet, mobile
- **Header:** Project name, client name, filter/search bar
- **Real-time Updates:** Polls every 10 seconds for new submissions using Supabase real-time subscriptions

#### Tab Navigation
1. **Pending Tab** (Default view)
   - **Features:**
     - Grid/list view toggle
     - Sort options: Newest first, Oldest first
     - Each submission card shows:
       - User's full name (prominent)
       - Social handle (if provided, with @ prefix)
       - Comment text (full display)
       - Photo/video thumbnail (click to expand/play)
       - Timestamp (relative: "2 minutes ago")
       - Action buttons: Approve (green), Decline (yellow), Delete (red)
     - Bulk actions: Select multiple, bulk approve/decline
     - Pagination (20 items per page)
     - Empty state: "No pending submissions"

2. **Approved Tab**
   - **Features:**
     - Same card layout as Pending
     - Additional fields visible:
       - Display mode toggle (Once/Repeat) - editable inline
       - Custom timing input (seconds) - editable inline
       - "Approved by [Name]" and timestamp
     - Action buttons: Archive, Delete, Revert to Pending
     - Preview button (opens presentation preview modal)
     - Reorder functionality (drag-and-drop to set presentation order)
     - Count indicator: "142 approved posts"

3. **Declined Tab**
   - **Features:**
     - Same card layout
     - Shows decline timestamp and user who declined
     - Action buttons: Approve, Delete, Archive
     - Reason field (optional, for internal notes)

4. **Deleted Tab**
   - **Features:**
     - Same card layout
     - Shows deletion timestamp
     - Action buttons: Restore (to Pending), Permanent Delete
     - Warning: "Deleted items are hidden from public but recoverable"

5. **Archived Tab**
   - **Features:**
     - Same card layout
     - Shows archive timestamp
     - Action buttons: Restore, Delete
     - Used for posts that ran once or are no longer needed

#### Global Settings Panel (Sidebar/Drawer)
- **Features:**
  - Default display mode: Once/Repeat (applies to new approvals)
  - Default timing override toggle
  - Auto-approve option (checkbox, with safeguards)
  - Export approved submissions (CSV download with all data)

#### Submission Detail Modal
- **Triggered by:** Clicking on any submission card
- **Features:**
  - Full-screen photo/video viewer
  - All submission metadata
  - Edit fields: Display mode, custom timing, internal notes
  - Status change buttons
  - Previous/Next navigation between submissions

---

### 3. Public User Form (`/comment/[slug]`)

#### Design & UX
- **Branding:** Animatic Media logo at top
- **Mobile-first:** Large touch targets, simple layout
- **Progress Indicator:** Steps 1-4 (Name → Comment → Photo → Review)

#### Form Fields
1. **Full Name**
   - Required field
   - Text input, max 100 characters
   - Validation: No special characters except spaces, hyphens, apostrophes
   - Error message: "Please enter your full name"

2. **Social Handle** (Optional)
   - Text input, max 30 characters
   - Placeholder: "@yourusername"
   - Auto-adds @ if user forgets
   - Validation: Alphanumeric, underscores only
   - Help text: "Optional - Your Instagram, Twitter, or TikTok handle"

3. **Comment**
   - Textarea, max 500 characters
   - Character counter (live update: "432/500 characters")
   - Auto-expand as user types
   - Required field
   - Validation: Minimum 10 characters
   - Error message: "Please share your thoughts (at least 10 characters)"

4. **Upload Photo**
   - File input button styled as large upload area
   - Click to browse or drag-and-drop
   - **File Restrictions:**
     - Accepted formats: JPEG, PNG, HEIC, WebP
     - Max file size: 10MB
     - Shows preview thumbnail after upload
     - Remove/replace button
   - **Mobile Camera Integration:**
     - "Take Photo" button (opens camera on mobile)
     - "Choose from Library" button
   - Validation messages:
     - "File too large. Please choose a photo under 10MB"
     - "Invalid file type. Please upload a photo (JPG, PNG)"
   - Optional field with text: "Add a photo to make your post stand out!"

5. **Submit Button**
   - Large, prominent CTA: "Submit Your Feedback"
   - Disabled state while uploading/processing
   - Loading spinner during submission
   - Validation runs on click (highlights missing/invalid fields)

#### Submission Flow
1. User fills form → clicks Submit
2. Client-side validation checks all fields
3. Photo uploads to Supabase Storage (with progress bar)
4. Form data submits to database (status: 'pending')
5. Success confirmation screen

#### Confirmation Screen
- **Features:**
  - Success icon (checkmark animation)
  - Message: "Thank you, [Name]! Your feedback has been submitted."
  - Subtext: "Your post will appear on the big screen after approval."
  - "Submit Another" button (clears form, returns to start)
  - Optional: Show estimated wait time ("Usually approved within 5 minutes")

#### Error Handling
- Network error: "Couldn't connect. Please check your internet and try again."
- Server error: "Something went wrong. Please try again in a moment."
- Duplicate detection: Optional check to prevent spam (same name + similar comment within 5 minutes)

---

### 4. Presentation Page (`/present/[slug]`)

#### Display Characteristics
- **Fullscreen Mode:** Auto-enters fullscreen on load (with user permission)
- **Resolution:** Responsive, optimized for 1080p and 4K displays
- **Orientation:** Works in landscape (TV) and portrait (digital signage)
- **No UI Chrome:** Completely clean, no navigation, no visible controls
- **Loop:** Infinite loop through approved submissions

#### Animation & Transitions
- **Fetches:** Only submissions with status='approved' for this project
- **Order:**
  - Primary: Custom order (from drag-and-drop in Review page)
  - Fallback: Chronological (oldest approved first)
- **Display Logic:**
  - Shows each submission for duration specified in:
    1. Custom timing (if set on submission)
    2. Project's default transition_duration (from presentation_config)
  - After showing "once" posts once, excludes them from rotation
  - "Repeat" posts continue in loop indefinitely

#### Layout Variations (Responsive Templates)

**Template 1: Standard (Text + Photo)**
```
┌─────────────────────────────────────┐
│                                     │
│         [User Photo - Large]        │
│                                     │
│  "Comment text displayed here..."   │
│                                     │
│          — First Last Name          │
│           @socialhandle             │
└─────────────────────────────────────┘
```

**Template 2: Text-Only (No Photo)**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│  "Comment text displayed here       │
│   in larger font, centered with     │
│   beautiful typography"             │
│                                     │
│          — First Last Name          │
│           @socialhandle             │
└─────────────────────────────────────┘
```

**Template 3: Photo-Focused (Minimal Text)**
```
┌─────────────────────────────────────┐
│                                     │
│    [User Photo - Full Bleed BG]     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ "Comment"                     │  │
│  │ — Name (@handle)              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Dynamic Styling (Applied from presentation_config)
- All text uses configured font_family, font_size, text_color
- Text outline/stroke uses outline_color for readability over photos
- Background color fills when no photo
- Transition style applies between slides (fade/slide/zoom)

#### Real-time Updates
- Polls database every 30 seconds for newly approved posts
- Seamlessly inserts new posts into rotation without jarring interruptions
- If no approved posts exist, shows holding screen: "Check back soon for feedback!"

#### Performance Optimizations
- Preloads next 3 images in sequence
- Uses Next.js Image component for optimization
- Lazy loads videos, autoplays when visible
- GPU-accelerated CSS animations

#### Accessibility Considerations
- High contrast text options
- Optional: Screen reader support (can be disabled for pure display)
- Keyboard controls (hidden): Spacebar to pause/play, Arrow keys to navigate

---

## URL Routing Structure

```
Next.js App Router Structure:
/app
  /admin
    /login/page.tsx
    /dashboard/page.tsx
    /projects
      /new/page.tsx
      /[slug]
        /edit/page.tsx
        /qr/page.tsx
    layout.tsx (with auth protection)

  /review
    /[slug]/page.tsx

  /comment
    /[slug]/page.tsx

  /present
    /[slug]/page.tsx

  /api
    /auth/[...nextauth]/route.ts (NextAuth handlers)
    /projects/route.ts
    /projects/[slug]/route.ts
    /submissions/route.ts
    /submissions/[slug]/route.ts
    /qr-code/route.ts
```

**Dynamic Route Examples:**
- Slug: `america2025`
- Client Review: `https://[subdomain].animatic.com/review/america2025`
- Public Form: `https://[subdomain].animatic.com/comment/america2025`
- Presentation: `https://[subdomain].animatic.com/present/america2025`

---

## Development Phases

### Phase 1: Foundation & Authentication ✓
**Goal:** Set up project infrastructure and admin authentication

- [x] Initialize Next.js 15 project with TypeScript and Tailwind CSS
- [x] Configure Supabase project and generate database types
- [x] Set up environment variables (.env.local)
- [x] Setup a js test environment for code coverage
- [x] Create database schema in Supabase (run SQL migrations)
  - [x] Create `users` table
  - [x] Create `projects` table
  - [x] Create `presentation_config` table
  - [x] Create `submissions` table
  - [x] Set up Row Level Security policies
- [x] Install and configure NextAuth.js v5
  - [x] Set up credentials provider
  - [x] Create auth API routes
  - [x] Implement session management
  - [x] Create middleware for route protection
- [x] Build admin login page (`/admin/login`)
  - [x] Login form with email/password
  - [x] Error handling and validation
  - [x] Redirect logic after successful login
- [x] Seed database with initial admin user
- [x] Test authentication flow end-to-end

**Deliverable:** Functional admin login with protected routes ✅ COMPLETE

---

### Phase 2: Admin Dashboard & Project Management ✅
**Goal:** Build core admin functionality for creating and managing projects

- [x] Create admin dashboard layout (`/admin/dashboard`)
  - [x] Navigation sidebar/header
  - [x] Overview statistics cards
  - [x] Recent activity feed
- [x] Build project creation form (`/admin/projects/new`)
  - [x] Project name, client name, slug inputs
  - [x] Slug auto-generation and validation
  - [x] URL generation logic
  - [x] Save project to database
- [x] Implement presentation configuration form
  - [x] Font family selector
  - [x] Color pickers (text, outline, background)
  - [x] Transition timing slider
  - [x] Animation style selector
  - [x] Live preview component
- [x] Build project edit page (`/admin/projects/[slub]/edit`)
  - [x] Load existing project data
  - [x] Update functionality
  - [x] Archive project feature
  - [x] Delete project with confirmation modal
- [x] Create project list view on dashboard
  - [x] Display all projects with key info
  - [x] Search and filter functionality
  - [x] Quick action buttons
- [x] Implement QR code generation
  - [x] API route for QR code creation
  - [x] QR code display page (`/admin/projects/[slub]/qr`)
  - [x] Download functionality (PNG, SVG, PDF)
  - [x] Store QR codes in Supabase Storage
- [x] Add copy-to-clipboard for URLs
- [x] Set up API routes for projects CRUD operations

**Deliverable:** Full project creation and management system ✅ COMPLETE

---

### Phase 2.2: Material-UI Component Migration ✅
**Goal:** Implement Material-UI (MUI) as the primary component library and migrate all existing UI components

#### Background
Currently using custom Radix UI components with Tailwind styling. This phase replaces all UI components with Material-UI for:
- Consistent design system across admin and public forms
- Better accessibility out of the box
- Rich component ecosystem (inputs, buttons, selects, dialogs, etc.)
- Built-in theming and responsive design
- Reduced maintenance burden

#### Tasks

**1. Install Material-UI Dependencies**
- [x] Install core MUI packages:
  ```bash
  npm install @mui/material @emotion/react @emotion/styled
  npm install @mui/icons-material  # For icons
  npm install @mui/x-date-pickers   # If date pickers needed later
  ```
- [x] Configure MUI theme provider in app layout
- [x] Set up custom theme (colors, typography, breakpoints)
- [x] Configure Emotion for server-side rendering (Next.js App Router)

**2. Create MUI Theme Configuration**
- [x] Create `src/lib/theme/mui-theme.ts` with custom theme
  - Primary color scheme (brand colors)
  - Secondary colors
  - Typography (font families, sizes)
  - Spacing and breakpoints
  - Component style overrides
- [x] Wrap app with `ThemeProvider` in `src/app/layout.tsx`
- [x] Create separate themes for admin (professional) and public (user-friendly)

**3. Replace Core UI Components**

**Form Components:**
- [x] Replace `src/components/ui/input.tsx` with MUI `TextField`
- [x] Replace `src/components/ui/button.tsx` with MUI `Button`
- [x] Replace `src/components/ui/select.tsx` with MUI `Select` and `MenuItem`
- [x] Replace `src/components/ui/textarea.tsx` with MUI `TextField` (multiline)
- [x] Replace `src/components/ui/label.tsx` with MUI `FormLabel` / built-in labels
- [x] Replace `src/components/ui/slider.tsx` with MUI `Slider`
- [ ] Replace checkbox/radio (if any) with MUI `Checkbox` / `Radio`
- [ ] Add MUI `Switch` for toggle functionality

**Display Components:**
- [x] Replace `src/components/ui/card.tsx` with MUI `Card`, `CardContent`, `CardHeader`, `CardActions`
- [x] Replace `src/components/ui/dialog.tsx` with MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
- [x] Replace toast notifications (sonner) with MUI `Snackbar` and `Alert`
- [ ] Add MUI `Tooltip` for helpful hints
- [x] Add MUI `Chip` for status badges

**Custom Components:**
- [x] Replace `src/components/ui/color-picker.tsx` with MUI-styled color picker
  - ✅ Kept react-colorful but wrapped in MUI `Popover`
- [x] Update QR code display to use MUI components

**4. Update Admin Pages with MUI**
- [x] Update `src/app/admin/login/page.tsx`
  - Use MUI `TextField` for email/password
  - Use MUI `Button` for submit
  - Use MUI `Alert` for errors
- [x] Update `src/app/admin/dashboard/page.tsx`
  - Use MUI `Card` for statistics
  - Use MUI `Grid` for layout
- [x] Update `src/app/admin/projects/page.tsx`
  - Use MUI `Card` for project cards
  - Use MUI `IconButton` for actions
  - Use MUI `Chip` for status badges
- [x] Update `src/app/admin/projects/new/page.tsx`
  - Migrate `ProjectForm` to MUI components
- [x] Update `src/app/admin/projects/[slub]/edit/page.tsx`
  - Migrate `ProjectEditForm` to MUI components
- [x] Update `src/app/admin/projects/[slub]/qr/page.tsx`
  - Use MUI layout components

**5. Update Form Components**
- [x] Update `src/components/forms/project-form.tsx`
  - Replace all inputs with MUI `TextField`
  - Replace select with MUI `Select`
  - Replace sliders with MUI `Slider`
  - Replace color pickers with MUI-wrapped version
  - Use MUI `FormControl`, `FormLabel`, `FormHelperText`
- [x] Update `src/components/forms/project-edit-form.tsx`
  - Same as project-form.tsx
  - Update dialog confirmations to MUI `Dialog`

**6. Update Layout Components**
- [ ] Update `src/components/layout/admin-layout.tsx`
  - Use MUI `Drawer` for sidebar (optional enhancement)
  - Use MUI `AppBar` for top bar (optional)
  - Use MUI `List`, `ListItem`, `ListItemButton` for navigation
  - Use MUI `Avatar` for user profile
  - Use MUI `Divider` for separators

**7. Clean Up Legacy Components**
- [ ] Remove old Radix UI components from `src/components/ui/`
  - Keep or remove based on whether fully replaced
- [ ] Remove unused Radix UI dependencies:
  ```bash
  npm uninstall @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-popover
  ```
- [ ] Update imports across the codebase

**8. Styling Considerations**
- [x] Decide on Tailwind CSS usage alongside MUI
  - ✅ Hybrid approach - MUI for components, Tailwind for layout
- [x] Update global styles if needed
- [x] Ensure consistent spacing and sizing

**9. Accessibility & Responsiveness**
- [x] Verify all forms are keyboard accessible
- [x] Test screen reader compatibility
- [x] Test on mobile devices (touch targets, responsive layout)
- [x] Add proper ARIA labels where needed (MUI provides most automatically)

**10. Testing**
- [x] Test all admin pages for visual consistency
- [x] Test form validation and error states
- [x] Test dialogs and modals
- [x] Test color picker functionality
- [x] Test slider interactions
- [x] Run build to check for TypeScript errors
- [ ] Visual regression testing (optional)

**11. Documentation**
- [ ] Update component usage documentation
- [ ] Document custom MUI theme configuration
- [ ] Add examples for common patterns

#### Migration Strategy

**Approach:** Incremental migration (safest)
1. Install MUI and set up theme provider
2. Create MUI wrapper components that match existing API
3. Migrate one page/component at a time
4. Test after each migration
5. Remove old components once all migrations complete

**Alternative Approach:** Big bang migration (faster but riskier)
1. Install MUI
2. Replace all components in one pass
3. Fix all TypeScript errors
4. Comprehensive testing

**Recommended:** Incremental migration for this project

#### Breaking Changes to Consider
- MUI components may have different prop names than current components
- Event handlers may need adjustments (`onChange` signatures)
- Styling approach changes (CSS modules → MUI `sx` prop)
- Form validation integration may need updates

#### Deliverables
✅ All admin pages using MUI components
✅ Consistent theme across application
✅ All forms functional with MUI inputs
✅ No Radix UI dependencies remaining (or kept only where beneficial)
✅ Build passes with no errors
✅ Documentation updated

**Estimated Effort:** 8-12 hours

---

### Phase 3: Public Submission Form ✅
**Goal:** Build and deploy the public-facing form for user submissions

- [x] Create public form page (`/comment/[slug]`)
  - [x] Validate slug and load project
  - [x] 404 handling for invalid/archived projects
- [x] Build form UI components
  - [x] Full name input with validation
  - [x] Social handle input (optional)
  - [x] Comment textarea with character counter
  - [x] Photo upload component
  - [x] Video upload component
  - [x] Submit button with loading states
- [x] Implement file upload to Supabase Storage
  - [x] Configure storage bucket with security rules
  - [x] Handle file size validation (10MB max for photos/videos)
  - [x] Handle file type validation (images and videos)
  - [x] Upload progress indicator
  - [x] Mobile camera integration
- [x] Create submissions API routes
  - [x] POST endpoint to create submission
  - [x] Validation middleware
  - [ ] Rate limiting (prevent spam)
  - [x] Error handling
- [x] Build confirmation screen
  - [x] Success message with user's name
  - [x] "Submit Another" functionality
  - [x] Error states with retry option
- [x] Add form validation
  - [x] Client-side validation (Zod schema)
  - [x] Server-side validation
  - [x] Display error messages
- [x] Test mobile responsiveness
- [x] Test submission flow end-to-end
- [x] Apply presentation config styles to comment page header

**Deliverable:** Fully functional public submission form ✅ COMPLETE

---

### Phase 4: Client Review Interface ✓
**Goal:** Build the review dashboard for approving/declining submissions

- [x] Create review page (`/review/[slug]`)
  - [x] Validate slug and load project
  - [x] Fetch all submissions for project
- [x] Implement tab navigation
  - [x] Pending tab (default)
  - [x] Approved tab
  - [x] Declined tab
  - [x] Deleted tab
  - [x] Archived tab
- [x] Build submission card component
  - [x] Display all submission fields
  - [x] Photo/video thumbnail with lightbox
  - [x] Action buttons (Approve, Decline, Delete, Archive)
  - [x] Timestamp display
- [x] Implement status change functionality
  - [x] API routes for updating submission status
  - [x] Optimistic UI updates
  - [x] Confirmation modals for destructive actions
- [x] Add inline editing for approved posts
  - [x] Display mode toggle (Once/Repeat)
  - [x] Custom timing input
  - [x] Auto-save on change
- [x] Implement real-time updates
  - [ ] Supabase real-time subscription
  - [x] Poll every 10 seconds as fallback
  - [ ] Show notification for new submissions
- [ ] Add bulk actions
  - [ ] Multi-select checkboxes
  - [ ] Bulk approve/decline/delete
- [ ] Create submission detail modal
  - [ ] Full-screen view
  - [ ] All metadata display
  - [ ] Navigation between submissions
- [ ] Implement drag-and-drop reordering for approved posts
  - [ ] Save custom order to database
- [x] Add search and filter functionality
  - [x] Search by name or comment text
  - [x] Filter by date range
- [ ] Build global settings panel
  - [ ] Default display mode setting
  - [ ] Export to CSV functionality
- [x] Test review workflow thoroughly

**Deliverable:** Complete review and approval system (Core functionality complete, advanced features pending)

---

### Phase 5: Presentation Display ✓
**Goal:** Build the public presentation page that cycles through approved posts

- [x] Create presentation page (`/present/[slug]`)
  - [x] Validate slug and load project
  - [x] Load presentation_config
  - [x] Fetch all approved submissions
- [x] Implement layout templates
  - [x] Standard (text + photo)
  - [x] Text-only (no photo)
  - [x] Photo-focused (minimal text)
  - [x] Dynamic template selection based on submission content
- [x] Build slide component
  - [x] Apply dynamic styling from config
  - [x] Text with configurable font/color/outline
  - [x] Background color or photo
  - [x] Responsive layout
- [x] Implement slideshow logic
  - [x] Auto-advance based on timing
  - [x] Infinite loop for "repeat" posts
  - [x] Skip "once" posts after first display
  - [x] Respect custom timing overrides
- [x] Add transitions and animations
  - [x] Fade transition
  - [x] Slide transition
  - [x] Zoom transition
  - [x] GPU-accelerated CSS animations
- [x] Implement real-time updates
  - [x] Poll for new approved submissions every 30 seconds
  - [x] Seamlessly add new posts to rotation (background API polling without page reload)
- [x] Add fullscreen functionality
  - [x] Auto-enter fullscreen on load (with permission)
  - [x] Fullscreen API integration
- [x] Create holding screen for empty state
  - [x] "Check back soon" message
  - [x] Branded design
- [x] Optimize performance
  - [x] Preload next 3 images
  - [x] Next.js Image optimization
  - [x] Lazy load videos with autoplay
- [x] Add optional keyboard controls
  - [x] Spacebar: Toggle fullscreen
  - [x] Arrow keys: Manual navigation
  - [x] Hidden from UI (for admin testing)
- [x] Test on multiple screen sizes and resolutions
  - [x] 1080p displays (standard 1.0x scaling)
  - [x] 4K displays (1.5x scaling for readability)
  - [x] Portrait orientation (optimized vertical layout)
  - [x] Ultra-wide displays (narrower card width)
  - [x] Smaller screens < 1920px (0.8x scaling)
  - [x] Responsive utility hook for screen detection
  - [x] Dynamic scaling based on resolution
  - [x] Testing documentation created (RESPONSIVE_TESTING.md)
- [ ] Test long-running stability (6+ hours continuous)

**Deliverable:** Fully functional presentation display system (Core complete, optimization pending)

---

### Phase 5.2: Admin Dashboard UI Improvements
**Goal:** Implement user feedback into the admin dashboard with improved UX

#### A. Project Management Enhancements ✅
- [x] Implement project archiving functionality
  - [x] Add `archived_at` timestamp tracking to projects table (already exists in schema)
  - [x] Update project status to reflect archived state
  - [x] Add Archive/Reactivate button in project edit page
  - [x] Add confirmation modal for archive action
  - [x] Update project card UI to show "Archived" badge/indicator
  - [x] Filter archived projects in projects list (show/hide toggle or separate tab)
  - [x] Block public access to archived project pages
    - [x] Comment page (`/comment/[slug]`) shows "This project is no longer available" message
    - [x] Presentation page (`/present/[slug]`) shows "This project is no longer available" message
  - [x] Allow admins to view archived projects and submissions in read-only mode

- [x] Implement project deletion functionality
  - [x] Add Delete button in project edit page (separate from archive)
  - [x] Add confirmation modal with warning: "This action cannot be undone. This will permanently delete the project and all associated submissions."
  - [x] Require typing project name to confirm deletion
  - [x] Create API endpoint to delete project and cascade delete all submissions
  - [x] Delete associated media files from Supabase Storage
  - [x] Redirect to projects list after successful deletion

- [x] Add URL copy functionality to project cards
  - [x] Add "Copy" button next to comment URL on project card
  - [x] Add "Copy" button next to presentation URL on project card
  - [x] Show success toast/snackbar when URL is copied
  - [x] Match the copy button style from QR page

#### B. Review Interface Improvements ✅
- [x] Update submission card button styling
  - [x] Change Approve button from primary to standard (match Decline/Delete buttons)
  - [x] Ensure consistent button styling across all actions

- [x] Implement badge counts on all tabs
  - [x] Fetch counts for all tabs (Pending, Approved, Declined, Archived, Deleted)
  - [x] Display badge with count on each tab, even when count is 0
  - [x] Update counts in real-time when submissions change status
  - [x] Create API endpoint to fetch all counts efficiently

- [x] Add real-time pending submission notifications
  - [x] Poll for new pending submissions while on review page
  - [x] Show in-app toast/snackbar notification when new pending submissions arrive
  - [x] Notification message: "X new pending submission(s) received"
  - [x] Clicking notification refreshes pending tab
  - [x] Poll interval: 10-15 seconds (configurable)

#### C. Project Edit Page Reorganization ✅
- [x] Reorder form sections in project edit page
  - [x] Move Preview section directly under Font section
  - [x] Keep Preview section above Background section
  - [x] Maintain logical flow: Details → Fonts → Preview → Background → Timing/Animation

- [x] Add randomize posts toggle
  - [x] Add toggle control: "Randomize post order" (default: off)
  - [x] Add to `presentation_config` table: `randomize_order` boolean field
  - [x] Update project edit form to save randomize setting
  - [x] Update presentation page to shuffle submissions on load when enabled
  - [x] Shuffle maintains consistent order during single session
  - [x] Re-shuffle on each new page load/session

#### D. Video Upload Enhancements ✅
- [x] Add video duration detection and validation
  - [x] Detect video duration client-side using HTML5 Video API
  - [x] Display video duration in upload summary (e.g., "video.mp4 - 8.5s")
  - [x] Add `max_video_duration` field to `presentation_config` table (default: 12)

- [x] Add max video duration control in admin
  - [x] Add input field in project edit page: "Max video length (seconds)"
  - [x] Place below "Allow video uploads on submission form" toggle
  - [x] Default value: 12 seconds
  - [x] Validation: must be between 1-60 seconds
  - [x] Save to `presentation_config.max_video_duration`

- [x] Update comment form with video duration validation
  - [x] Fetch max_video_duration from project config
  - [x] Show helper text: "Videos must be [X] seconds or less"
  - [x] Validate video duration before upload
  - [x] Show error if video exceeds limit: "Your video is [Y]s long. Please upload a video that's [X]s or less."
  - [x] Prevent form submission if video is too long

- [x] Add video duration override toggle
  - [x] Add toggle in `presentation_config`: "Allow videos to finish before transition"
  - [x] Add to project edit page below max duration setting
  - [x] When enabled: if video duration > transition duration, extend slide duration to match video length
  - [x] When disabled: video loops/cuts off at transition time (current behavior)
  - [x] Update presentation slideshow logic to respect this setting

**Deliverable:** Polished admin dashboard with improved project management, better UX, and comprehensive video handling

---

### Phase 6: Polish, Testing & Deployment ✓
**Goal:** Finalize the application, fix bugs, and deploy to production

- [ ] Cross-browser testing
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Mobile browsers (iOS Safari, Chrome Android)
- [ ] Responsive design review
  - [ ] Test all pages on mobile, tablet, desktop
  - [ ] Ensure all admin pages work on mobile view correctly
  - [ ] Fix layout issues
- [ ] Accessibility audit
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility (where applicable)
  - [ ] Color contrast ratios
  - [ ] ARIA labels
- [ ] Performance optimization
  - [ ] Lighthouse audit (aim for 90+ scores)
  - [ ] Optimize bundle size
  - [ ] Code splitting
  - [ ] Image optimization review
- [ ] Security review
  - [ ] SQL injection prevention (Supabase handles this)
  - [ ] XSS prevention
  - [ ] CSRF protection (NextAuth handles this)
  - [ ] Rate limiting on public endpoints
  - [ ] File upload security
  - [ ] Environment variable security
- [ ] Error handling and logging
  - [ ] Set up error tracking (Sentry or similar)
  - [ ] Comprehensive error messages
  - [ ] Graceful degradation
- [ ] Write documentation
  - [ ] README with setup instructions
  - [ ] Admin user guide
  - [ ] API documentation
  - [ ] Deployment guide
- [ ] Set up CI/CD pipeline
  - [ ] GitHub Actions or Vercel integration
  - [ ] Automated testing
  - [ ] Automated deployments
- [ ] Configure production environment
  - [ ] Set up subdomain DNS
  - [ ] SSL certificate
  - [ ] Production Supabase project
  - [ ] Environment variables
- [ ] Deploy to production
  - [ ] Deploy to Vercel (recommended for Next.js)
  - [ ] Verify all features work in production
  - [ ] Load testing
- [ ] User acceptance testing (UAT)
  - [ ] Walk through all user flows with stakeholders
  - [ ] Gather feedback
  - [ ] Fix critical issues
- [ ] Create admin training materials
  - [ ] Video walkthrough or written guide
  - [ ] Best practices document
- [ ] Post-launch monitoring
  - [ ] Set up uptime monitoring
  - [ ] Monitor error rates
  - [ ] Monitor performance metrics

**Deliverable:** Production-ready application deployed and documented

---

### Phase 7: Future Enhancements (Post-MVP)
**Goal:** Additional features for future iterations

- [ ] Multi-team support
  - [ ] Team management interface
  - [ ] Team-based permissions
- [ ] Advanced analytics dashboard
  - [ ] Submission metrics over time
  - [ ] Popular presentation times
  - [ ] Engagement statistics
- [ ] Email notifications
  - [ ] Notify admins of new submissions
  - [ ] Daily summary emails
- [ ] Video upload support
  - [ ] Extend public form to accept videos
  - [ ] Video playback in presentation
  - [ ] Video compression/optimization
- [ ] Custom branding per project
  - [ ] Upload custom logos
  - [ ] Custom color schemes
  - [ ] White-label option for clients
- [ ] Social media integration
  - [ ] Auto-post approved submissions to Instagram/Twitter
  - [ ] Social media moderation tools
- [ ] Mobile app version
  - [ ] React Native app for easier submissions
  - [ ] Push notifications
- [ ] Advanced moderation tools
  - [ ] Profanity filter
  - [ ] AI-powered content moderation
  - [ ] Image recognition for inappropriate content
- [ ] Scheduling features
  - [ ] Schedule posts to go live at specific times
  - [ ] Event-based presentation switching
- [ ] Multi-language support
  - [ ] Internationalization (i18n)
  - [ ] Language selector

---

## Project Completion Checklist

### Phase 1: Foundation & Authentication ✅ COMPLETE
- [x] Next.js project initialized
- [x] Supabase configured
- [x] Database schema created
- [x] NextAuth.js installed and configured
- [x] Admin login page functional
- [x] Route protection working
- [x] Initial admin user created

### Phase 2: Admin Dashboard ✅ COMPLETE
- [x] Dashboard UI complete
- [x] Project creation form working
- [x] Presentation config form working
- [x] Project edit functionality working
- [x] QR code generation working
- [x] Project list with search/filter working
- [x] Archive/delete projects working
- [x] All API routes tested

### Phase 3: Public Form ✅ COMPLETE
- [x] Public form page accessible via slug
- [x] All form fields working
- [x] Photo upload working
- [x] Video upload working
- [x] Form validation working
- [x] Submission to database working
- [x] Confirmation screen working
- [x] Mobile responsive
- [x] Presentation config styles applied
- [ ] Rate limiting implemented

### Phase 4: Review Interface (Core Complete)
- [x] Review page accessible via slug
- [x] All tabs working (Pending/Approved/Declined/Deleted/Archived)
- [x] Submission cards displaying correctly
- [x] Status changes working
- [x] Inline editing working
- [x] Real-time updates working (polling implemented)
- [ ] Bulk actions working
- [x] Search/filter working (search by name, handle, comment)
- [ ] Drag-and-drop reordering working

### Phase 5: Presentation (Complete)
- [x] Presentation page accessible via slug
- [x] Dynamic styling from config working
- [x] All layout templates working
- [x] Slideshow logic working (auto-advance, timing, once/repeat modes)
- [x] Transitions/animations working (fade, slide, zoom)
- [x] Real-time updates working (30-second polling)
- [x] Fullscreen mode working (auto-enter + keyboard toggle)
- [x] Performance optimized (image preloading, Next.js Image, video preloading)
- [x] Tested on multiple displays (1080p, 4K, portrait, ultra-wide, responsive scaling)

### Phase 6: Polish & Deployment
- [ ] Cross-browser testing complete
- [ ] Responsive design verified
- [ ] Accessibility audit complete
- [ ] Performance optimized (Lighthouse 90+)
- [ ] Security review complete
- [ ] Error tracking set up
- [ ] Documentation written
- [ ] CI/CD pipeline configured
- [ ] Deployed to production
- [ ] UAT complete
- [ ] Monitoring set up

### Final Launch Checklist
- [ ] All features working in production
- [ ] Admin user guide delivered
- [ ] Training session completed
- [ ] Backup and recovery plan in place
- [ ] Support process defined
- [ ] Project handed off to client

---

## Success Metrics

**Technical Metrics:**
- Page load time < 2 seconds
- Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- Zero critical security vulnerabilities
- 99.9% uptime

**User Experience Metrics:**
- Submission form completion rate > 80%
- Average time to approve submission < 2 minutes
- Presentation runs continuously for 6+ hours without issues
- Mobile form usability score > 4.5/5

**Business Metrics:**
- Number of active projects
- Total submissions per project
- Approval rate
- Client satisfaction rating