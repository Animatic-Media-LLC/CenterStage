  <img src="./public/animatic_logo.svg" alt="Animatic Logo" width="200" />

# CenterStage

> **Showcase customer testimonials in style** - A modern platform for collecting, curating, and displaying customer feedback in beautiful real-time presentations.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-green?logo=supabase)](https://supabase.com)

CenterStage is a comprehensive testimonial management system that allows businesses to collect customer feedback through QR codes and web forms, review and curate submissions through an admin interface, and display approved testimonials on beautiful, auto-rotating presentation screens.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Admin Guide](#admin-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Administrators
- 🎨 **Customizable Presentations** - Configure fonts, colors, backgrounds, and animations
- 📊 **Review Dashboard** - Approve, decline, archive, or delete submissions
- 🔔 **Real-time Notifications** - Get notified of new pending submissions
- 📱 **QR Code Generation** - Easy sharing for customer submissions
- 🎬 **Video Support** - Accept and display video testimonials with duration controls
- 📈 **Project Management** - Organize multiple campaigns with archiving and deletion
- 🎯 **Flexible Display Modes** - Show submissions once or on repeat

### For Customers
- 📸 **Photo & Video Uploads** - Share visual feedback
- ✍️ **Simple Form** - Name, comment, and optional social handle
- 📧 **Optional Email Collection** - Configurable per project
- 🎨 **Branded Experience** - Form styling matches presentation theme
- ⚡ **Instant Submission** - Quick and easy submission process

### Presentation Display
- 🎭 **Auto-rotating Slideshow** - Smooth transitions between testimonials
- 📺 **Fullscreen Mode** - Clean, distraction-free display
- 🔄 **Live Updates** - New approvals appear automatically
- 📱 **Responsive Design** - Optimized for any screen size or resolution
- 🎨 **Custom Styling** - Match your brand colors and fonts
- 🎬 **Smart Video Handling** - Auto-play with optional duration extension

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library with React Compiler
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[Material-UI (MUI)](https://mui.com)** - Component library
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[SCSS Modules](https://sass-lang.com)** - Scoped styling

### Backend & Database
- **[Supabase](https://supabase.com)** - PostgreSQL database and file storage
- **[NextAuth.js v5](https://next-auth.js.org)** - Authentication
- **[Zod](https://zod.dev)** - Schema validation

### Development Tools
- **[Jest](https://jestjs.io)** - Testing framework
- **[ESLint](https://eslint.org)** - Code linting
- **[TypeScript](https://www.typescriptlang.org)** - Static type checking

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Supabase Account** (free tier works)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd animatic-centerstage
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
AUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Database (Supabase Connection String)
DATABASE_URL=your_supabase_connection_string
```

**Getting Supabase Credentials:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key
4. Go to Project Settings → Database
5. Copy the connection string (use "Session" mode)

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

Run the database migrations in your Supabase SQL editor:

```bash
# Run migrations in order from supabase/migrations/
# Start with the earliest migration file
```

The migrations include:
- User authentication tables
- Projects and presentation config tables
- Submissions table with status management
- Storage buckets for photos and videos
- Row Level Security (RLS) policies

### 5. Configure Storage

In your Supabase project:

1. Go to **Storage**
2. Create a bucket named `submissions`
3. Set bucket to **Public**
4. Configure storage policies (already included in migrations)

### 6. Create Admin User

Run in Supabase SQL Editor:

```sql
-- Replace with your email and hashed password
INSERT INTO users (email, password, name, role)
VALUES (
  'admin@example.com',
  -- Generate password hash using bcrypt with 10 rounds
  '$2a$10$...',
  'Admin User',
  'admin'
);
```

**Generate password hash in Node.js:**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Access Admin Panel

Navigate to `/admin/login` and sign in with your admin credentials.

## 📁 Project Structure

```
animatic-centerstage/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard and management
│   │   │   ├── dashboard/     # Admin home page
│   │   │   ├── login/         # Admin authentication
│   │   │   └── projects/      # Project management
│   │   ├── api/               # API routes
│   │   │   ├── submissions/   # Submission CRUD
│   │   │   └── projects/      # Project CRUD
│   │   ├── comment/[slug]/    # Public submission form
│   │   ├── present/[slug]/    # Presentation display
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/
│   │   ├── admin/             # Admin-only components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   ├── presentation/      # Presentation slideshow
│   │   ├── review/            # Submission review interface
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── db/                # Database queries
│   │   ├── supabase/          # Supabase clients
│   │   ├── utils/             # Utility functions
│   │   └── validations/       # Zod schemas
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── auth.ts                # NextAuth configuration
├── supabase/
│   └── migrations/            # Database migration files
├── public/                    # Static assets
├── .env.local.example        # Environment template
├── ADMIN.md                  # Admin user guide
└── README.md                 # This file
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

### Supabase Storage Buckets

- **submissions** - Stores user-uploaded photos and videos
  - Max file size: 10MB
  - Allowed types: JPEG, PNG, WebP, HEIC (images), MP4, MOV, WebM (videos)
  - Public bucket for presentation display

### Security Features

- ✅ **Authentication** - NextAuth.js with session-based auth
- ✅ **CSRF Protection** - Built into NextAuth
- ✅ **XSS Prevention** - React auto-escaping
- ✅ **Rate Limiting** - 5 submissions/minute per IP
- ✅ **File Validation** - MIME type and size checking
- ✅ **SQL Injection Prevention** - Parameterized queries via Supabase
- ✅ **Environment Security** - Secrets in .env.local (gitignored)

## 📖 Admin Guide

For comprehensive admin documentation, see **[ADMIN.md](./ADMIN.md)**

Quick links:
- [Creating Projects](./ADMIN.md#creating-a-new-project)
- [Reviewing Submissions](./ADMIN.md#reviewing-submissions)
- [Presentation Setup](./ADMIN.md#setting-up-a-presentation)
- [Best Practices](./ADMIN.md#best-practices)
- [Troubleshooting](./ADMIN.md#troubleshooting)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/animatic-centerstage)

### Environment Variables for Production

Set these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (your production domain)

### Database Migration

Run all migrations in your production Supabase project in order:
1. `20250101_initial_schema.sql`
2. `20250115_phase_2_features.sql`
3. (Continue with remaining migrations...)

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support:
- Review the [Admin Guide](./ADMIN.md)
- Check [Project Documentation](./.claude/PROJECT.md)
- Contact your system administrator

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) by Vercel
- [Material-UI](https://mui.com) by MUI
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [NextAuth.js](https://next-auth.js.org) - Authentication for Next.js

---

**Made with ❤️ for showcasing customer testimonials**
