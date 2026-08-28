const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'service.log');

const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? ' ' + JSON.stringify(data) : '';
    const log = `[${timestamp}] INFO: ${message}${dataStr}`;
    console.log(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const errStr = error instanceof Error ? error.message : JSON.stringify(error);
    const log = `[${timestamp}] ERROR: ${message} ${errStr}`;
    console.error(log);
    fs.appendFileSync(logFile, log + '\n');
  }
};

module.exports = logger;
