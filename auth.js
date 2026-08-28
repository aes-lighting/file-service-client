const config = require('../config');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logger.error('Missing API key');
    return res.status(401).json({ error: 'Missing X-API-Key header' });
  }

  const validKey = config.get('authentication.apiKey');
  if (apiKey !== validKey) {
    logger.error('Invalid API key', { provided: apiKey.substring(0, 10) });
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

module.exports = { authenticate };
