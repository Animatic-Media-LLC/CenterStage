# Development Credentials

⚠️ **FOR DEVELOPMENT AND TESTING ONLY** ⚠️

## Backdoor Access (No Database Required)

A development-only backdoor has been added to allow testing the admin interface without setting up the database.

### Development Login Credentials

**Email:** `dev@test.com`
**Password:** `DevTest123!`

### How It Works

- The backdoor **ONLY works** when `NODE_ENV=development`
- It bypasses the database check completely
- Creates a mock user with:
  - ID: `dev-user-id`
  - Role: `super_admin`
  - Name: `Development User`

### To Use

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/admin/login

3. Login with:
   - Email: `dev@test.com`
   - Password: `DevTest123!`

4. You'll be redirected to the dashboard

### Security Notes

✅ **Safe for development:**
- Only works in development mode
- Will NOT work in production (NODE_ENV !== 'development')
- Logs a warning in the console when used

⚠️ **Important:**
- This is for testing UI/UX before database setup
- API routes that interact with the database will still fail (no real data)
- Remove or disable this before deploying to production

### Location in Code

The bypass logic is in: [src/auth.ts](src/auth.ts:68-82)

```typescript
// DEVELOPMENT ONLY: Bypass database for test user
if (
  process.env.NODE_ENV === 'development' &&
  email === 'dev@test.com' &&
  password === 'DevTest123!'
) {
  console.warn('⚠️  DEV MODE: Using development bypass credentials');
  return {
    id: 'dev-user-id',
    email: 'dev@test.com',
    name: 'Development User',
    role: 'super_admin',
  };
}
```

### What You Can Test

With these credentials you can:
- ✅ Access the admin login page
- ✅ Test the authentication flow
- ✅ Access the dashboard
- ✅ Navigate protected routes
- ✅ Test UI/UX of admin pages
- ✅ Test sign out functionality

### What Won't Work (Until Database is Set Up)

Without Supabase configured:
- ❌ Creating/editing projects (API calls will fail)
- ❌ Viewing project lists (no data to fetch)
- ❌ Any database operations

### Removing the Backdoor

Before deploying to production, either:

**Option 1: Remove the bypass code entirely**
Delete lines 68-82 in `src/auth.ts`

**Option 2: Add an environment flag**
Only enable if a specific env var is set:
```typescript
if (
  process.env.ENABLE_DEV_BYPASS === 'true' &&
  process.env.NODE_ENV === 'development' &&
  // ... rest of check
) {
  // bypass logic
}
```

Then never set `ENABLE_DEV_BYPASS=true` in production.

---

## Production Setup

Once you're ready to set up the real database:

1. Follow the [SETUP.md](SETUP.md) guide
2. Create a Supabase project
3. Run the database migrations
4. Create a real admin user
5. Use real credentials for login

The development backdoor will automatically be disabled in production (NODE_ENV=production).

---

**Created:** December 18, 2024
**Purpose:** Development and testing without database setup
**Status:** Active in development mode only
