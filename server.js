const express = require('express');
const multer = require('multer');

const UploadService = require('./src/services/uploadService');

const app = express();

// Configuration from environment
const API_KEY = process.env.API_KEY || 'test-api-key-12345';
const ENABLE_HEALTH = process.env.ENABLE_HEALTH_ENDPOINT !== 'false';
const ENABLE_STATUS = process.env.ENABLE_STATUS_ENDPOINT !== 'false';
const ENABLE_LIST = process.env.ENABLE_PROJECTS_LIST_ENDPOINT !== 'false';
const ENABLE_LOOKUP = process.env.ENABLE_PROJECT_LOOKUP_ENDPOINT !== 'false';
const ENABLE_UPLOAD = process.env.ENABLE_UPLOAD_ENDPOINT !== 'false';
const CORS_ENABLED = process.env.CORS_ENABLED === 'true';
const CORS_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || 'localhost:3000,localhost:3001';

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Validate file type - allow image files only
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (if enabled)
if (CORS_ENABLED) {
  const allowedOrigins = CORS_ORIGINS.split(',').map(o => o.trim());
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    }
    next();
  });
}

// API Key validation middleware for /api/* endpoints
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  next();
};

// Health check endpoint (no auth required)
if (ENABLE_HEALTH) {
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AES File Service Client',
      timestamp: new Date().toISOString()
    });
  });
}

// Status endpoint - returns project cache info (requires API key)
if (ENABLE_STATUS) {
  app.get('/api/status', validateApiKey, (req, res) => {
    if (!app.locals.projectService) {
      return res.status(500).json({ error: 'ProjectService not initialized' });
    }

    const stats = app.locals.projectService.getCacheStats();
    res.json({
      status: 'ok',
      cache: stats,
      scheduler: app.locals.scheduler ? app.locals.scheduler.getStatus() : null
    });
  });
}

// Get all projects endpoint (requires API key)
if (ENABLE_LIST) {
  app.get('/api/projects', validateApiKey, async (req, res) => {
    if (!app.locals.projectService) {
      return res.status(500).json({ error: 'ProjectService not initialized' });
    }

    const result = await app.locals.projectService.getAllProjects();
    res.json(result);
  });
}

// Get project by job number endpoint (requires API key)
if (ENABLE_LOOKUP) {
  app.get('/api/projects/:jobNumber', validateApiKey, async (req, res) => {
    if (!app.locals.projectService) {
      return res.status(500).json({ error: 'ProjectService not initialized' });
    }

    const result = await app.locals.projectService.getProject(req.params.jobNumber);
    if (result.success) {
      res.json(result.project);
    } else {
      res.status(404).json({ error: result.error });
    }
  });
}

// Upload endpoints (requires API key)
if (ENABLE_UPLOAD) {
  // Upload packing slip image
  app.post('/api/upload/packing-slip', validateApiKey, upload.single('file'), async (req, res) => {
    try {
      if (!app.locals.projectService) {
        return res.status(500).json({ error: 'ProjectService not initialized' });
      }

      if (!app.locals.uploadService) {
        return res.status(500).json({ error: 'UploadService not initialized' });
      }

      const { po_number } = req.body;

      // Validate request
      const validation = app.locals.uploadService.validateUploadRequest(po_number, req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Upload file
      const result = await app.locals.uploadService.uploadPackingSlip(
        po_number,
        req.file.buffer,
        req.file.originalname
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err) {
      console.error('Upload error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Upload failed',
        details: err.message
      });
    }
  });

  // Upload intake photo
  app.post('/api/upload/intake', validateApiKey, upload.single('file'), async (req, res) => {
    try {
      if (!app.locals.projectService) {
        return res.status(500).json({ error: 'ProjectService not initialized' });
      }

      if (!app.locals.uploadService) {
        return res.status(500).json({ error: 'UploadService not initialized' });
      }

      const { po_number } = req.body;

      // Validate request
      const validation = app.locals.uploadService.validateUploadRequest(po_number, req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Upload file
      const result = await app.locals.uploadService.uploadIntakePhoto(
        po_number,
        req.file.buffer,
        req.file.originalname
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err) {
      console.error('Upload error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Upload failed',
        details: err.message
      });
    }
  });
}

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

module.exports = app;
