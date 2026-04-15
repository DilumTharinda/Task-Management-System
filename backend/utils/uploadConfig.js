const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload folder if it does not exist
const uploadDir = path.join(__dirname, '../uploads/tasks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Upload folder created at:', uploadDir);
}

// Configure storage — where and how to save files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Rename file to avoid conflicts
  // Example: 1714500000000-482736.pdf
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Separate allowed types into two groups
// This is needed because each group has a different size limit
const imageAndDocumentTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const videoTypes = [
  'video/mp4',
  'video/quicktime'
];

// Size limits
const IMAGE_AND_DOCUMENT_LIMIT = 10 * 1024 * 1024;  // 10MB
const VIDEO_LIMIT = 100 * 1024 * 1024;               // 100MB

// File filter — check type and size together
// multer fileFilter runs before the file is saved
const fileFilter = (req, file, cb) => {
  const isImageOrDocument = imageAndDocumentTypes.includes(file.mimetype);
  const isVideo = videoTypes.includes(file.mimetype);

  if (!isImageOrDocument && !isVideo) {
    // File type is not allowed at all
    return cb(
      new Error(
        'File type not allowed. Allowed types: JPEG, PNG, GIF, PDF, Word, Excel, MP4, MOV'
      ),
      false
    );
  }

  // Store the file category on the request so we can check size later
  req.fileCategory = isVideo ? 'video' : 'imageOrDocument';
  cb(null, true);
};

// Custom size check middleware
// multer limits apply before fileFilter so we cannot use it for per-type limits
// Instead we check file size manually after upload and reject if too large
const checkFileSize = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();  
  const file = req.files[0];                                
  const fileSize = file.size;                               
  const category = req.fileCategory;

  if (category === 'video' && fileSize > VIDEO_LIMIT) {
    // Delete the already saved file
   fs.unlinkSync(file.path);                            
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad Request',
      description: 'Video files cannot exceed 100MB'
    });
  }

  if (category === 'imageOrDocument' && fileSize > IMAGE_AND_DOCUMENT_LIMIT) {
     fs.unlinkSync(file.path);                              
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad Request',
      description: 'Image and document files cannot exceed 10MB'
    });
  }

  next();
};

// Create multer instance
// We set the overall limit to 100MB (the highest allowed)
// Per-type limits are enforced by checkFileSize middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB overall limit
  }
});

module.exports = { upload, checkFileSize };