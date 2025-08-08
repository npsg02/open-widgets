import rateLimit from 'express-rate-limit';

// Standard rate limiting for general API calls
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for chat completions
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 chat requests per minute
  message: 'Too many chat requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiting for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 uploads per 5 minutes
  message: 'Too many file uploads, please wait before uploading more files.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for model chains (expensive operations)
export const chainLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 chain operations per 10 minutes
  message: 'Too many model chain requests, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});