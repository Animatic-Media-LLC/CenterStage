# CenterStage Admin Guide

Complete guide for administrators managing customer testimonials and presentations.

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Managing Projects](#managing-projects)
- [Reviewing Submissions](#reviewing-submissions)
- [Presentation Display](#presentation-display)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. You'll be redirected to the dashboard

### Dashboard Overview

The dashboard provides a quick overview of your system:

- **Total Projects**: All projects you've created
- **Active Projects**: Projects currently accepting submissions
- **Pending Submissions**: Awaiting your review
- **Approved Submissions**: Ready for presentation

---

## Managing Projects

### Creating a New Project

1. Click **"New Project"** from the dashboard or projects page
2. Fill in the required information:
   - **Project Name**: Internal identifier (e.g., "Summer Campaign 2024")
   - **Client Name**: Display name for presentations
   - **Slug**: URL-friendly identifier (auto-generated, can be customized)

3. Configure presentation settings:
   - **Font Family**: Choose from modern sans-serif options
   - **Font Size**: Base text size (adjusts based on content)
   - **Text Color**: Main text color
   - **Outline Color**: Text outline for better contrast
   - **Background**: Solid color or custom image
   - **Transition Duration**: Time each slide displays (5-15 seconds recommended)
   - **Animation Style**: Fade, slide, or zoom transitions

4. Configure submission form options:
   - **Allow Video Uploads**: Enable/disable video submissions
   - **Max Video Duration**: Limit video length (1-60 seconds)
   - **Allow Videos to Finish**: Extend slide duration to match video length
   - **Require Email**: Make email field required on submission form

5. Click **"Create Project"** to save

### Editing a Project

1. Go to **Projects** page
2. Click **"Edit"** on the project card
3. Modify any settings
4. Preview changes in real-time
5. Click **"Save Changes"**

**Important URLs:**
- **Comment Form**: `/comment/[slug]` - Share this with customers
- **Presentation**: `/present/[slug]` - Use for public display
- **QR Code**: `/admin/projects/[slug]/qr` - Print or share for easy access

### Project Actions

**Archive a Project**
- Stops accepting new submissions
- Hides from public view
- Preserves all data
- Can be reactivated later

**Delete a Project**
- ⚠️ **PERMANENT ACTION** - Cannot be undone
- Removes all submissions and media
- Requires typing project name to confirm
- Use only when absolutely necessary

---

## Reviewing Submissions

### Accessing the Review Interface

1. From **Projects** page, click **"Review"** on any project
2. Or from project edit page, click **"Review Submissions"**

### Submission Tabs

**Pending** (default)
- New submissions awaiting review
- Badge shows count of pending items
- Auto-refreshes every 12 seconds
- Notification appears when new submissions arrive

**Approved**
- Submissions ready for presentation
- Configure display settings:
  - **Display Mode**: Once (shows once then hidden) or Repeat (shows continuously)
  - **Custom Timing**: Override default slide duration

**Declined**
- Submissions you've chosen not to display
- Can be moved back to pending or approved

**Archived**
- Older submissions you want to keep but not display
- Useful for historical records

**Deleted**
- Soft-deleted submissions
- Can be restored if needed
- Permanently deleted when project is deleted

### Reviewing a Submission

Each submission card shows:
- **Full Name**: Customer's name
- **Social Handle**: Optional social media handle
- **Email**: If required and provided (not displayed publicly)
- **Comment**: Customer testimonial
- **Photo/Video**: Media attachment (if included)
- **Timestamp**: When submitted

### Taking Action

**Approve**
1. Click **"Approve"** button
2. Submission moves to Approved tab
3. Immediately available in presentation
4. Set display mode (Once or Repeat)
5. Optionally set custom timing

**Decline**
- Click **"Decline"** to move to Declined tab
- Not visible in presentation
- Can be approved later if reconsidered

**Archive**
- Click **"Archive"** to preserve without displaying
- Good for seasonal content you might use again

**Delete**
- Click **"Delete"** to soft-delete
- Can be restored from Deleted tab
- Media files remain until project deletion

### Search and Filter

- **Search**: Find submissions by name or comment text
- **Filter by Date**: View submissions from specific time periods

### Downloading and Exporting

**Download Individual Media**
- Click the download icon on any photo or video
- Files are named with submitter's name for easy organization
- Downloads directly to your browser's download folder

**Download All Media (ZIP)**
1. Click **"Download All Media"** button at the top of the review interface
2. System collects all photos and videos from all submission statuses
3. Files are organized in a ZIP archive named `[project-slug]_media.zip`
4. Each file is named: `[Full_Name]_[submission-id].jpg` or `.mp4`
5. Download starts automatically when ready

**Export Comments to Excel**
1. Click **"Export Comments"** button at the top of the review interface
2. Select which submission types to include:
   - **Pending** (default: selected)
   - **Approved** (default: selected)
   - **Declined**
   - **Archived**
   - **Deleted**
3. Click **"Export"** to generate the file
4. Excel file downloads as `[project-slug]_comments.xlsx`

**Excel Export Columns:**
- Full Name
- Date Posted
- Date Approved (if applicable)
- Social Handle
- Comment
- Email (if collected)
- Status

**Use Cases for Exporting:**
- Create backup of all testimonials
- Share with marketing team
- Include in reports or presentations
- Archive campaign results
- Follow up with email addresses
- Analyze submission patterns and timing

---

## Presentation Display

### Setting Up a Presentation

1. Create and configure your project
2. Review and approve submissions
3. Navigate to `/present/[slug]`
4. Press **Spacebar** to enter fullscreen (recommended)

### How Presentations Work

**Automatic Slideshow**
- Cycles through approved submissions
- Each slide displays for configured duration
- Smooth transitions between slides
- Infinite loop continues until stopped

**Display Modes**
- **Repeat**: Slides appear every cycle (default)
- **Once**: Slides appear once, then hidden from rotation
  - Automatically resets after all "once" slides shown
  - Useful for limited-time messages

**Custom Timing**
- Override default duration for specific slides
- Set timing between 1-30 seconds
- Useful for longer testimonials or videos

**Video Handling**
- Videos auto-play when slide appears
- Can extend slide duration to match video length
- Videos loop if shorter than slide duration
- Muted by default for ambient display

### Presentation Controls

**Keyboard Shortcuts** (hidden from UI):
- **Spacebar**: Toggle fullscreen
- **Right Arrow**: Next slide (manual control)
- **Left Arrow**: Previous slide (manual control)

**Real-Time Updates**
- Polls for new approved submissions every 30 seconds
- Automatically adds new content to rotation
- No need to refresh page

### Optimal Display Settings

**Screen Resolution**
- Automatically adapts to any screen size
- Optimized for 1080p and 4K displays
- Supports portrait and landscape orientation

**Best Practices**
- Use fullscreen mode for cleaner display
- Test on actual display device before event
- Ensure stable internet connection for real-time updates
- Preview presentation before sharing publicly

---

## Best Practices

### Project Setup

✅ **Do:**
- Use descriptive project names for easy identification
- Choose readable fonts and high-contrast colors
- Test presentation on actual display before event
- Set appropriate transition duration (7-10 seconds is typical)
- Enable email collection if you want to follow up with customers

❌ **Don't:**
- Use overly long project names
- Choose text colors too similar to background
- Set transitions too fast (under 5 seconds)
- Allow videos over 15 seconds (loses audience attention)

### Reviewing Submissions

✅ **Do:**
- Review submissions promptly (within 24-48 hours)
- Look for genuine, specific testimonials
- Ensure photos/videos are appropriate and clear
- Check for spelling/grammar in comments
- Keep a mix of text-only and media-rich submissions

❌ **Don't:**
- Approve submissions with inappropriate content
- Let pending queue grow too large
- Approve duplicate submissions
- Ignore the quality of photos/videos

### Content Curation

✅ **Do:**
- Maintain variety in approved submissions
- Feature different aspects of your product/service
- Include diverse customer perspectives
- Update content regularly to keep fresh
- Use "Once" mode for time-sensitive testimonials

❌ **Don't:**
- Approve only similar testimonials
- Let presentations become stale
- Display low-quality or unclear media
- Overwhelm audience with too many slides

### Presentation Management

✅ **Do:**
- Test presentation before public display
- Monitor presentation during events
- Keep an eye on pending notifications
- Archive old projects when done
- Document successful configurations for future projects

❌ **Don't:**
- Leave presentation unmonitored during events
- Forget to approve new submissions during active campaigns
- Delete projects immediately after events (archive first)
- Use same slug for different projects

---

## Troubleshooting

### Common Issues

**Problem**: Can't log in to admin panel
- **Solution**: Verify credentials, clear browser cache, check caps lock

**Problem**: Submissions not appearing in presentation
- **Solution**: Ensure submission is approved, check it's set to "Repeat" mode, verify presentation is on correct project slug

**Problem**: Photos/videos not displaying
- **Solution**: Check file format (JPEG, PNG, WebP for images; MP4, MOV, WebM for videos), verify file size under limit, ensure stable internet connection

**Problem**: Presentation not updating with new approvals
- **Solution**: Wait 30 seconds for auto-refresh, manually refresh page if needed, check internet connection

**Problem**: QR code not working
- **Solution**: Ensure project is not archived, verify correct URL is embedded, test QR code with different scanners

**Problem**: Video duration validation failing
- **Solution**: Check video length against max duration setting, try re-encoding video at lower quality, ensure video file is properly formatted

### Getting Help

If you encounter issues not covered here:

1. Check browser console for errors (F12 in most browsers)
2. Verify internet connection is stable
3. Try different browser (Chrome, Firefox, Safari recommended)
4. Clear browser cache and cookies
5. Contact your system administrator

---

## Tips for Success

### Running a Successful Campaign

1. **Pre-Event Setup**
   - Create project 1-2 weeks before event
   - Test submission form with sample data
   - Configure presentation settings
   - Generate and print QR codes

2. **During Event**
   - Monitor pending submissions regularly
   - Approve high-quality submissions quickly
   - Keep presentation display running in fullscreen
   - Have staff encourage submissions with QR codes

3. **Post-Event**
   - Review all submissions within 48 hours
   - Export comments to Excel for records and analysis
   - Download all media files as backup
   - Archive project when campaign ends
   - Analyze what worked well for next time

### Maximizing Submissions

- **Make it easy**: QR codes at point of purchase/service
- **Incentivize**: Offer small reward for submissions
- **Be responsive**: Approve good submissions quickly
- **Show results**: Display presentation where customers can see it
- **Follow up**: Use email collection to thank participants

### Content Quality Guidelines

**Good Testimonials:**
- Specific details about experience
- Genuine emotion and authenticity
- Clear, well-lit photos
- Short, focused videos (under 10 seconds)
- Professional language

**Red Flags:**
- Generic or vague comments
- Promotional or sales language
- Low-quality or unclear media
- Duplicate submissions
- Inappropriate content

---

## Quick Reference

### Important URLs

- Admin Login: `/admin/login`
- Dashboard: `/admin/dashboard`
- Projects: `/admin/projects`
- Submission Form: `/comment/[slug]`
- Presentation: `/present/[slug]`
- QR Code: `/admin/projects/[slug]/qr`

### File Limits

- Photos: 10MB max (JPEG, PNG, WebP, HEIC)
- Videos: 10MB max (MP4, MOV, WebM)
- Background Images: 5MB max
- Video Duration: Configurable (default 12 seconds)

### Rate Limits

- Public submissions: 5 per minute per IP address
- Designed to prevent spam and abuse

### Submission Status Flow

```
Pending → Approved → Displayed in Presentation
         ↓
       Declined → Can be Approved
         ↓
       Archived → Historical storage
         ↓
       Deleted → Soft-deleted (recoverable)
```

---

## Security & Privacy

### Data Protection

- All passwords are securely hashed
- Environment variables keep secrets safe
- File uploads validated for type and size
- Rate limiting prevents abuse
- Admin access protected by authentication

### Privacy Considerations

- Email addresses (if collected) are never displayed publicly
- Customers can choose not to provide email
- Photos/videos uploaded are public once approved
- Consider GDPR/privacy laws in your jurisdiction
- Provide privacy policy if collecting personal data

---

## Version History & Updates

This guide is for CenterStage v1.0. Check with your administrator for:
- Latest features and updates
- Custom configurations for your organization
- Additional training resources
- API documentation (if using integrations)

---

**Need More Help?**

For technical support or feature requests, contact your system administrator or refer to the main project documentation.
