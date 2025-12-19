# Feedback Animatic - Setup Guide

This guide will help you set up the Feedback Animatic project for Phase 1 (Foundation & Authentication).

## Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Git installed

## Phase 1 Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (this may take a few minutes)
3. Go to Project Settings > API
4. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Environment
NODE_ENV=development
```

3. Generate a secure NextAuth secret:
```bash
openssl rand -base64 32
```
Copy the output and use it as your `NEXTAUTH_SECRET`.

### 4. Run Database Migrations

1. In your Supabase Dashboard, go to the SQL Editor
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/20231218000000_initial_schema.sql`
4. Paste it into the SQL Editor and click "Run"

This will create all the necessary tables, indexes, and security policies.

### 5. Create Initial Admin User

1. Generate a bcrypt hash for your admin password:
```bash
node scripts/generate-admin-hash.js YourSecurePassword123!
```

2. Copy the generated hash

3. In Supabase SQL Editor, run:
```sql
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@animatic.com',
    'paste_your_bcrypt_hash_here',
    'Admin User',
    'super_admin'
);
```

Or update the `supabase/seed.sql` file with the hash and run it in the SQL Editor.

### 6. Run Tests

Verify everything is working:

```bash
npm test
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 8. Test Authentication

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Sign in with:
   - Email: `admin@animatic.com`
   - Password: The password you used when generating the hash
3. You should be redirected to the dashboard at `/admin/dashboard`
4. Test the "Sign Out" button
5. Try accessing `/admin/dashboard` without being logged in - you should be redirected to login

## Project Structure

```
feedback-animatic/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin routes
│   │   │   ├── login/          # Login page
│   │   │   └── dashboard/      # Dashboard page
│   │   └── api/                # API routes
│   │       └── auth/           # NextAuth handlers
│   ├── components/             # React components
│   │   ├── ui/                 # UI components (Button, Input, etc.)
│   │   └── forms/              # Form components
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── types/                  # TypeScript types
│   ├── auth.config.ts          # NextAuth configuration
│   ├── auth.ts                 # NextAuth setup
│   └── middleware.ts           # Route protection middleware
├── supabase/
│   ├── migrations/             # Database migrations
│   └── seed.sql                # Seed data
├── scripts/                    # Utility scripts
└── .env.local                  # Environment variables (not in git)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint

## Troubleshooting

### "Invalid email or password" when logging in

- Verify the bcrypt hash was generated correctly
- Check that the user exists in the `users` table:
  ```sql
  SELECT * FROM users WHERE email = 'admin@animatic.com';
  ```
- Ensure the `NEXTAUTH_SECRET` is set in `.env.local`

### Database connection issues

- Verify your Supabase URL and keys are correct in `.env.local`
- Check that your Supabase project is active (not paused)
- Ensure you're using the correct anon key (not the service role key for client-side)

### Middleware not protecting routes

- Make sure `.env.local` is in the root directory
- Restart the development server after changing environment variables
- Check that `NEXTAUTH_URL` matches your local development URL

### Tests failing

- Run `npm install` to ensure all dependencies are installed
- Check that `jest.config.js` and `jest.setup.js` are in the root directory

## Next Steps

After completing Phase 1, you're ready to move on to Phase 2: Admin Dashboard & Project Management.

See the [PROJECT.md](.claude/PROJECT.md) file for the full roadmap and detailed feature specifications.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
