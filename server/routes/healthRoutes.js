import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const status = isConnected ? 200 : 503;
  res.status(status).json({
    status: isConnected ? 'ok' : 'degraded',
    service: 'FixNear Trust API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
  });
});

export default router;
