const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
  getTeamMembers  
} = require('../controllers/userController.js');

const { verifyToken, requireRole } = require('../middleware/authMiddleware.js');

// All routes below are protected - need valid JWT and Admin role
// verifyToken runs first, then requireRole checks Admin, then the function runs

// GET /api/users/team — Project Manager views non-admin users
// Must be placed BEFORE /:id route otherwise Express reads
// "team" as an ID parameter
router.get('/team', verifyToken, requireRole('Admin', 'ProjectManager'), getTeamMembers);


// GET /api/users - get all users with optional search and filter
router.get('/', verifyToken, requireRole('Admin'), getAllUsers);

// GET /api/users/:id - get one user by ID
router.get('/:id', verifyToken, requireRole('Admin'), getUserById);

// PUT /api/users/:id - update a user
router.put('/:id', verifyToken, requireRole('Admin'), updateUser);

// PATCH /api/users/:id/deactivate - deactivate a user
router.patch('/:id/deactivate', verifyToken, requireRole('Admin'), deactivateUser);

// PATCH /api/users/:id/activate - activate a user
router.patch('/:id/activate', verifyToken, requireRole('Admin'), activateUser);

// DELETE /api/users/:id - permanently delete a user
router.delete('/:id', verifyToken, requireRole('Admin'), deleteUser);

module.exports = router;