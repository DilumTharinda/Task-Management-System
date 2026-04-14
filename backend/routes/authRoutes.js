const express = require('express');
const router = express.Router();

const { login, register, changePassword, forgotPassword, verifyResetToken, resetPassword } = require('../controllers/authController.js');
const { verifyToken, requireRole } = require('../middleware/authMiddleware.js');

// Public route - no token needed
// POST /api/auth/login
router.post('/login', login);

// Protected route - only Admins can create users
// POST /api/auth/register
// verifyToken runs first, then requireRole checks if user is Admin, then register runs
router.post('/register', verifyToken, requireRole('Admin'), register);

// Protected route - any logged in user can change their own password
// POST /api/auth/change-password
router.post('/change-password', verifyToken, changePassword);

// user is not logged in when they reset password
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;