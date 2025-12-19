import type { NextAuthConfig } from 'next-auth';

/**
 * NextAuth configuration
 * This file contains the core authentication configuration
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login');

      if (isOnAdmin) {
        if (isOnLogin) {
          // Allow access to login page
          return true;
        }
        // Redirect unauthenticated users to login page
        if (!isLoggedIn) return false;
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'super_admin';
      }
      return session;
    },
  },
  providers: [], // Will be added in auth.ts
} satisfies NextAuthConfig;
