const { body, validationResult } = require('express-validator');

// Validation rules
const validateSignup = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateFolder = [
  body('name')
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ max: 100 })
    .withMessage('Folder name cannot exceed 100 characters')
    .trim()
];

const validateImage = [
  body('name')
    .notEmpty()
    .withMessage('Image name is required')
    .isLength({ max: 100 })
    .withMessage('Image name cannot exceed 100 characters')
    .trim(),
  body('folderId')
    .notEmpty()
    .withMessage('Folder ID is required')
    .isMongoId()
    .withMessage('Invalid folder ID')
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateFolder,
  validateImage,
  handleValidationErrors
};