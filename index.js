const app = require('./server');
const path = require('path');

// Phase 1: Project Discovery Services
const WindowsServerClient = require('./src/services/windowsServerClient');
const ProjectService = require('./src/services/projectService');
const SchedulerService = require('./src/services/schedulerService');

// Phase 2: File Upload Services
const UploadService = require('./src/services/uploadService');

// Configuration from environment
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';

/**
 * Initialize project discovery services
 */
async function initializeProjectServices() {
  try {
    console.log('Initializing project discovery services...');

    // Create Windows server client
    // For local testing: use F:\AES Projects
    // For production: use \\dc\projects with SMB credentials
    const serverClient = new WindowsServerClient({
      localPath: 'F:\\AES Projects', // Local development path
      // Production configuration:
      // uncPath: '\\\\dc\\projects',
      // useSmb: true,
      // username: process.env.WINDOWS_SERVER_USERNAME,
      // password: process.env.WINDOWS_SERVER_PASSWORD
    });

    // Initialize project service with cache file
    const projectService = new ProjectService({
      windowsServerClient: serverClient,
      cachePath: path.join(__dirname, 'cache', 'projects-cache.json')
    });

    await projectService.initialize();
    console.log('✓ ProjectService initialized');

    // Test connection
    const connTest = await serverClient.testConnection();
    if (connTest.success) {
      console.log(`✓ Server connection successful: ${connTest.path}`);
    } else {
      console.warn(`⚠ Server connection warning: ${connTest.message}`);
    }

    // Initialize scheduler for periodic scanning
    const scanInterval = process.env.PROJECT_SCAN_INTERVAL_MINUTES || 5;
    const scheduler = new SchedulerService({
      projectService: projectService,
      intervalMinutes: parseInt(scanInterval)
    });

    scheduler.start();
    console.log(`✓ Project scanner scheduled (every ${scanInterval} minutes)`);

    // Make services available to Express app
    app.locals.projectService = projectService;
    app.locals.scheduler = scheduler;

    return { projectService, scheduler };
  } catch (err) {
    console.error('Failed to initialize project services', err.message);
    throw err;
  }
}

/**
 * Initialize file upload services
 */
function initializeUploadServices(projectService) {
  try {
    console.log('Initializing file upload services...');

    // Create upload service with project service reference
    const uploadService = new UploadService({
      projectService: projectService,
      baseProjectPath: 'F:\\AES Projects' // Local development path
    });

    // Make upload service available to Express app
    app.locals.uploadService = uploadService;
    console.log('✓ UploadService initialized');

    return uploadService;
  } catch (err) {
    console.error('Failed to initialize upload services', err.message);
    throw err;
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize project services
    const { projectService } = await initializeProjectServices();

    // Initialize upload services (requires projectService)
    initializeUploadServices(projectService);

    // Start Express server
    const server = app.listen(PORT, HOST, () => {
      console.log(`✓ AES File Service V0 started on http://${HOST}:${PORT}`);
      console.log(`✓ API Key configured: ${process.env.API_KEY ? 'Yes' : 'No'}`);
      console.log('\n📁 Ready to receive uploads!\n');
    });

    process.on('SIGINT', () => {
      console.log('Shutting down...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Fatal startup error', err.message);
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Start the server
startServer();
