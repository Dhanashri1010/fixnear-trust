import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import skillTestRoutes from './routes/skillTestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { authenticate, authorize } from './middleware/auth.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { User } from './models/User.js';
import { Provider } from './models/Provider.js';
import { Booking } from './models/Booking.js';
import { checkExpiredOffers } from './controllers/bookingController.js';
import { handleRazorpayWebhook } from './controllers/paymentController.js';
import { requestIdMiddleware, errorMonitoringMiddleware } from './middleware/errorMonitoring.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Known weak or example JWT secret values that must never be used in production
export const KNOWN_EXAMPLE_JWT_SECRETS = [
  'your_jwt_secret_key_minimum_32_characters_long',
  'super_secure_random_64_character_hex_secret_key_fixnear_trust_2026',
  'default_jwt_secret_key_for_development_purposes_only',
  'secret',
  'jwt_secret',
  'random_jwt_secret_key_change_in_production_1234567890',
  'test-jwt-secret-do-not-use-in-production-long-key-32',
];

// Enforce JWT_SECRET check
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is missing or shorter than 32 characters. Server refusing to start.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  const secretLower = process.env.JWT_SECRET.toLowerCase();
  const isKnownWeak = KNOWN_EXAMPLE_JWT_SECRETS.some(
    (weak) => secretLower === weak.toLowerCase() || secretLower.includes('super_secure_random_64_character') || secretLower.includes('your_jwt_secret_key')
  );
  if (isKnownWeak) {
    console.error('[FATAL SECURITY ERROR] JWT_SECRET equals a known weak example secret. In production, you MUST generate a cryptographically strong random secret.');
    process.exit(1);
  }
}

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
export const io = new SocketIOServer(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Helper to parse cookies from handshake headers
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  const cookies = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    const value = parts.slice(1).join('=').trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
};

// Socket.io: authenticate every socket connection from the cookie
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication failed: Missing token cookie'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('Authentication failed: User not found'));
    }

    if (user.isBlocked) {
      return next(new Error('Authentication failed: User account suspended'));
    }

    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('Authentication failed: ' + err.message));
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Authenticated client connected: ${socket.id} (${socket.user.email}, ${socket.user.role})`);

  // A user may only join their own user room
  socket.on('join_user', (userId) => {
    if (String(socket.user._id) === String(userId)) {
      socket.join(`user_${userId}`);
    } else {
      console.warn(`[Socket.io] User ${socket.user._id} attempted to join unauthorized user room: ${userId}`);
    }
  });

  // Providers room only if their role is provider and they are verified
  socket.on('join_providers', async (city) => {
    try {
      if (socket.user.role !== 'provider') return;
      const provider = await Provider.findOne({ userId: socket.user._id });
      if (provider && provider.status === 'approved') {
        const roomCity = (city || provider.city || 'mumbai').toLowerCase().trim();
        socket.join(`providers_${roomCity}`);
      }
    } catch (err) {
      console.warn('[Socket.io] Error in join_providers:', err.message);
    }
  });

  // A booking room only if they are the customer or provider of that booking (or admin)
  socket.on('join_booking', async (bookingId) => {
    try {
      if (!bookingId) return;
      const booking = await Booking.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(bookingId) ? bookingId : null },
          { bookingId: String(bookingId).toUpperCase() },
        ],
      });
      if (!booking) return;

      const isCustomer = String(booking.customerId) === String(socket.user._id);
      let isProvider = false;
      if (socket.user.role === 'provider') {
        const provider = await Provider.findOne({ userId: socket.user._id });
        if (provider && booking.providerId && String(booking.providerId) === String(provider._id)) {
          isProvider = true;
        }
      }
      const isAdmin = socket.user.role === 'admin';

      if (isCustomer || isProvider || isAdmin) {
        socket.join(`booking_${booking._id}`);
        socket.join(`booking_${booking.bookingId}`);
      } else {
        console.warn(`[Socket.io] User ${socket.user._id} unauthorized to join booking room: ${bookingId}`);
      }
    } catch (err) {
      console.warn('[Socket.io] Error in join_booking:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Security & Parsing Middlewares: Helmet with CSP allowing Vite and Razorpay
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://checkout.razorpay.com',
          'https://*.razorpay.com',
        ],
        frameSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',
          'https://*.razorpay.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://lumberjack.razorpay.com',
          'https://*.razorpay.com',
          'wss:',
          'ws:',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Request ID tracing middleware - mounts first to track all requests
app.use(requestIdMiddleware);

// Strict CORS whitelist from CLIENT_URL
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed.'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

// Webhook RAW body parser: MUST be mounted before express.json() to preserve byte-exact payload for HMAC
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize inputs to prevent NoSQL injection ($ and . stripping)
app.use(mongoSanitize());

// Request logging (morgan)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Apply rate limiting to all standard API routes
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', settingRoutes);
app.use('/api', serviceRoutes);
app.use('/api', providerRoutes);
app.use('/api', bookingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', supportRoutes);
app.use('/api', uploadRoutes);
app.use('/api', skillTestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', authenticate, authorize('admin'), adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'FixNear Trust API',
    version: '1.0.0',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`,
  });
});

// Central Error Handler & Monitoring - Safe structured JSON logs & optional SENTRY_DSN
app.use(errorMonitoringMiddleware);

export { app, server };

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[Server] FixNear Trust Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Server] Allowed CORS client: ${clientUrl}`);
  });

  // Background ticker: run every 10 seconds to check and handle expired offers (survives server restarts)
  setInterval(checkExpiredOffers, 10000);

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      if (io) {
        io.close();
        console.log('[Server] Socket.io server closed.');
      }
      try {
        await mongoose.connection.close();
        console.log('[Server] MongoDB connection closed.');
      } catch (err) {
        console.error('[Server Error] Error closing MongoDB connection:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}
