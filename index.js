const app = require('./server');
const config = require('./config');
const logger = require('./utils/logger');

const PORT = config.get('service.port');
const HOST = config.get('service.host');

const server = app.listen(PORT, HOST, () => {
  logger.info(`✓ AES File Service V0 started on http://${HOST}:${PORT}`);
  logger.info(`✓ Root directory: ${config.get('storage.rootDirectory')}`);
  logger.info(`✓ Whitelisted directories: ${config.getDirectories().map(d => d.path).join(', ')}`);
  logger.info(`✓ API Key: ${config.get('authentication.apiKey')}`);
  console.log('\n📁 Ready to receive uploads!\n');
});

process.on('SIGINT', () => {
  logger.info('Shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
