import path from 'path';
import dirname from 'es-dirname';
import { createLogger, transports, format } from 'winston';

const __dirname = dirname();

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.simple(),
      ),
      handleExceptions: true,
    }),
    new transports.File({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/combined.log'),
    }),
    new transports.File({
      level: 'warn',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/warn.log'),
    }),

    new transports.File({
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(__dirname, 'logs/errors.log'),
      handleExceptions: true,
    }),
  ],
});

export default logger;
