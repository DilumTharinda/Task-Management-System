const express = require('express');
const router = express.Router();

const {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  downloadCommentAttachment,
  removeCommentAttachment
} = require('../controllers/commentController.js');

const { verifyToken } = require('../middleware/authMiddleware.js');
const { upload, checkFileSize } = require('../utils/uploadConfig.js');

// CRITICAL: download route must be BEFORE /:taskId
// otherwise Express reads the word "download" as a taskId value
router.get('/download/:commentId', verifyToken, downloadCommentAttachment);

// Standard comment routes
router.delete('/:commentId/attachment', verifyToken, removeCommentAttachment);
router.post('/:taskId', verifyToken, upload.single('file'), checkFileSize, addComment);
router.get('/:taskId', verifyToken, getCommentsByTask);
router.put('/:commentId', verifyToken, updateComment);
router.delete('/:commentId', verifyToken, deleteComment);

module.exports = router;