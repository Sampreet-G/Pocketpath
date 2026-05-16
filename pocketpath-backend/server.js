import express       from 'express';
import cors          from 'cors';
import dotenv        from 'dotenv';
import session       from 'express-session';
import passport      from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import connectDB         from './config/db.js';
import generateToken     from './utils/generateToken.js';
import User              from './models/User.model.js';

import authRoutes        from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import goalRoutes        from './routes/goal.routes.js';
import insightRoutes     from './routes/insight.routes.js';
import reflectRoutes     from './routes/reflect.routes.js';
import profileRoutes     from './routes/profile.routes.js';
import dashboardRoutes   from './routes/dashboard.routes.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'http://localhost:3000',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

const FRONTEND_URL = process.env.CLIENT_ORIGIN || 'https://pocketpathbysampreet.vercel.app';

// ─── Core middleware ──────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Session ─────────────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'pp-session-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

// ─── Passport ────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id).select('-password')); }
  catch (e) { done(e, null); }
});

// ─── Google OAuth ────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (_at, _rt, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), null);
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name:     profile.displayName || email.split('@')[0],
            email,
            password: Math.random().toString(36) + Math.random().toString(36),
            avatar:   avatar || '',
          });
        } else if (avatar && !user.avatar) {
          user.avatar = avatar;
          await user.save();
        }
        done(null, user);
      } catch (e) { done(e, null); }
    }
  ));

  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}?error=google_failed` }),
    (req, res) => {
      const token = generateToken(req.user._id);
      res.redirect(`${FRONTEND_URL}?token=${token}`);
    }
  );
} else {
  app.get('/api/auth/google',          (_req, res) => res.status(501).json({ message: 'GOOGLE_CLIENT_ID not set in .env' }));
  app.get('/api/auth/google/callback', (_req, res) => res.redirect(`${FRONTEND_URL}?error=google_not_configured`));
}

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals',        goalRoutes);
app.use('/api/insights',     insightRoutes);
app.use('/api/reflect',      reflectRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/dashboard',    dashboardRoutes);

app.get('/', (_req, res) => res.json({
  message: 'PocketPath API is running 🚀',
  google_oauth: !!(process.env.GOOGLE_CLIENT_ID),
}));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ configured' : '✗ not configured'}`);
});