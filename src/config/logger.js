'use strict';

const { createLogger, format, transports } = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: 'info',
  format: isProd
    ? format.combine(format.timestamp(), format.json())
    : format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ level, message, timestamp }) =>
          `${timestamp} [${level}] ${message}`
        )
      ),
  transports: [new transports.Console()],
});

logger.stream = { write: (msg) => logger.http(msg.trim()) };

module.exports = logger;