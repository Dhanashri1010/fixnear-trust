import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check httpOnly cookies first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.',
      });
    }

    // Check if password was changed after token issuance (invalidate older sessions)
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed recently. Please sign in again.',
      });
    }

    // If user must change password, restrict access until updated
    if (user.mustChangePassword) {
      const allowedPaths = ['/api/auth/change-password', '/api/auth/logout', '/api/auth/me'];
      const currentPath = req.originalUrl ? req.originalUrl.split('?')[0] : req.path;
      if (!allowedPaths.includes(currentPath)) {
        return res.status(403).json({
          success: false,
          code: 'MUST_CHANGE_PASSWORD',
          message: 'You must set a new password before accessing the system.',
        });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${roles.join(' or ')} accounts.`,
      });
    }
    next();
  };
};
