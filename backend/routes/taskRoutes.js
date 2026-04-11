const express = require('express');
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  triggerReminders
} = require('../controllers/taskController.js');

const { verifyToken, requireRole } = require('../middleware/authMiddleware.js');

// All routes require a valid JWT token
// Admin and Project Manager can create tasks
router.post('/', verifyToken, requireRole('Admin', 'ProjectManager'), createTask);

// All roles can get tasks - controller handles what each role sees
router.get('/', verifyToken, getAllTasks);

// Manual trigger for testing deadline reminders - Admin only
router.get('/trigger-reminders', verifyToken, requireRole('Admin'), triggerReminders);

// All roles can get a single task - controller handles permission
router.get('/:id', verifyToken, getTaskById);

// All roles can call update - controller restricts what Collaborator can change
router.put('/:id', verifyToken, updateTask);

// Only Admin and Project Manager can delete
router.delete('/:id', verifyToken, requireRole('Admin', 'ProjectManager'), deleteTask);

module.exports = router;