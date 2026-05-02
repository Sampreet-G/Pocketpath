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
  'http://localhost:4173', // vite preview
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