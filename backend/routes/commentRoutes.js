const express = require('express');
const router = express.Router();

const {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  downloadCommentAttachment
} = require('../controllers/commentController.js');

const { verifyToken } = require('../middleware/authMiddleware.js');
const { upload, checkFileSize } = require('../utils/uploadConfig.js');

// POST /api/comments/:taskId
// Supports optional file attachment on the comment
// Use multipart/form-data in Postman
// Add content as a text field and optionally add file field
router.post(
  '/:taskId',
  verifyToken,
  upload.single('file'),
  checkFileSize,
  addComment
);

// GET /api/comments/:taskId — get all comments for a task
router.get('/:taskId', verifyToken, getCommentsByTask);

// PUT /api/comments/:commentId — edit own comment only
router.put('/:commentId', verifyToken, updateComment);

// DELETE /api/comments/:commentId — delete comment
router.delete('/:commentId', verifyToken, deleteComment);

// GET /api/comments/download/:commentId — download file attached to comment
router.get('/download/:commentId', verifyToken, downloadCommentAttachment);

module.exports = router;