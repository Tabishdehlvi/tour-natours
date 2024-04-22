const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  console.log('ERR', err);
  const value = err.keyValue.email;
  const message = `Duplicate field value: '${value}'. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login in again!', 401);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      error: err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // B) RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // a) Operational, trusted error: send mmessage to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // b) Programming or other unkown error: don't leak error details
    } else {
      // 1) Log eror
      // console.log('ERROR 🌟', err);
      // 2) Sent generit message
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  } else {
    // B) RENDERED WEBSITE
    // a) Operational, trusted error: send mmessage to client
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
      // b) Programming or other unkown error: don't leak error details
    } else {
      // 1) Log eror
      // console.log('ERROR 🌟', err);
      // 2) Sent generit message
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later.',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NOD_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NOD_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorProd(err, req, res);
  }
};
