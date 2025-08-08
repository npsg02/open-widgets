import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processUploadedFile, isValidFileType, getSupportedExtensions } from '../utils/fileProcessor.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import { optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (isValidFileType(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Supported types: ${getSupportedExtensions().join(', ')}`));
    }
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * GET /api/upload/supported - Get supported file types
 */
router.get('/supported', (req, res) => {
  res.json({
    extensions: getSupportedExtensions(),
    maxSize: '10MB',
    note: 'Files are processed and then deleted for security'
  });
});

/**
 * POST /api/upload - Upload and process file
 */
router.post('/', uploadLimiter, optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processedFile = await processUploadedFile(req.file.path, req.file.originalname);

    res.json({
      success: true,
      file: processedFile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up file if it still exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file after error:', unlinkError);
      }
    }

    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/upload/multiple - Upload and process multiple files
 */
router.post('/multiple', uploadLimiter, optionalAuth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const processedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const processedFile = await processUploadedFile(file.path, file.originalname);
        processedFiles.push(processedFile);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      files: processedFiles,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    
    // Clean up any remaining files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error('Error cleaning up file:', unlinkError);
          }
        }
      });
    }

    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message.includes('Unsupported file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

export default router;