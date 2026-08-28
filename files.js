const express = require('express');
const multer = require('multer');
const fileService = require('../services/fileService');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check (no auth)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AES File Service V0',
    timestamp: new Date().toISOString()
  });
});

// Upload file with metadata in filename
// POST /api/upload
// Body: 
//   - file: binary file
//   - filename: "DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext"
//   - metadata: (optional) JSON object
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { filename, metadata } = req.body;

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename parameter',
        hint: 'Filename format: DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext (e.g., INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg)'
      });
    }

    // Upload the file
    const result = await fileService.uploadFile(req.file, filename);

    // If metadata provided, save JSON sidecar
    if (metadata) {
      try {
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        await fileService.saveMetadata(filename, metadataObj);
        result.metadataSaved = true;
      } catch (err) {
        logger.error('Failed to save metadata', { error: err.message });
        result.metadataError = err.message;
      }
    }

    res.json(result);
  } catch (error) {
    logger.error('Upload error', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// List directory contents
// GET /api/list/:directory
router.get('/list/:directory', authenticate, (req, res) => {
  try {
    const result = fileService.listDirectory(req.params.directory);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('List error', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Get config info (for testing)
router.get('/config', authenticate, (req, res) => {
  const config = require('../config');
  res.json({
    directories: config.getDirectories().map(d => d.path),
    port: config.get('service.port'),
    rootDirectory: config.get('storage.rootDirectory')
  });
});

module.exports = router;
