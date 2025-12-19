# Code Development Directives

This document contains mandatory coding standards and practices for AI agents (like Claude) when building features for the Feedback Animatic project.

---

## Core Principles

### 1. Type Safety First
- **ALWAYS** ensure TypeScript compiles without errors before considering a feature complete
- **NEVER** use `any` type - use `unknown` and type guards, or create proper types/interfaces
- **ALWAYS** define explicit return types for functions
- **ALWAYS** create TypeScript interfaces/types for:
  - Database models (mirror Supabase schema)
  - API request/response payloads
  - Component props
  - Form data structures
  - Configuration objects

```typescript
// ✅ GOOD
interface SubmissionFormData {
  fullName: string;
  socialHandle?: string;
  comment: string;
  photoFile?: File;
}

function handleSubmit(data: SubmissionFormData): Promise<void> {
  // implementation
}

// ❌ BAD
function handleSubmit(data: any) {
  // implementation
}
```

---

## Testing Requirements

### Unit Tests (MANDATORY)
- **ALWAYS** write unit tests for every new function, hook, or utility
- **MINIMUM** 80% code coverage for new code
- Test file naming: `[filename].test.ts` or `[filename].test.tsx`
- Place tests adjacent to the code they test

**Required test coverage:**
- ✅ All utility functions (100% coverage)
- ✅ All React hooks (happy path + error cases)
- ✅ All API route handlers (success + error responses)
- ✅ All form validation logic
- ✅ All data transformation functions
- ✅ Critical business logic (approval workflows, presentation logic)

**Testing frameworks:**
- **Unit Tests:** Jest + React Testing Library
- **API Tests:** Jest + Supertest (or Next.js API testing utilities)
- **E2E Tests (Phase 6):** Playwright or Cypress

**Example test structure:**
```typescript
// src/lib/utils/slugify.test.ts
import { slugify } from './slugify';

describe('slugify', () => {
  it('should convert project name to valid slug', () => {
    expect(slugify('America 2025')).toBe('america-2025');
  });

  it('should handle special characters', () => {
    expect(slugify('Test & Project!')).toBe('test-project');
  });

  it('should ensure uniqueness with suffix', () => {
    expect(slugify('test', ['test'])).toBe('test-1');
  });
});
```

### Integration Tests
- **ALWAYS** test API routes with actual Supabase calls (use test database)
- **ALWAYS** test authentication flows end-to-end
- **ALWAYS** test file upload/download workflows

### Before Committing
- ✅ Run `npm test` - all tests must pass
- ✅ Run `npm run build` - TypeScript must compile without errors
- ✅ Run `npm run lint` - no linting errors

---

## Code Quality Standards

### 1. Error Handling
**ALWAYS** handle errors gracefully:

```typescript
// ✅ GOOD - API Route
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Validate input
    const validated = submissionSchema.parse(data);

    // Business logic
    const result = await createSubmission(validated);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Submission creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ GOOD - React Component
function SubmissionForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: FormData) {
    try {
      setError(null);
      await submitToAPI(data);
      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error} />}
      {/* form fields */}
    </form>
  );
}
```

### 2. Validation (Zod)
**ALWAYS** use Zod for data validation:
- Client-side form validation
- API request validation
- Environment variable validation

```typescript
// src/lib/validations/submission.ts
import { z } from 'zod';

export const submissionSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  socialHandle: z.string()
    .max(30, 'Handle must be less than 30 characters')
    .regex(/^@?[\w]+$/, 'Invalid social handle format')
    .optional(),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters'),
  projectId: z.string().uuid('Invalid project ID'),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
```

### 3. Security
**MANDATORY security practices:**

- ✅ **NEVER** expose sensitive data in client-side code
- ✅ **ALWAYS** validate and sanitize user input (client AND server)
- ✅ **ALWAYS** use parameterized queries (Supabase handles this)
- ✅ **NEVER** trust client-side data - validate on server
- ✅ **ALWAYS** implement rate limiting on public endpoints
- ✅ **ALWAYS** use HTTPS URLs for external resources
- ✅ **NEVER** commit secrets (.env files in .gitignore)
- ✅ **ALWAYS** use Row Level Security (RLS) in Supabase
- ✅ **ALWAYS** validate file uploads (type, size, content)

```typescript
// ✅ GOOD - File validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a photo.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  return { valid: true };
}
```

### 4. Performance
**ALWAYS** consider performance:

- ✅ Use `React.memo()` for expensive components
- ✅ Use `useMemo()` and `useCallback()` appropriately (don't overuse)
- ✅ Implement pagination for large lists (20 items per page)
- ✅ Use Next.js `<Image>` component for all images
- ✅ Implement lazy loading for heavy components
- ✅ Use Suspense boundaries for async data
- ✅ Minimize bundle size - check imports (use tree-shaking)
- ✅ Debounce search inputs and frequent API calls
- ✅ Implement optimistic UI updates where appropriate

```typescript
// ✅ GOOD - Optimistic UI update
async function approveSubmission(id: string) {
  // Optimistic update
  setSubmissions(prev =>
    prev.map(s => s.id === id ? { ...s, status: 'approved' } : s)
  );

  try {
    await api.updateSubmissionStatus(id, 'approved');
  } catch (error) {
    // Revert on error
    setSubmissions(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'pending' } : s)
    );
    showError('Failed to approve submission');
  }
}
```

---

## React & Next.js Standards

### Component Structure
**ALWAYS** follow this order in components:
1. Imports
2. Type definitions
3. Component function
4. Hooks (useState, useEffect, custom hooks)
5. Event handlers
6. Render helpers
7. Return JSX

```typescript
// ✅ GOOD
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface SubmissionCardProps {
  submission: Submission;
  onApprove: (id: string) => void;
}

export function SubmissionCard({ submission, onApprove }: SubmissionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setIsLoading(true);
    try {
      await onApprove(submission.id);
    } finally {
      setIsLoading(false);
    }
  }, [submission.id, onApprove]);

  return (
    <div className="border rounded-lg p-4">
      <h3>{submission.fullName}</h3>
      <p>{submission.comment}</p>
      <Button onClick={handleApprove} disabled={isLoading}>
        Approve
      </Button>
    </div>
  );
}
```

### Server vs Client Components
- **DEFAULT**: Use Server Components
- **ONLY** add `'use client'` when you need:
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`)
  - Event handlers (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks

### API Routes
**ALWAYS** structure API routes like this:

```typescript
// app/api/submissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { updateSubmissionStatus } from '@/lib/db/submissions';

const updateSchema = z.object({
  status: z.enum(['pending', 'approved', 'declined', 'deleted', 'archived']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication (if required)
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate params
    const submissionId = params.id;
    if (!submissionId) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // 3. Validate request body
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // 4. Business logic
    const updated = await updateSubmissionStatus(
      submissionId,
      validated.status,
      session.user.id
    );

    // 5. Return response
    return NextResponse.json(updated);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update submission failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Database & Supabase

### Type Generation
**ALWAYS** generate TypeScript types from Supabase schema:

```bash
npx supabase gen types typescript --project-id [project-id] > src/types/database.types.ts
```

### Query Patterns
```typescript
// ✅ GOOD - Type-safe queries
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

async function getSubmissionsByProject(projectId: string): Promise<Submission[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }

  return data;
}
```

### Row Level Security
**ALWAYS** implement RLS policies in Supabase:

```sql
-- Example RLS policy for submissions
CREATE POLICY "Public can insert submissions"
ON submissions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
ON submissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update submissions"
ON submissions FOR UPDATE
TO authenticated
USING (true);
```

---

## File Organization

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   └── admin/
│   │       └── login/
│   │           └── page.tsx
│   ├── admin/                    # Protected admin routes
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   └── projects/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── projects/
│   │   └── submissions/
│   ├── comment/[slug]/           # Public submission form
│   ├── review/[slug]/            # Review interface
│   ├── present/[slug]/           # Presentation display
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Shared components
├── lib/                          # Utilities and configurations
│   ├── db/                       # Database queries
│   │   ├── projects.ts
│   │   └── submissions.ts
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Client-side
│   │   └── server.ts             # Server-side
│   ├── validations/              # Zod schemas
│   │   ├── submission.ts
│   │   └── project.ts
│   ├── utils/                    # Utility functions
│   │   ├── slugify.ts
│   │   └── formatters.ts
│   └── hooks/                    # Custom React hooks
│       ├── useSubmissions.ts
│       └── useProjects.ts
├── types/                        # TypeScript types
│   ├── database.types.ts         # Generated from Supabase
│   └── index.ts                  # Custom types
└── middleware.ts                 # Next.js middleware (auth)
```

---

## Naming Conventions

### Files
- Components: PascalCase - `SubmissionCard.tsx`
- Utilities: camelCase - `slugify.ts`
- API routes: lowercase - `route.ts`
- Types: PascalCase - `Submission.ts`

### Variables & Functions
- Variables: camelCase - `submissionData`
- Functions: camelCase - `handleSubmit`
- Constants: UPPER_SNAKE_CASE - `MAX_FILE_SIZE`
- Components: PascalCase - `SubmissionForm`
- Hooks: camelCase with `use` prefix - `useSubmissions`

### CSS/Tailwind
- Use Tailwind utility classes (no custom CSS unless necessary)
- Use `cn()` helper for conditional classes
- Group related classes: layout → spacing → typography → colors → effects

```typescript
// ✅ GOOD
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 gap-4",
  // Visual
  "border rounded-lg",
  "bg-white dark:bg-gray-800",
  // Conditional
  isActive && "ring-2 ring-blue-500"
)}>
```

---

## Git Commit Standards

**ALWAYS** follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(admin): add project creation form
fix(api): handle duplicate slug validation
test(submissions): add validation test coverage
docs(readme): update setup instructions
```

---

## Documentation Requirements

### Code Comments
**ONLY** add comments for:
- Complex business logic
- Non-obvious performance optimizations
- Workarounds for third-party bugs
- Public API functions (JSDoc)

```typescript
/**
 * Generates a unique slug from a project name
 *
 * @param name - The project name to convert
 * @param existingSlugs - Array of slugs already in use
 * @returns A URL-safe, unique slug
 *
 * @example
 * ```ts
 * slugify('America 2025', []) // 'america-2025'
 * slugify('test', ['test']) // 'test-1'
 * ```
 */
export function slugify(name: string, existingSlugs: string[] = []): string {
  // implementation
}
```

### README Files
**ALWAYS** include in component folders with complex logic:
- Purpose of the component
- Props/API documentation
- Usage examples
- Known limitations

---

## Accessibility (a11y)

**MANDATORY** accessibility requirements:

- ✅ All interactive elements are keyboard accessible
- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ✅ All images have `alt` text
- ✅ Forms have proper labels and ARIA attributes
- ✅ Color contrast meets WCAG AA standards (4.5:1 for text)
- ✅ Focus indicators are visible
- ✅ Use ARIA labels where semantic HTML isn't enough

```typescript
// ✅ GOOD
<button
  onClick={handleApprove}
  aria-label="Approve submission from John Doe"
  disabled={isLoading}
>
  {isLoading ? 'Approving...' : 'Approve'}
</button>

// ✅ GOOD
<img
  src={submission.photoUrl}
  alt={`Photo submitted by ${submission.fullName}`}
/>
```

---

## Before Marking a Feature Complete

**CHECKLIST** - All must be ✅:
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Code coverage is ≥80% for new code
- [ ] No linting errors (`npm run lint`)
- [ ] All error cases are handled
- [ ] Input validation is implemented (client + server)
- [ ] Loading and error states are shown in UI
- [ ] Accessibility requirements are met
- [ ] Performance is optimized (check bundle size)
- [ ] Security best practices are followed
- [ ] Code is documented where needed
- [ ] Manual testing completed (happy path + edge cases)
- [ ] Mobile responsive (if UI feature)

---

## Anti-Patterns to AVOID

### ❌ Never Do This

```typescript
// ❌ Using 'any'
function processData(data: any) { }

// ❌ Ignoring errors
fetch('/api/data').then(res => res.json());

// ❌ No validation
export async function POST(request: Request) {
  const data = await request.json();
  await saveToDatabase(data); // Unsafe!
}

// ❌ Inline styles (use Tailwind)
<div style={{ color: 'red' }}>Error</div>

// ❌ Non-semantic HTML
<div onClick={handleClick}>Click me</div>

// ❌ Missing error boundaries
function App() {
  return <ComponentThatMightCrash />;
}

// ❌ Hardcoded values
const apiUrl = 'https://api.example.com';

// ❌ Direct DOM manipulation
document.getElementById('myDiv').innerHTML = data;
```

### ✅ Do This Instead

```typescript
// ✅ Proper typing
interface UserData {
  name: string;
  email: string;
}
function processData(data: UserData) { }

// ✅ Error handling
try {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
} catch (error) {
  console.error('Error fetching data:', error);
}

// ✅ Validation
export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body);
  await saveToDatabase(validated);
}

// ✅ Tailwind classes
<div className="text-red-500">Error</div>

// ✅ Semantic HTML
<button onClick={handleClick}>Click me</button>

// ✅ Error boundary
<ErrorBoundary fallback={<ErrorScreen />}>
  <ComponentThatMightCrash />
</ErrorBoundary>

// ✅ Environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ React state
const [content, setContent] = useState('');
```

---

## Performance Budgets

**MANDATORY limits:**
- Bundle size: < 200KB (main bundle)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance Score: ≥ 90
- API response time: < 500ms (p95)

---

## When in Doubt

1. **Check the PROJECT.md** for project-specific requirements
2. **Follow Next.js best practices**: https://nextjs.org/docs
3. **Follow React best practices**: https://react.dev/
4. **Prioritize user experience** over clever code
5. **Ask for clarification** rather than making assumptions

---

## Summary: Golden Rules

1. ✅ **Type safety is non-negotiable** - No `any`, explicit types everywhere
2. ✅ **Test everything** - 80% coverage minimum, all critical paths tested
3. ✅ **Validate all input** - Never trust client data, use Zod
4. ✅ **Handle all errors** - No silent failures, user-friendly messages
5. ✅ **Security first** - Validate, sanitize, authenticate, authorize
6. ✅ **Performance matters** - Optimize images, lazy load, debounce
7. ✅ **Accessibility is required** - Keyboard nav, ARIA, semantic HTML
8. ✅ **Code must compile** - Zero TypeScript errors before completion
9. ✅ **Document complex logic** - JSDoc for public APIs
10. ✅ **Follow the checklist** - Don't skip steps, quality over speed

---

*This document is mandatory for all AI agents working on this project. Deviation requires explicit approval.*
