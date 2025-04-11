import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import 'dotenv/config';
import { globalErrorHandler, AppError } from './util/appError.js';
import logger from './util/logger/logger.js';
import routes from './api/v1/route.js';

// set up error handler
process.on('uncaughtException', (e) => {
  logger.log('error', e.stack);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  logger.log('error', e.stack);
  process.exit(1);
});

const app = express();

// Database
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true }
).then(
  () => {
    logger.log('info', 'database connected successfully')
  },
  err => { logger.log('info', 'error connecting to databasey') }
)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(compression()); // Compress all routes

// Express configuration
app.set('port', Number(process.env.PORT) || 8081);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/v1', routes);

app.all(/(.*)/, (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
