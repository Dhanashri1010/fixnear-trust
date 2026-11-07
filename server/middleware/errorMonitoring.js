import crypto from 'crypto';
import https from 'https';
import url from 'url';

/**
 * Sensitive field names that must NEVER be logged or leaked into telemetry.
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'token',
  'jwt',
  'secret',
  'authorization',
  'cookie',
  'card',
  'cardnumber',
  'creditcard',
  'cvv',
  'cvc',
  'pan',
  'accountnumber',
  'otp',
  'completionotp',
  'razorpay_signature',
  'razorpay_key_secret',
  'webhook_secret',
]);

/**
 * Deep redaction helper that removes passwords, tokens, API keys, and card numbers.
 */
export const redactSensitiveData = (data) => {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact 13-19 digit credit card numbers
    let sanitized = data.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[CARD_REDACTED]');
    // Redact Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [TOKEN_REDACTED]');
    // Redact JWT patterns
    sanitized = sanitized.replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, '[JWT_REDACTED]');
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === 'object') {
    // Buffer handling
    if (Buffer.isBuffer(data)) return '[BINARY_BUFFER]';

    const redactedObj = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lowerKey)) {
        redactedObj[key] = '[REDACTED]';
      } else {
        redactedObj[key] = redactSensitiveData(value);
      }
    }
    return redactedObj;
  }

  return data;
};

/**
 * Express Request ID Middleware
 * Ensures every incoming request carries a unique tracing ID across all logs and response headers.
 */
export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId && typeof incomingId === 'string' ? incomingId : crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

/**
 * Dispatches an error event to Sentry DSN if configured, using standard HTTPS.
 * Runs completely non-blocking without external SDK dependencies.
 */
export const dispatchToSentry = (err, req, requestId) => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    const parsed = new url.URL(dsn);
    const publicKey = parsed.username;
    const host = parsed.host;
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const projectId = pathParts[0];

    if (!publicKey || !host || !projectId) {
      console.warn('[Monitoring] Invalid SENTRY_DSN format.');
      return;
    }

    const eventPayload = JSON.stringify({
      event_id: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date().toISOString(),
      platform: 'node',
      level: 'error',
      server_name: 'fixnear-trust-backend',
      environment: process.env.NODE_ENV || 'development',
      tags: {
        requestId,
        method: req?.method,
        path: req?.originalUrl || req?.url,
      },
      exception: {
        values: [
          {
            type: err.name || 'Error',
            value: err.message || 'Unknown error',
            stacktrace: err.stack ? { frames: [] } : undefined,
          },
        ],
      },
      request: req
        ? {
            url: `${req.protocol || 'http'}://${req.get?.('host') || 'localhost'}${req.originalUrl || req.url}`,
            method: req.method,
            headers: redactSensitiveData(req.headers),
            query_string: redactSensitiveData(req.query),
          }
        : undefined,
    });

    const options = {
      hostname: host,
      path: `/api/${projectId}/store/`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(eventPayload),
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=fixnear-monitor/1.0, sentry_key=${publicKey}`,
      },
      timeout: 3000,
    };

    const sentryReq = https.request(options, (res) => {
      res.resume(); // consume response body to free memory
    });

    sentryReq.on('error', (dispatchErr) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[Monitoring] Failed to deliver event to Sentry:', dispatchErr.message);
      }
    });

    sentryReq.write(eventPayload);
    sentryReq.end();
  } catch (parseErr) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Monitoring] Sentry dispatch error:', parseErr.message);
    }
  }
};

/**
 * Express Error Monitoring Middleware
 * Formats errors into structured, sanitized JSON logs and surfaces request tracking IDs.
 */
export const errorMonitoringMiddleware = (err, req, res, next) => {
  const requestId = req?.id || crypto.randomUUID();
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const structuredLog = {
    timestamp: new Date().toISOString(),
    level: statusCode >= 500 ? 'error' : 'warn',
    requestId,
    method: req?.method,
    path: req?.originalUrl || req?.url,
    statusCode,
    error: {
      name: err.name || 'Error',
      message: err.message || 'Internal Server Error',
      stack: !isProd ? err.stack : undefined,
    },
    request: req
      ? {
          query: redactSensitiveData(req.query),
          body: redactSensitiveData(req.body),
          ip: req.ip,
        }
      : undefined,
    user: req?.user ? { id: req.user._id, role: req.user.role } : null,
  };

  // Structured JSON log output (only in non-test or when explicitly requested)
  if (!isTest) {
    console.error(JSON.stringify(structuredLog));
  }

  // Optional Sentry dispatch hook
  if (statusCode >= 500 && process.env.SENTRY_DSN) {
    dispatchToSentry(err, req, requestId);
  }

  const responseBody = {
    success: false,
    message: err.message || 'Internal Server Error',
    requestId,
  };

  if (!isProd && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

