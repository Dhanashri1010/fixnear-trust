import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';

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
        status: 'waiting_for_approval',
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

    // Send email using Nodemailer if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM || '"FixNear Trust" <noreply@fixnear.com>',
          to: user.email,
          subject: 'FixNear Trust - Password Reset Request',
          text: `Hello ${user.name},\n\nYou requested a password reset. Please click or open the following link to choose a new password (valid for 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. Your account remains safe.\n\nBest regards,\nFixNear Trust Team`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#1b4332;">FixNear Trust Password Reset</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested a password reset for your account. Click the button below to set a new password (valid for 30 minutes):</p>
            <div style="margin:24px 0;">
              <a href="${resetUrl}" style="background-color:#2d6a4f;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Reset Password</a>
            </div>
            <p style="color:#64748b;font-size:13px;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
            <p style="color:#64748b;font-size:13px;">If you did not make this request, please safely ignore this email.</p>
          </div>`,
        };

        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.warn('[Nodemailer Warning] Failed to dispatch password reset email:', mailErr.message);
      }
    } else {
      console.warn('[Nodemailer Warning] SMTP credentials (SMTP_USER/SMTP_PASS) are not configured in server/.env. Password reset email was not dispatched.');
    }

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

    sendTokenResponse(user, 200, res, 'Password updated successfully! You are now logged in.');
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.',
    });
  }
};
