const fs = require('fs');
const path = require('path');
const Comment = require('../models/Comment.js');
const Task = require('../models/Task.js');
const User = require('../models/User.js');
const TaskAssignee = require('../models/TaskAssignee.js');

// ── Helper: check task access ──────────────────────────
// Returns the task if user is allowed to access it
// Sends error response and returns null if not allowed
const checkTaskAccess = async (taskId, user, res) => {
  const task = await Task.findByPk(taskId);

  if (!task) {
    res.status(404).json({
      errorCode: 404,
      message: 'Not Found',
      description: `No task found with ID ${taskId}`
    });
    return null;
  }

  // Admin and Project Manager can access all tasks
  if (user.role === 'Admin' || user.role === 'ProjectManager') {
    return task;
  }

  // Collaborator — check TaskAssignee table only
  // The old task.assignedTo field no longer exists after the multi-member update
  if (user.role === 'Collaborator') {
    const isAssigned = await TaskAssignee.findOne({
      where: { taskId: task.id, userId: user.userId }
    });

    if (isAssigned) {
      return task;
    }

    res.status(403).json({
      errorCode: 403,
      message: 'Forbidden',
      description: 'You can only interact with tasks assigned to you'
    });
    return null;
  }

  // Any other unknown role
  res.status(403).json({
    errorCode: 403,
    message: 'Forbidden',
    description: 'You do not have permission to access this task'
  });
  return null;
};

// ── Helper: safe file delete ───────────────────────────
const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('File delete error:', err.message);
  }
};

// ── ADD COMMENT ────────────────────────────────────────
// POST /api/comments/:taskId
// Send as multipart/form-data
// content field is the comment text
// file field is the optional attachment
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    // Must have at least text or a file
    const hasContent = content && content.trim().length > 0;
    const hasFile = !!req.file;

    if (!hasContent && !hasFile) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Please enter a comment or attach a file'
      });
    }

    // Content length check only if content was provided
    if (hasContent && content.trim().length > 2000) {
      safeDeleteFile(req.file?.path);
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment cannot exceed 2000 characters'
      });
    }

    // Check if user can access this task
    const task = await checkTaskAccess(taskId, req.user, res);
    if (!task) {
      // Access denied — clean up uploaded file if any
      safeDeleteFile(req.file?.path);
      return;
    }

    // Build comment record
    const commentData = {
      content: hasContent ? content.trim() : '',
      taskId: parseInt(taskId),
      userId: req.user.userId,
      isEdited: false
    };

    // If a file was attached, store its details
    if (hasFile) {
      commentData.commentFileName      = req.file.originalname;
      commentData.commentStoredFileName = req.file.filename;
      commentData.commentFilePath      = req.file.path;
      commentData.commentFileType      = req.file.mimetype;
      commentData.commentFileSize      = req.file.size;
    }

    const comment = await Comment.create(commentData);

    // Fetch with author details for response
    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'role']
      }],
      attributes: { exclude: ['commentFilePath'] }
    });

    // Send real-time notification to all task assignees except the commenter
    try {
      const { sendNotificationToMany } = require('../utils/socketManager');
      const io = req.app.get('io');

      const assignees = await TaskAssignee.findAll({ where: { taskId } });
      const assigneeIds = assignees
        .map(a => a.userId)
        .filter(uid => uid !== req.user.userId);

      if (assigneeIds.length > 0) {
        await sendNotificationToMany(io, assigneeIds, {
          title: 'New Comment Added',
          message: `${commentWithAuthor.author.name} commented on task: ${task.title}`,
          type: 'comment_added',
          taskId: parseInt(taskId)
        });
      }
    } catch (notifError) {
      // Notification failure should not break the comment post
      console.error('Comment notification error:', notifError.message);
    }

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });

  } catch (error) {
    safeDeleteFile(req.file?.path);
    console.error('Add comment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── GET ALL COMMENTS FOR A TASK ────────────────────────
// GET /api/comments/:taskId
const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check access first
    const task = await checkTaskAccess(taskId, req.user, res);
    if (!task) return;

    const comments = await Comment.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'role']
      }],
      // Never send file path to frontend for security
      attributes: { exclude: ['commentFilePath'] },
      order: [['createdAt', 'ASC']]
    });

    return res.status(200).json({
      message: 'Comments fetched successfully',
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── UPDATE COMMENT ─────────────────────────────────────
// PUT /api/comments/:commentId
// All roles — only own comments can be edited
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment content cannot be empty'
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment cannot exceed 2000 characters'
      });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No comment found with ID ${commentId}`
      });
    }

    // Nobody can edit another person's comment regardless of role
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only edit your own comments'
      });
    }

    await comment.update({
      content: content.trim(),
      isEdited: true
    });

    return res.status(200).json({
      message: 'Comment updated successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        isEdited: comment.isEdited,
        taskId: comment.taskId,
        userId: comment.userId,
        updatedAt: comment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DELETE COMMENT ─────────────────────────────────────
// DELETE /api/comments/:commentId
// Collaborator — own comments only
// Project Manager and Admin — any comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No comment found with ID ${commentId}`
      });
    }

    // Collaborator restriction
    if (req.user.role === 'Collaborator' && comment.userId !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only delete your own comments'
      });
    }

    // Delete physical file if this comment had one attached
    safeDeleteFile(comment.commentFilePath);

    await comment.destroy();

    return res.status(200).json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DOWNLOAD COMMENT ATTACHMENT ────────────────────────
// GET /api/comments/download/:commentId
// IMPORTANT: This route must be registered BEFORE /:taskId in the routes file
// otherwise Express reads "download" as a taskId
const downloadCommentAttachment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No comment found with ID ${commentId}`
      });
    }

    if (!comment.commentFilePath) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'This comment does not have an attachment'
      });
    }

    // Check task access
    const task = await checkTaskAccess(comment.taskId, req.user, res);
    if (!task) return;

    // Use path.resolve to normalize path separators
    // This fixes Windows vs Linux path issues
    const normalizedPath = path.resolve(comment.commentFilePath);

    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'File not found on server. It may have been deleted.'
      });
    }

    res.download(normalizedPath, comment.commentFileName);

  } catch (error) {
    console.error('Download comment attachment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── REMOVE COMMENT ATTACHMENT ──────────────────────────
// DELETE /api/comments/:commentId/attachment
const removeCommentAttachment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ errorCode: 404, message: 'Not Found', description: 'Comment not found' });
    }

    if (!comment.commentFilePath) {
      return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'This comment has no attachment' });
    }

    // Only comment author can remove their attachment
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ errorCode: 403, message: 'Forbidden', description: 'You can only remove attachments from your own comments' });
    }

    // Delete physical file
    safeDeleteFile(comment.commentFilePath);

    // Clear attachment fields from comment record
    await comment.update({
      commentFileName: null,
      commentStoredFileName: null,
      commentFilePath: null,
      commentFileType: null,
      commentFileSize: null
    });

    return res.status(200).json({ message: 'Comment attachment removed successfully' });

  } catch (error) {
    console.error('Remove comment attachment error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong' });
  }
};


module.exports = {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  downloadCommentAttachment,
  removeCommentAttachment
};