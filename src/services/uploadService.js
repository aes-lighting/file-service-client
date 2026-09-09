/**
 * Upload Service
 * Handles file uploads for packing slips and intake photos
 * Routes files to correct project folders based on PO number
 */

const fs = require('fs');
const path = require('path');

class UploadService {
  constructor(config = {}) {
    this.projectService = config.projectService;
    this.baseProjectPath = config.baseProjectPath || 'F:\\AES Projects';
    this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  }

  /**
   * Extract project number from PO number
   * Example: "26016-01" → "26016"
   */
  extractProjectNumber(poNumber) {
    const match = poNumber.match(/^(\d{5})/);
    return match ? match[1] : null;
  }

  /**
   * Validate file extension
   */
  isValidImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.allowedExtensions.includes(ext);
  }

  /**
   * Upload packing slip image
   */
  async uploadPackingSlip(poNumber, fileBuffer, originalFilename) {
    try {
      // Validate inputs
      if (!poNumber || !fileBuffer || !originalFilename) {
        return {
          success: false,
          error: 'Missing required parameters: po_number, file'
        };
      }

      if (!this.isValidImageFile(originalFilename)) {
        return {
          success: false,
          error: `Invalid file type. Allowed: ${this.allowedExtensions.join(', ')}`
        };
      }

      // Extract project number from PO
      const projectNumber = this.extractProjectNumber(poNumber);
      if (!projectNumber) {
        return {
          success: false,
          error: `Invalid PO number format. Expected format: NNNNN-XX (e.g., 26016-01)`
        };
      }

      // Check if project exists in cache
      const projectExists = await this.projectService.projectExists(projectNumber);
      if (!projectExists) {
        return {
          success: false,
          error: `Project not found for PO: ${poNumber} (Project ${projectNumber})`
        };
      }

      // Get project details from cache
      const projectResult = await this.projectService.getProject(projectNumber);
      if (!projectResult.success) {
        return {
          success: false,
          error: `Could not retrieve project details: ${projectResult.error}`
        };
      }

      const project = projectResult.project;
      const projectFolderPath = path.join(
        this.baseProjectPath,
        project.folderPath
      );

      // Construct target folder path
      const targetFolder = path.join(
        projectFolderPath,
        'PROJECT MANAGEMENT',
        'Accounting Docs',
        'Purchase Orders and Packing Slips',
        'Packing Slips'
      );

      // Create directories if they don't exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Generate filename: use PO number + original extension
      const ext = path.extname(originalFilename).toLowerCase();
      const filename = `${poNumber}${ext}`;
      const filePath = path.join(targetFolder, filename);

      // Write file
      fs.writeFileSync(filePath, fileBuffer);

      return {
        success: true,
        message: 'Packing slip uploaded successfully',
        project_number: projectNumber,
        po_number: poNumber,
        project_name: project.projectName,
        file_path: filePath,
        filename: filename,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        error: `Upload failed: ${err.message}`
      };
    }
  }

  /**
   * Upload intake photo (photo of contents)
   * Supports multiple photos per PO with automatic numbering
   */
  async uploadIntakePhoto(poNumber, fileBuffer, originalFilename) {
    try {
      // Validate inputs
      if (!poNumber || !fileBuffer || !originalFilename) {
        return {
          success: false,
          error: 'Missing required parameters: po_number, file'
        };
      }

      if (!this.isValidImageFile(originalFilename)) {
        return {
          success: false,
          error: `Invalid file type. Allowed: ${this.allowedExtensions.join(', ')}`
        };
      }

      // Extract project number from PO
      const projectNumber = this.extractProjectNumber(poNumber);
      if (!projectNumber) {
        return {
          success: false,
          error: `Invalid PO number format. Expected format: NNNNN-XX (e.g., 26016-01)`
        };
      }

      // Check if project exists in cache
      const projectExists = await this.projectService.projectExists(projectNumber);
      if (!projectExists) {
        return {
          success: false,
          error: `Project not found for PO: ${poNumber} (Project ${projectNumber})`
        };
      }

      // Get project details from cache
      const projectResult = await this.projectService.getProject(projectNumber);
      if (!projectResult.success) {
        return {
          success: false,
          error: `Could not retrieve project details: ${projectResult.error}`
        };
      }

      const project = projectResult.project;
      const projectFolderPath = path.join(
        this.baseProjectPath,
        project.folderPath
      );

      // Construct target folder path (INTAKE subfolder)
      const targetFolder = path.join(
        projectFolderPath,
        'PROJECT MANAGEMENT',
        'Accounting Docs',
        'Purchase Orders and Packing Slips',
        'Packing Slips',
        'INTAKE'
      );

      // Create directories if they don't exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Generate filename with auto-numbering
      const ext = path.extname(originalFilename).toLowerCase();
      let filename = `${poNumber}${ext}`;
      let filePath = path.join(targetFolder, filename);
      let counter = 1;

      // If file already exists, add counter: 26016-01_1.jpg, 26016-01_2.jpg, etc.
      while (fs.existsSync(filePath)) {
        const nameWithoutExt = `${poNumber}_${counter}`;
        filename = `${nameWithoutExt}${ext}`;
        filePath = path.join(targetFolder, filename);
        counter++;
      }

      // Write file
      fs.writeFileSync(filePath, fileBuffer);

      return {
        success: true,
        message: 'Content photo uploaded successfully',
        project_number: projectNumber,
        po_number: poNumber,
        project_name: project.projectName,
        file_path: filePath,
        filename: filename,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        error: `Upload failed: ${err.message}`
      };
    }
  }

  /**
   * Validate upload request
   */
  validateUploadRequest(poNumber, file) {
    const errors = [];

    if (!poNumber) {
      errors.push('po_number is required');
    } else if (!/^\d{5}-\d{2}$/.test(poNumber)) {
      errors.push('po_number must be in format NNNNN-XX (e.g., 26016-01)');
    }

    if (!file) {
      errors.push('file is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = UploadService;
