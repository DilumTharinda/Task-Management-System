const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');// crypto is built into Node.js — no need to install anything
const User = require('../models/User');
const { 
   sendWelcomeEmail,
   sendPasswordChangedEmail,
   sendPasswordResetLinkEmail,
   sendPasswordResetSuccessEmail 
    } = require('../utils/emailService');

// ── FUNCTION 1: LOGIN ──────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Email and password are required'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        errorCode: 401,
        message: 'Unauthorized',
        description: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        errorCode: 401,
        message: 'Unauthorized',
        description: 'Your account has been deactivated. Contact an administrator.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        errorCode: 401,
        message: 'Unauthorized',
        description: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── FUNCTION 2: REGISTER ───────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Name, email, and role are all required'
      });
    }

    const allowedRoles = ['Admin', 'ProjectManager', 'Collaborator'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: `Role must be one of: ${allowedRoles.join(', ')}`
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'A user with this email already exists'
      });
    }

    const tempPassword = 'Tmp#' + Math.random().toString(36).slice(2, 9);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      mustChangePassword: true
    });

    try {
      await sendWelcomeEmail(email, name, tempPassword);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      return res.status(201).json({
        message: 'User created but email could not be sent.',
        warning: 'Please manually share the temporary password with the user.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        temporaryPassword: tempPassword
      });
    }

    return res.status(201).json({
      message: 'User created successfully. A welcome email has been sent.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── FUNCTION 3: CHANGE PASSWORD ────────────────────────
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

// Full password complexity validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!newPassword) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'New password is required'
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&#)'
      });
    }

    // Get the full user record so we have their name and email for the notification
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear the must change flag
    await user.update({
      password: hashedPassword,
      mustChangePassword: false
    });

    // Send security notification email to the user
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      // Email failed but password was changed successfully — just log it
      console.error('Password change notification email failed:', emailError.message);
    }

    return res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── FORGOT PASSWORD ────────────────────────────────────
// POST /api/auth/forgot-password
// Public route — no token needed
// User sends their email, system sends reset link
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email is provided
    if (!email || !email.trim()) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Please provide a valid email address'
      });
    }

    // Check if user exists with this email
    const user = await User.findOne({ where: { email: email.trim() } });

    // Security best practice: always return the same message
    // whether the email exists or not
    // This prevents attackers from finding out which emails are registered
    if (!user) {
      return res.status(200).json({
        message: 'If this email is registered, a reset link has been sent.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(200).json({
        message: 'If this email is registered, a reset link has been sent.'
      });
    }

    // Generate a secure random token
    // crypto.randomBytes gives us a very secure random string
    // 32 bytes = 64 character hex string
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Token expires in 15 minutes from now
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save the token and expiry to the user record
    await user.update({
      resetToken,
      resetTokenExpiry
    });

    // Build the reset link
    // In development this points to localhost frontend
    // In production this would point to your deployed frontend URL
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send the reset link email
    try {
      await sendPasswordResetLinkEmail(user.email, user.name, resetLink);
    } catch (emailError) {
      console.error('Reset link email failed:', emailError.message);
      // Clear the token since email failed
      await user.update({
        resetToken: null,
        resetTokenExpiry: null
      });
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        description: 'Failed to send reset email. Please try again.'
      });
    }

    return res.status(200).json({
      message: 'If this email is registered, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── VERIFY RESET TOKEN ─────────────────────────────────
// GET /api/auth/verify-reset-token/:token
// Public route — no token needed
// Frontend calls this when user clicks the reset link
// to check if the token is still valid before showing the form
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset token is required'
      });
    }

    // Find user with this token
    const user = await User.findOne({
      where: { resetToken: token }
    });

    // Token not found
    if (!user) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset link is invalid. Please request a new one.'
      });
    }

    // Check if token has expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      // Clear the expired token from database
      await user.update({
        resetToken: null,
        resetTokenExpiry: null
      });
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset link has expired. Please request a new one.'
      });
    }

    // Token is valid
    return res.status(200).json({
      message: 'Token is valid',
      email: user.email  // return email so frontend can display it
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── RESET PASSWORD ─────────────────────────────────────
// POST /api/auth/reset-password
// Public route — no token needed
// User sends the reset token and their new password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate token is provided
    if (!token) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset token is required'
      });
    }

    // Validate new password is provided
    if (!newPassword) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'New password is required'
      });
    }

    // Full password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&#)'
      });
    }

    // Find user with this reset token
    const user = await User.findOne({
      where: { resetToken: token }
    });

    // Token not found
    if (!user) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset link is invalid. Please request a new one.'
      });
    }

    // Check if token has expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      // Clear expired token
      await user.update({
        resetToken: null,
        resetTokenExpiry: null
      });
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Reset link has expired. Please request a new one.'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear the reset token
    // Also clear mustChangePassword since they are setting a proper password
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      mustChangePassword: false
    });

    // Send success confirmation email
    try {
      await sendPasswordResetSuccessEmail(user.email, user.name);
    } catch (emailError) {
      // Password was reset successfully even if email fails
      console.error('Reset success email failed:', emailError.message);
    }

    return res.status(200).json({
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── EXPORT ALL THREE ───────────────────────────────────
module.exports = { login, register, changePassword, forgotPassword, verifyResetToken, resetPassword };