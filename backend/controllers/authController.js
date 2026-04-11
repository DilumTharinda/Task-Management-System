const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

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

    const user = await User.findByPk(req.user.userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      mustChangePassword: false
    });

    return res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── EXPORT ALL THREE ───────────────────────────────────
module.exports = { login, register, changePassword };