'use strict';

const { createLogger, format, transports } = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: isProd ? 'info' : 'debug',

  format: isProd
    ? format.combine(
        format.timestamp(),
        format.errors({ stack: true }), // ✅ include stack traces
        format.json()
      )
    : format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} [${level}] ${message}\n${stack}`
            : `${timestamp} [${level}] ${message}`;
        })
      ),

  transports: [
    new transports.Console()
  ],
});

// ✅ For morgan HTTP logs
logger.stream = {
  write: (msg) => logger.info(msg.trim()),
};

module.exports = logger;