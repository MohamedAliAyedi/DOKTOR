const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/appError');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Organize uploads by type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'medicalDocument') {
      uploadPath += 'medical-documents/';
    } else if (file.fieldname === 'labResult') {
      uploadPath += 'lab-results/';
    } else if (file.fieldname === 'xrayImage') {
      uploadPath += 'xray-images/';
    } else if (file.fieldname === 'prescription') {
      uploadPath += 'prescriptions/';
    } else if (file.fieldname === 'chatFile') {
      uploadPath += 'chat-files/';
    } else {
      uploadPath += 'general/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on field name
  const allowedTypes = {
    avatar: /jpeg|jpg|png|gif/,
    medicalDocument: /pdf|doc|docx|jpeg|jpg|png/,
    labResult: /pdf|jpeg|jpg|png/,
    xrayImage: /jpeg|jpg|png|dicom/,
    prescription: /pdf|jpeg|jpg|png/,
    chatFile: /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|wav/
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || allowedTypes.chatFile;
  const extname = fieldAllowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fieldAllowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError(`Invalid file type for ${file.fieldname}`, 400));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 10MB.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Maximum is 5 files.', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field.', 400));
    }
  }
  next(err);
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;