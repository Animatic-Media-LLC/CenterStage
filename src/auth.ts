import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { createClient } from '@/lib/supabase/server';

/**
 * Login credentials validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * User type from database
 */
type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
};

/**
 * Retrieves user from database by email
 */
async function getUser(email: string): Promise<DbUser | null> {
  try {
    const supabase = await createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }

    return user as DbUser;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate credentials format
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          console.error('Invalid credentials format');
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // DEVELOPMENT ONLY: Bypass database for test user
        // WARNING: Remove this before production deployment!
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

        // Get user from database
        const user = await getUser(email);
        if (!user) {
          console.error('User not found');
          return null;
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordsMatch) {
          console.error('Invalid password');
          return null;
        }

        // Return user object (without password hash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
