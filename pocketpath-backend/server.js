import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

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

// ─── Middleware ───────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'http://localhost:3000',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals',        goalRoutes);
app.use('/api/insights',     insightRoutes);
app.use('/api/reflect',      reflectRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ─── Health check ────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ message: 'PocketPath API is running 🚀' }));

// ─── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) user = await User.create({ name: profile.displayName, email: profile.emails[0].value, password: Math.random().toString(36), avatar: profile.photos[0]?.value });
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => done(null, await User.findById(id)));

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);