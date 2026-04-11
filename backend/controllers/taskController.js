const { Op } = require('sequelize');
const Task = require('../models/Task.js');
const User = require('../models/User.js');
const { sendTaskAssignmentEmail } = require('../utils/emailService.js');

// ── CREATE TASK ────────────────────────────────────────
// POST /api/tasks
// Project Manager and Admin can create tasks
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, status } = req.body;

    // Title is mandatory
    if (!title || !title.trim()) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Task title is required'
      });
    }

    // Title length validation
    if (title.trim().length < 3) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Title must be at least 3 characters long'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Title cannot exceed 200 characters'
      });
    }

    // Validate priority if provided
    if (priority) {
      const allowedPriorities = ['Low', 'Medium', 'High'];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Priority must be Low, Medium, or High'
        });
      }
    }

    // Validate status if provided
    if (status) {
      const allowedStatuses = ['To Do', 'In Progress', 'Completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Status must be To Do, In Progress, or Completed'
        });
      }
    }

    // Validate due date - cannot be in the past
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // set to start of today
      const taskDate = new Date(dueDate);

      if (taskDate < today) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Due date cannot be in the past'
        });
      }
    }

    // If task is being assigned, check the user exists and is active
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findOne({
        where: {
          id: assignedTo,
          isActive: true
        }
      });

      if (!assignedUser) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Assigned user does not exist or is inactive'
        });
      }
    }

    // Create the task - createdBy is taken from the JWT token
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      status: status || 'To Do'
    });

    // Send assignment email if task was assigned to someone
    if (assignedUser) {
      // Get the creator's name for the email
      const creator = await User.findByPk(req.user.userId);
      try {
        await sendTaskAssignmentEmail(
          assignedUser.email,
          assignedUser.name,
          task,
          creator.name
        );
      } catch (emailError) {
        console.error('Task assignment email failed:', emailError.message);
      }
    }

    return res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── GET ALL TASKS ──────────────────────────────────────
// GET /api/tasks
// Admin and Project Manager see all tasks
// Collaborator sees only their assigned tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;

    const whereCondition = {};

    // Collaborators can only see tasks assigned to them
    if (req.user.role === 'Collaborator') {
      whereCondition.assignedTo = req.user.userId;
    }

    // Filter by status
    if (status) {
      whereCondition.status = status;
    }

    // Filter by priority
    if (priority) {
      whereCondition.priority = priority;
    }

    // Filter by assigned user
    if (assignedTo && req.user.role !== 'Collaborator') {
      whereCondition.assignedTo = assignedTo;
    }

    // Search by title
    if (search) {
      whereCondition.title = { [Op.like]: `%${search}%` };
    }

    const tasks = await Task.findAll({
      where: whereCondition,
      // Include assignee and creator details in the response
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Tasks fetched successfully',
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Get all tasks error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── GET SINGLE TASK ────────────────────────────────────
// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Collaborator can only view their own assigned tasks
    if (req.user.role === 'Collaborator' && task.assignedTo !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only view tasks assigned to you'
      });
    }

    return res.status(200).json({
      message: 'Task fetched successfully',
      task
    });

  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── UPDATE TASK ────────────────────────────────────────
// PUT /api/tasks/:id
// Project Manager and Admin can update everything
// Collaborator can only update status
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, priority, status } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Collaborator can only update status of their own tasks
    if (req.user.role === 'Collaborator') {
      if (task.assignedTo !== req.user.userId) {
        return res.status(403).json({
          errorCode: 403,
          message: 'Forbidden',
          description: 'You can only update tasks assigned to you'
        });
      }

      // Collaborator can only change status - nothing else
      if (title || description || assignedTo || dueDate || priority) {
        return res.status(403).json({
          errorCode: 403,
          message: 'Forbidden',
          description: 'You can only update the status of a task'
        });
      }
    }

    // Validate title if provided
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Title cannot be empty'
        });
      }

      if (title.trim().length < 3) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Title must be at least 3 characters long'
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Title cannot exceed 200 characters'
        });
      }
    }

    // Validate priority if provided
    if (priority !== undefined) {
      const allowedPriorities = ['Low', 'Medium', 'High'];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Priority must be Low, Medium, or High'
        });
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const allowedStatuses = ['To Do', 'In Progress', 'Completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Status must be To Do, In Progress, or Completed'
        });
      }
    }

    // Validate due date if provided
    if (dueDate !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(dueDate);

      if (taskDate < today) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Due date cannot be in the past'
        });
      }
    }

    // Check if task is being reassigned to a new user
    let newAssignee = null;
    const isReassigned = assignedTo && assignedTo !== task.assignedTo;

    if (assignedTo !== undefined) {
      if (assignedTo !== null) {
        newAssignee = await User.findOne({
          where: { id: assignedTo, isActive: true }
        });

        if (!newAssignee) {
          return res.status(400).json({
            errorCode: 400,
            message: 'Bad Request',
            description: 'Assigned user does not exist or is inactive'
          });
        }
      }
    }

    // Update the task
    await task.update({
      title: title ? title.trim() : task.title,
      description: description !== undefined ? description : task.description,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      priority: priority || task.priority,
      status: status || task.status
    });

    // Send assignment email if task was reassigned to a new person
    if (isReassigned && newAssignee) {
      const creator = await User.findByPk(req.user.userId);
      try {
        await sendTaskAssignmentEmail(
          newAssignee.email,
          newAssignee.name,
          task,
          creator.name
        );
      } catch (emailError) {
        console.error('Reassignment email failed:', emailError.message);
      }
    }

    return res.status(200).json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DELETE TASK ────────────────────────────────────────
// DELETE /api/tasks/:id
// Only Project Manager and Admin can delete tasks
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Collaborator cannot delete tasks
    if (req.user.role === 'Collaborator') {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You do not have permission to delete tasks'
      });
    }

    await task.destroy();

    return res.status(200).json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── MANUAL TRIGGER FOR TESTING ─────────────────────────
// GET /api/tasks/trigger-reminders
// This endpoint lets you manually trigger the deadline checker
// Useful for testing without waiting until 8AM
const triggerReminders = async (req, res) => {
  try {
    const { checkDeadlinesAndNotify } = require('../utils/taskScheduler');
    await checkDeadlinesAndNotify();
    return res.status(200).json({
      message: 'Deadline reminder check triggered successfully. Check your terminal for details.'
    });
  } catch (error) {
    console.error('Trigger reminders error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  triggerReminders
};