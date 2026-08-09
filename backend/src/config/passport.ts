import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google profile'), false);

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // New Google user — default role SALES, no password needed
          user = await prisma.user.create({
            data: {
              name:     profile.displayName || email.split('@')[0],
              email,
              password: '', // No password for OAuth users
              role:     'SALES',
            },
          });
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
        );

        return done(null, { user, token } as any);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
