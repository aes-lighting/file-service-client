const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

class FileService {
  /**
   * Parse directory from filename
   * Format: DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext
   * Example: INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg
   */
  parseFilename(filename) {
    const parts = filename.split('_');
    if (parts.length < 2) {
      throw new Error('Invalid filename format. Expected: DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext');
    }

    const directory = parts[0].toUpperCase();
    const remainder = parts.slice(1).join('_'); // Rest of filename

    return {
      directory,
      originalFilename: filename,
      remainder
    };
  }

  /**
   * Upload file to correct directory based on filename
   */
  async uploadFile(file, filename) {
    if (!file) throw new Error('No file provided');
    if (!filename) throw new Error('No filename provided');
    if (file.size === 0) throw new Error('File is empty');

    // Parse filename for directory
    const { directory, originalFilename } = this.parseFilename(filename);

    // Check if directory is whitelisted
    if (!config.isValidDirectory(directory)) {
      throw new Error(`Directory '${directory}' is not whitelisted. Available: ${config.getDirectories().map(d => d.path).join(', ')}`);
    }

    // Create full path
    const rootDir = config.get('storage.rootDirectory');
    const fullDirPath = path.join(rootDir, directory);

    // Security: prevent directory traversal
    if (!path.resolve(fullDirPath).startsWith(path.resolve(rootDir))) {
      throw new Error('Invalid directory path');
    }

    // Create directory if missing
    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
    }

    // Full file path
    const filePath = path.join(fullDirPath, originalFilename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    logger.info('File uploaded', {
      filename: originalFilename,
      directory,
      size: file.size,
      path: filePath
    });

    return {
      success: true,
      filename: originalFilename,
      directory,
      size: file.size,
      path: filePath,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * Save JSON sidecar metadata
   */
  async saveMetadata(filename, metadata) {
    const { directory } = this.parseFilename(filename);

    const rootDir = config.get('storage.rootDirectory');
    const metadataPath = path.join(
      rootDir,
      directory,
      filename.replace(/\.[^.]+$/, '') + '.json'
    );

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    logger.info('Metadata saved', {
      filename,
      metadataPath
    });

    return { success: true, metadataPath };
  }

  /**
   * List directory contents
   */
  listDirectory(directory) {
    if (!config.isValidDirectory(directory)) {
      throw new Error(`Directory '${directory}' not found`);
    }

    const rootDir = config.get('storage.rootDirectory');
    const fullPath = path.join(rootDir, directory.toUpperCase());

    if (!fs.existsSync(fullPath)) {
      return { files: [], directory };
    }

    const files = fs.readdirSync(fullPath).map(name => {
      const fullFilePath = path.join(fullPath, name);
      const stat = fs.statSync(fullFilePath);
      return {
        name,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString()
      };
    });

    return { files, directory };
  }
}

module.exports = new FileService();
