const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment.js');
const Task = require('../models/Task.js');
const User = require('../models/User.js');

// ── UPLOAD ATTACHMENT ──────────────────────────────────
// POST /api/attachments/:taskId
// upload.any() puts files in req.files array — we take the first one
const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : null;

    if (!uploadedFile) {
      return res.status(400).json({
        errorCode: 400,
        message: 'Bad Request',
        description: 'No file was uploaded. Please select a file.'
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${taskId}`
      });
    }

    if (req.user.role === 'Collaborator' && task.assignedTo !== req.user.userId) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only upload attachments to tasks assigned to you'
      });
    }

    const attachment = await Attachment.create({
      fileName:       uploadedFile.originalname,
      storedFileName: uploadedFile.filename,
      filePath:       uploadedFile.path,
      fileType:       uploadedFile.mimetype,
      fileSize:       uploadedFile.size,
      taskId:         parseInt(taskId),
      uploadedBy:     req.user.userId
    });

    const attachmentWithUploader = await Attachment.findByPk(attachment.id, {
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      attributes: { exclude: ['filePath'] }
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      attachment: attachmentWithUploader
    });

  } catch (error) {
    const uploadedFile = req.files && req.files[0];
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    console.error('Upload attachment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── REPLACE ATTACHMENT ─────────────────────────────────
// PUT /api/attachments/:attachmentId/replace
const replaceAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    if (!req.file) {
      return res.status(400).json({ errorCode: 400, message: 'Bad Request', description: 'No file was uploaded' });
    }

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ errorCode: 404, message: 'Not Found', description: `No attachment found with ID ${attachmentId}` });
    }

    // Check permission
    if (req.user.role === 'Collaborator' && attachment.uploadedBy !== req.user.userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ errorCode: 403, message: 'Forbidden', description: 'You can only replace your own uploaded files' });
    }

    // Delete old file from disk
    const oldPath = path.resolve(attachment.filePath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    // Update record with new file details
    await attachment.update({
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    return res.status(200).json({
      message: 'Attachment replaced successfully',
      attachment: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Replace attachment error:', error);
    return res.status(500).json({ errorCode: 500, message: 'Internal Server Error', description: 'Something went wrong on the server' });
  }
};

// ── GET ALL ATTACHMENTS FOR A TASK ─────────────────────
// GET /api/attachments/:taskId
const getAttachmentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No task found with ID ${taskId}`
      });
    }

    if (req.user.role === 'Collaborator' && task.assignedTo !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only view attachments on tasks assigned to you'
      });
    }

    const attachments = await Attachment.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      attributes: { exclude: ['filePath'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Attachments fetched successfully',
      count: attachments.length,
      attachments
    });

  } catch (error) {
    console.error('Get attachments error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DOWNLOAD ATTACHMENT ────────────────────────────────
// GET /api/attachments/download/:attachmentId
const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No attachment found with ID ${attachmentId}`
      });
    }

    const task = await Task.findByPk(attachment.taskId);
    if (req.user.role === 'Collaborator' && task.assignedTo !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only download attachments from tasks assigned to you'
      });
    }

    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: 'File not found on server'
      });
    }

    res.download(attachment.filePath, attachment.fileName);

  } catch (error) {
    console.error('Download attachment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

// ── DELETE ATTACHMENT ──────────────────────────────────
// DELETE /api/attachments/:attachmentId
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        errorCode: 404,
        message: 'Not Found',
        description: `No attachment found with ID ${attachmentId}`
      });
    }

    if (req.user.role === 'Collaborator' && attachment.uploadedBy !== req.user.userId) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: 'You can only delete your own uploaded files'
      });
    }

    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await attachment.destroy();

    return res.status(200).json({
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Delete attachment error:', error);
    return res.status(500).json({
      errorCode: 500,
      message: 'Internal Server Error',
      description: 'Something went wrong on the server'
    });
  }
};

module.exports = {
  uploadAttachment,
  replaceAttachment,
  getAttachmentsByTask,
  downloadAttachment,
  deleteAttachment
};