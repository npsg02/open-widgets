import { body, validationResult } from 'express-validator';

/**
 * Validation middleware to check for validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}

/**
 * Validation rules for chat messages
 */
export const validateChatMessage = [
  body('message')
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message must be between 1 and 10000 characters'),
  body('model')
    .optional()
    .isString()
    .isIn(['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'])
    .withMessage('Invalid model specified'),
  body('sessionId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid session ID'),
  handleValidationErrors
];

/**
 * Validation rules for model chains
 */
export const validateModelChain = [
  body('message')
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message must be between 1 and 10000 characters'),
  body('chain')
    .isArray({ min: 1, max: 5 })
    .withMessage('Chain must be an array with 1-5 steps'),
  body('chain.*.model')
    .isString()
    .isIn(['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'])
    .withMessage('Invalid model in chain step'),
  body('chain.*.name')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Step name too long'),
  handleValidationErrors
];

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}