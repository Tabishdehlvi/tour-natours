const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorControllers');
const AppError = require('./utils/appError');

const app = express();

// GLOBAL MIDDLEWARES

// Set Security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NOD_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from the API
const limiter = rateLimit({
  // you can call
  max: 100, // 100 API request
  windowMs: 60 * 60 * 1000, // per Hour
  message: 'Too many requests from this IP, please try again in an hour!', // error message when its cross
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(XSS());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
