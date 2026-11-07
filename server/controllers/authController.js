import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/emailHelper.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar,
      savedAddresses: user.savedAddresses,
    },
  });
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, city } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Never allow direct self-registration as admin
    const userRole = role === 'admin' ? 'customer' : role;

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone: phone || '',
      city: city || 'Mumbai',
    });

    // If registering as a provider, create corresponding provider profile
    if (userRole === 'provider') {
      await Provider.create({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        city: newUser.city,
        status: 'take_skill_test',
      });
    }

    sendTokenResponse(newUser, 201, res, 'Account created successfully!');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.',
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.',
      });
    }

    sendTokenResponse(user, 200, res, 'Signed in successfully!');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during sign in. Please try again.',
    });
  }
};

// Logout
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};

// Current Session (/me)
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let provider = null;

    if (user.role === 'provider') {
      provider = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        mustChangePassword: Boolean(user.mustChangePassword),
        savedAddresses: user.savedAddresses,
      },
      provider,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch session profile.',
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return 200 to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been dispatched.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    // Send email using resilient helper
    await sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.name,
      resetUrl,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been dispatched.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request.',
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendPasswordChangedEmail({ userEmail: user.email, userName: user.name }).catch(() => {});

    sendTokenResponse(user, 200, res, 'Password updated successfully! You are now logged in.');
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.',
    });
  }
};

// Change Password (authenticated)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    sendPasswordChangedEmail({ userEmail: user.email, userName: user.name }).catch(() => {});

    sendTokenResponse(user, 200, res, 'Password changed successfully! Other sessions have been logged out.');
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.',
    });
  }
};

// GET /api/auth/download-data (authenticated)
// Exports the user's profile, bookings, reviews and tickets as a JSON document
export const downloadMyData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let provider = null;
    let bookings = [];
    let reviews = [];
    let disputes = [];

    if (userRole === 'provider') {
      provider = await Provider.findOne({ userId });
      if (provider) {
        bookings = await Booking.find({ providerId: provider._id }).lean();
        reviews = await Review.find({ providerId: provider._id }).lean();
        disputes = await Dispute.find({ providerId: provider._id }).lean();
      }
    } else {
      bookings = await Booking.find({ customerId: userId }).lean();
      reviews = await Review.find({ customerId: userId }).lean();
      disputes = await Dispute.find({ customerId: userId }).lean();
    }

    const payload = {
      platform: 'FixNear Trust',
      exportedAt: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        savedAddresses: user.savedAddresses,
        createdAt: user.createdAt,
      },
      provider: provider
        ? {
            id: provider._id,
            category: provider.category,
            subcategories: provider.subcategories,
            experienceYears: provider.experienceYears,
            status: provider.status,
            ratingAvg: provider.ratingAvg,
            ratingCount: provider.ratingCount,
            completedJobsCount: provider.completedJobsCount,
            city: provider.city,
          }
        : null,
      bookingsCount: bookings.length,
      bookings,
      reviewsCount: reviews.length,
      reviews,
      ticketsCount: disputes.length,
      tickets: disputes,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="fixnear-data-export.json"');
    return res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/delete-account (authenticated, requires password)
// Anonymizes personal fields while retaining booking and payment financial records for accounting
export const deleteMyAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete your account.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password. Account deletion aborted.',
      });
    }

    // 1. Check for active bookings or unpaid completed jobs
    if (user.role === 'customer') {
      const activeBooking = await Booking.findOne({
        customerId: user._id,
        status: { $in: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'WORKING'] },
      });
      if (activeBooking) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete account while you have active bookings (Booking #${activeBooking.bookingId}). Please wait until the service is finished or cancelled.`,
        });
      }

      const unpaidBooking = await Booking.findOne({
        customerId: user._id,
        status: 'COMPLETED',
        paymentStatus: { $ne: 'PAID' },
      });
      if (unpaidBooking) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete account while you have unpaid completed bookings (Booking #${unpaidBooking.bookingId}). Please complete payment first.`,
        });
      }
    }

    let provider = null;
    if (user.role === 'provider') {
      provider = await Provider.findOne({ userId: user._id });
      if (provider) {
        const activeJob = await Booking.findOne({
          providerId: provider._id,
          status: { $in: ['ACCEPTED', 'ON_THE_WAY', 'WORKING'] },
        });
        if (activeJob) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete account while you have active jobs assigned (Booking #${activeJob.bookingId}). Please complete or release the job first.`,
          });
        }

        const unpaidJob = await Booking.findOne({
          providerId: provider._id,
          status: 'COMPLETED',
          paymentStatus: { $ne: 'PAID' },
        });
        if (unpaidJob) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete account while there are unpaid completed bookings awaiting settlement.',
          });
        }
      }
    }

    // 2. Anonymize user record
    const anonymizedEmail = `deleted-${user._id}@deleted.fixnear.local`;
    user.name = 'Deleted User';
    user.email = anonymizedEmail;
    user.phone = '0000000000';
    user.avatar = '';
    user.savedAddresses = [];
    user.isBlocked = true;
    user.blockedReason = 'Account self-deleted and anonymized upon user request.';
    user.passwordChangedAt = new Date();
    await user.save();

    // 3. Anonymize provider record if applicable
    if (provider) {
      provider.name = 'Deleted Provider';
      provider.email = anonymizedEmail;
      provider.phone = '0000000000';
      provider.isOnline = false;
      provider.status = 'suspended';
      provider.idProofUrl = '';
      provider.idProofPublicId = '';
      provider.certificateUrl = '';
      provider.certificatePublicId = '';
      provider.avatar = '';
      await provider.save();
    }

    // 4. Anonymize personal info in booking history while preserving amounts/timestamps for accounting
    if (user.role === 'customer') {
      await Booking.updateMany(
        { customerId: user._id },
        {
          $set: {
            customerName: 'Deleted User',
            customerPhone: '0000000000',
            address: 'Redacted (Account Deleted)',
            notes: '',
            photos: [],
          },
        }
      );
      await Review.updateMany(
        { customerId: user._id },
        {
          $set: {
            authorName: 'Deleted User',
            customerName: 'Deleted User',
            photos: [],
          },
        }
      );
    } else if (provider) {
      await Booking.updateMany(
        { providerId: provider._id },
        {
          $set: {
            providerName: 'Deleted Provider',
            providerPhone: '0000000000',
          },
        }
      );
    }

    // 5. Append-only audit record
    await AuditLog.create({
      adminId: user._id,
      adminName: 'Deleted User',
      adminEmail: anonymizedEmail,
      action: 'USER_ACCOUNT_DELETED_ANONYMIZED',
      targetType: 'User',
      targetId: String(user._id),
      details: {
        role: user.role,
        anonymizedAt: new Date(),
        reason: 'Self-requested user account deletion and data anonymization',
      },
      ipAddress: req.ip || '',
    });

    // 6. Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Your account has been deleted and all personal data anonymized.',
    });
  } catch (err) {
    next(err);
  }
};
