import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session type
   */
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'super_admin';
    } & DefaultSession['user'];
  }

  /**
   * Extends the built-in user type
   */
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'super_admin';
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the JWT type
   */
  interface JWT {
    id: string;
    role: 'admin' | 'super_admin';
  }
}
