import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { dbOperations } from '@/lib/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      const existingUser = await dbOperations.getUserByEmail(user.email);
      if (!existingUser) {
        await dbOperations.createGoogleUser(user.email, user.name || '', user.image || '');
      } else {
        await dbOperations.updateLastLogin(existingUser.id);
      }
      return true;
    },
    async session({ session }: any) {
      if (session.user) {
        const user = await dbOperations.getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
