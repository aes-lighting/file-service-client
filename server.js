const express = require('express');
const filesRouter = require('./routes/files');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', filesRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
