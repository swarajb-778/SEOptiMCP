import { body, param, query, validationResult } from 'express-validator';
import { APIError } from './errorHandling.js';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  next();
};

// URL validation rules
export const validateURL = [
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL with http or https protocol')
    .isLength({ min: 10, max: 2000 })
    .withMessage('URL must be between 10 and 2000 characters'),
  handleValidationErrors
];

// Analysis ID validation
export const validateAnalysisId = [
  param('analysisId')
    .isLength({ min: 1 })
    .withMessage('Analysis ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Analysis ID contains invalid characters'),
  handleValidationErrors
];

// Keyword validation rules
export const validateKeywords = [
  body('keywords')
    .isArray({ min: 1, max: 50 })
    .withMessage('Keywords must be an array with 1-50 items'),
  body('keywords.*')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each keyword must be 1-100 characters long'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// User registration validation
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors
];

// Analysis options validation
export const validateAnalysisOptions = [
  body('options.maxSuggestions')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Max suggestions must be between 10 and 100'),
  body('options.includeCompetitorAnalysis')
    .optional()
    .isBoolean()
    .withMessage('Include competitor analysis must be a boolean'),
  body('options.generateContentIdeas')
    .optional()
    .isBoolean()
    .withMessage('Generate content ideas must be a boolean'),
  body('options.location')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Location must be between 2 and 50 characters'),
  handleValidationErrors
];

// Content generation validation
export const validateContentGeneration = [
  body('topic')
    .isString()
    .isLength({ min: 3, max: 200 })
    .withMessage('Topic must be between 3 and 200 characters'),
  body('targetKeywords')
    .isArray({ min: 1, max: 10 })
    .withMessage('Target keywords must be an array with 1-10 items'),
  body('contentType')
    .optional()
    .isIn(['blog', 'article', 'guide', 'tutorial', 'review', 'comparison'])
    .withMessage('Content type must be one of: blog, article, guide, tutorial, review, comparison'),
  body('wordCount')
    .optional()
    .isInt({ min: 300, max: 5000 })
    .withMessage('Word count must be between 300 and 5000'),
  handleValidationErrors
]; 