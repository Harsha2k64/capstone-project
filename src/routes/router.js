'use strict';

require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const logger      = require('../config/logger');
const config      = require('../config/app-config.js');

const app = express();

app.use(express.json());
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream: logger.stream }
));


// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
  },
});
app.use(limiter);


// ✅ Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV,
  });
});


// ✅ Readiness check (NO REDIS)
app.get('/readiness', async (req, res) => {
  try {
    // You can optionally test DB here if needed
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});


// Static files
app.use(express.static(config.root));

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/',          require('./main.js'));
app.use('/login',     require('./login.js'));
app.use('/dashboard', require('./dashboard.js'));
app.use('/ajax',      require('./ajax.js'));

const paymentController = require('../controllers/paymentController');
app.post('/payment', paymentController.processPayment);


// Error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message} — ${req.originalUrl}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
});


// Start server
const PORT = process.env.PORT || process.env.APP_PORT || 8080;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started on port ${PORT} [${process.env.NODE_ENV}]`);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — graceful shutdown starting');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 30000);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});


module.exports = app;