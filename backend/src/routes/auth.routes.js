const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getCurrentUser,
  logout
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
  validateSignup,
  validateLogin,
  handleValidationErrors
} = require('../utils/validation');

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;