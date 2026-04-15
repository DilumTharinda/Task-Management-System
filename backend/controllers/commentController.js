const fs = require('fs');
const path = require('path');
const Comment = require('../models/Comment.js');
const Task = require('../models/Task.js');
const User = require('../models/User.js');

// Helper function to check if a user can access a task
// Returns the task if allowed, throws error response if not
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

  // Collaborator can only interact with tasks assigned to them
  if (user.role === 'Collaborator' && task.assignedTo !== user.userId) {
    res.status(403).json({
      errorCode: 403,
      message: 'Forbidden',
      description: 'You can only interact with tasks assigned to you'
    });
    return null;
  }

  return task;
};

// ── ADD COMMENT ────────────────────────────────────────
// POST /api/comments/:taskId
// Supports optional file attachment on the comment itself
// Send as multipart/form-data with content field and optional file field
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      // Delete uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment content cannot be empty'
      });
    }

    if (content.trim().length < 1) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment must have at least 1 character'
      });
    }

    if (content.trim().length > 2000) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment cannot exceed 2000 characters'
      });
    }

    // Check task access
    const task = await checkTaskAccess(taskId, req.user, res);
    if (!task) return;

    // Build comment data
    const commentData = {
      content: content.trim(),
      taskId: parseInt(taskId),
      userId: req.user.userId,
      isEdited: false
    };

    // If a file was attached to this comment, save its details
    if (req.file) {
      commentData.commentFileName = req.file.originalname;
      commentData.commentStoredFileName = req.file.filename;
      commentData.commentFilePath = req.file.path;
      commentData.commentFileType = req.file.mimetype;
      commentData.commentFileSize = req.file.size;
    }

    // Create the comment
    const comment = await Comment.create(commentData);

    // Fetch with author details
    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'role']
      }],
      // Never send file path to frontend
      attributes: { exclude: ['commentFilePath'] }
    });

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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

    const task = await checkTaskAccess(taskId, req.user, res);
    if (!task) return;

    const comments = await Comment.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'role']
      }],
      // Never send file path to frontend
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
// Every user can only edit their OWN comments
// Admin and Project Manager follow the same rule as Collaborator here
// Nobody can edit another person's comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment content cannot be empty'
      });
    }

    if (content.trim().length < 1) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'Comment must have at least 1 character'
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

    // ALL roles — including Admin and Project Manager —
    // can only edit their own comments
    // Nobody can edit another person's comment
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only edit your own comments'
      });
    }

    // Mark comment as edited so frontend can show "edited" label
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
// Collaborator — can only delete their own comments
// Project Manager — can delete any comment on tasks they manage
// Admin — can delete any comment
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

    // Collaborator can only delete their own comments
    if (req.user.role === 'Collaborator' && comment.userId !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only delete your own comments'
      });
    }

    // Delete the attached file if this comment had one
    if (comment.commentFilePath && fs.existsSync(comment.commentFilePath)) {
      fs.unlinkSync(comment.commentFilePath);
    }

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
// Download the file attached to a specific comment
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

    // Check if this comment has an attachment
    if (!comment.commentFilePath) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'This comment does not have an attachment'
      });
    }

    // Check task access for Collaborator
    const task = await checkTaskAccess(comment.taskId, req.user, res);
    if (!task) return;

    // Check file exists on server
    if (!fs.existsSync(comment.commentFilePath)) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'File not found on server'
      });
    }

    // Send the file as download
    res.download(comment.commentFilePath, comment.commentFileName);

  } catch (error) {
    console.error('Download comment attachment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

module.exports = {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  downloadCommentAttachment
};