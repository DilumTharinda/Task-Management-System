const express = require('express');
const router = express.Router();

const {
  uploadAttachment,
  replaceAttachment,
  getAttachmentsByTask,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/attachmentController.js');

const { verifyToken } = require('../middleware/authMiddleware.js');
const { upload, checkFileSize } = require('../utils/uploadConfig.js');

// POST /api/attachments/:taskId — upload a new file to a task
router.post(
  '/:taskId',
  verifyToken,
  upload.any(),
  checkFileSize,
  uploadAttachment
);

// PUT /api/attachments/:attachmentId — replace an existing attachment with a new file
router.put(
  '/:attachmentId',
  verifyToken,
  upload.any(),
  checkFileSize,
  replaceAttachment
);

// GET /api/attachments/:taskId — get all attachments for a task
router.get('/:taskId', verifyToken, getAttachmentsByTask);

// GET /api/attachments/download/:attachmentId — download a file
router.get('/download/:attachmentId', verifyToken, downloadAttachment);

// DELETE /api/attachments/:attachmentId — delete an attachment
router.delete('/:attachmentId', verifyToken, deleteAttachment);

module.exports = router;