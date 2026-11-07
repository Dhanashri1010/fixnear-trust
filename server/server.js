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
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { User } from './models/User.js';
import { Provider } from './models/Provider.js';
import { Booking } from './models/Booking.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Enforce JWT_SECRET check
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is missing or shorter than 32 characters. Server refusing to start.');
  process.exit(1);
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

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging (morgan)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Apply rate limiting to all standard API routes
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api', providerRoutes);
app.use('/api', bookingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', supportRoutes);
app.use('/api', uploadRoutes);

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

// Central Error Handler - Never leaks stack traces in production
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const response = {
    success: false,
    message,
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
});

export { app, server };

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[Server] FixNear Trust Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Server] Allowed CORS client: ${clientUrl}`);
  });
}
