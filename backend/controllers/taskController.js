const { Op } = require('sequelize');
const Task = require('../models/Task.js');
const TaskAssignee = require('../models/TaskAssignee.js');
const User = require('../models/User.js');
const { sendTaskAssignmentEmail } = require('../utils/emailService.js');

// Helper to get io instance for socket notifications
const getIO = (req) => req.app.get('io');

// ── CREATE TASK ────────────────────────────────────────
// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, assigneeIds, dueDate, priority, status } = req.body;

    // assigneeIds is now an array of user IDs
    // Example: [2, 3, 4]

    if (!title || !title.trim()) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Task title is required'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Title must be at least 3 characters'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Title cannot exceed 200 characters'
      });
    }

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

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'Due date cannot be in the past'
        });
      }
    }

    // Validate all assignee IDs if provided
    let validAssignees = [];
    if (assigneeIds && assigneeIds.length > 0) {
      validAssignees = await User.findAll({
        where: {
          id: { [Op.in]: assigneeIds },
          isActive: true
        }
      });

      if (validAssignees.length !== assigneeIds.length) {
        return res.status(400).json({
          errorCode: 400,
          message: 'Bad Request',
          description: 'One or more assigned users do not exist or are inactive'
        });
      }
    }

    // Create the task
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      createdBy: req.user.userId,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      status: status || 'To Do'
    });

    // Create TaskAssignee records for each assignee
    if (validAssignees.length > 0) {
      const assigneeRecords = validAssignees.map(u => ({
        taskId: task.id,
        userId: u.id
      }));
      await TaskAssignee.bulkCreate(assigneeRecords);

      // Get creator name for email
      const creator = await User.findByPk(req.user.userId);
      const io = getIO(req);
      const { sendNotification } = require('../utils/socketManager');

      // Send email and notification to each assignee
      for (const assignee of validAssignees) {
        try {
          await sendTaskAssignmentEmail(
            assignee.email,
            assignee.name,
            task,
            creator.name
          );
        } catch (emailError) {
          console.error('Assignment email failed:', emailError.message);
        }

        // Send real-time notification
        await sendNotification(io, assignee.id, {
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${task.title}`,
          type: 'task_assigned',
          taskId: task.id
        });
      }
    }

    // Fetch task with assignees to return
    const taskWithAssignees = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task: taskWithAssignees
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
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const whereCondition = {};

    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;
    if (search) whereCondition.title = { [Op.like]: `%${search}%` };

    let tasks;

    if (req.user.role === 'Collaborator') {
      // Collaborator only sees tasks they are assigned to
      tasks = await Task.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'assignees',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] },
            where: { id: req.user.userId },
            required: true
          },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Admin and Project Manager see all tasks
      tasks = await Task.findAll({
        where: whereCondition,
        include: [
          { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

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
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Collaborator can only view tasks they are assigned to
    if (req.user.role === 'Collaborator') {
      const isAssigned = task.assignees.some(a => a.id === req.user.userId);
      if (!isAssigned) {
        return res.status(403).json({
          errorCode: 403,
          message: 'Forbidden',
          description: 'You can only view tasks assigned to you'
        });
      }
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
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    const task = await Task.findByPk(id, {
      include: [{ model: User, as: 'assignees', through: { attributes: [] } }]
    });

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Collaborator restrictions
    if (req.user.role === 'Collaborator') {
      const isAssigned = task.assignees.some(a => a.id === req.user.userId);
      if (!isAssigned) {
        return res.status(403).json({
          errorCode: 403,
          message: 'Forbidden',
          description: 'You can only update tasks assigned to you'
        });
      }

      if (title || description || dueDate || priority) {
        return res.status(403).json({
          errorCode: 403,
          message: 'Forbidden',
          description: 'You can only update the status of a task'
        });
      }
    }

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Title cannot be empty' });
      }
      if (title.trim().length < 3) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Title must be at least 3 characters' });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Title cannot exceed 200 characters' });
      }
    }

    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Priority must be Low, Medium, or High' });
      }
    }

    if (status !== undefined) {
      if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Status must be To Do, In Progress, or Completed' });
      }
    }

    if (dueDate !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) {
        return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'Due date cannot be in the past' });
      }
    }

    // Update assignees if provided
    if (req.body.assigneeIds !== undefined) {
      const { assigneeIds } = req.body;

      // Validate all assignee IDs if provided
      let validAssignees = [];
      if (assigneeIds && assigneeIds.length > 0) {
        validAssignees = await User.findAll({
          where: {
            id: { [Op.in]: assigneeIds },
            isActive: true
          }
        });

        if (validAssignees.length !== assigneeIds.length) {
          return res.status(400).json({
            errorCode: 400,
            message: 'Bad Request',
            description: 'One or more assigned users do not exist or are inactive'
          });
        }
      }

      // Remove all existing assignees and add new ones
      await TaskAssignee.destroy({ where: { taskId: id } });

      if (validAssignees.length > 0) {
        const assigneeRecords = validAssignees.map(u => ({
          taskId: id,
          userId: u.id
        }));
        await TaskAssignee.bulkCreate(assigneeRecords);
      }
    }

    const oldStatus = task.status;

    await task.update({
      title: title ? title.trim() : task.title,
      description: description !== undefined ? description : task.description,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      priority: priority || task.priority,
      status: status || task.status
    });

    // Send notification if status changed
    if (status && status !== oldStatus) {
      const io = getIO(req);
      const { sendNotificationToMany } = require('../utils/socketManager');
      const assigneeIds = task.assignees.map(a => a.id);

      await sendNotificationToMany(io, assigneeIds, {
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed from ${oldStatus} to ${status}`,
        type: 'status_changed',
        taskId: task.id
      });
    }

    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask
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

// ── ADD MEMBERS TO TASK ────────────────────────────────
// POST /api/tasks/:id/members
// Add new assignees to an existing task
const addTaskMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'userIds must be a non-empty array of user IDs'
      });
    }

    const task = await Task.findByPk(id, {
      include: [{ model: User, as: 'assignees', through: { attributes: [] } }]
    });

    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Check all users exist and are active
    const newUsers = await User.findAll({
      where: { id: { [Op.in]: userIds }, isActive: true }
    });

    if (newUsers.length !== userIds.length) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'One or more users do not exist or are inactive'
      });
    }

    // Get existing assignee IDs to avoid duplicates
    const existingIds = task.assignees.map(a => a.id);
    const toAdd = newUsers.filter(u => !existingIds.includes(u.id));

    if (toAdd.length === 0) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'All provided users are already assigned to this task'
      });
    }

    // Create new TaskAssignee records
    const records = toAdd.map(u => ({ taskId: parseInt(id), userId: u.id }));
    await TaskAssignee.bulkCreate(records);

    // Send notifications and emails to newly added members
    const creator = await User.findByPk(req.user.userId);
    const io = getIO(req);
    const { sendNotification } = require('../utils/socketManager');

    for (const user of toAdd) {
      try {
        await sendTaskAssignmentEmail(user.email, user.name, task, creator.name);
      } catch (emailError) {
        console.error('Assignment email failed:', emailError.message);
      }

      await sendNotification(io, user.id, {
        title: 'Added to Task',
        message: `You have been added to task: ${task.title}`,
        type: 'task_assigned',
        taskId: task.id
      });
    }

    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(200).json({
      message: `${toAdd.length} member(s) added to task successfully`,
      task: updatedTask
    });

  } catch (error) {
    console.error('Add task members error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── REMOVE MEMBER FROM TASK ────────────────────────────
// DELETE /api/tasks/:id/members/:userId
const removeTaskMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${id}`
      });
    }

    // Check if this user is actually assigned to this task
    const assignee = await TaskAssignee.findOne({
      where: { taskId: id, userId }
    });

    if (!assignee) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'This user is not assigned to this task'
      });
    }

    await assignee.destroy();

    return res.status(200).json({
      message: 'Member removed from task successfully'
    });

  } catch (error) {
    console.error('Remove task member error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DELETE TASK ────────────────────────────────────────
// DELETE /api/tasks/:id
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

    if (req.user.role === 'Collaborator') {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You do not have permission to delete tasks'
      });
    }

    // Delete all assignee records first
    await TaskAssignee.destroy({ where: { taskId: id } });
    await task.destroy();

    return res.status(200).json({ message: 'Task deleted successfully' });

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
const triggerReminders = async (req, res) => {
  try {
    const { checkDeadlinesAndNotify } = require('../utils/taskScheduler');
    await checkDeadlinesAndNotify();
    return res.status(200).json({ message: 'Deadline check triggered successfully' });
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
  addTaskMembers,
  removeTaskMember,
  deleteTask,
  triggerReminders
};