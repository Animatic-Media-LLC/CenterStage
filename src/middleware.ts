import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware to protect admin routes
 * This runs on every request to check authentication
 */
export default NextAuth(authConfig).auth;

/**
 * Matcher configuration
 * Specifies which routes should be protected by the middleware
 */
export const config = {
  // Match all admin routes except login
  matcher: ['/admin/:path*'],
};
