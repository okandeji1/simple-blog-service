/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import logger from './logger/logger.js';
import { buildResponse } from './utility.js';

export class AppError extends Error {
  statusCode;

  status;
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = false;

    if (`${statusCode}`.startsWith('5')) {
      Error.captureStackTrace(this, this.constructor);
    }
    // return;
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  return buildResponse(res, err.statusCode, {
    status: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  logger.log('error', `internal server error: ${err}`);
  logger.log('error', `stack trace: ${err.stack}`);

  return buildResponse(res, err.statusCode, {
    status: false,
    message: err.statusCode.toString().startsWith('4')
      ? err.message
      : 'internal server error, if this persit, please contact support',
    data: null,
  });
};

// NOTE: Do not remove the unused arguments
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = async (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'FAILURE' : 'ERROR';
  err.isStaging = process.env.NODE_ENV !== 'production';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};

export const catchAsyncError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
