const express = require('express');
const router = express.Router();
const {
  getAllFolders,
  getFolderChildren,
  createFolder,
  getFolderDetails,
  deleteFolder
} = require('../controllers/folder.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
  validateFolder,
  handleValidationErrors
} = require('../utils/validation');

// All routes are protected
router.use(authMiddleware);

// Get all root folders
router.get('/', getAllFolders);

// Get folder details
router.get('/:id', getFolderDetails);

// Get folder children
router.get('/:id/children', getFolderChildren);

// Create folder
router.post('/', validateFolder, handleValidationErrors, createFolder);

// Delete folder
router.delete('/:id', deleteFolder);

module.exports = router;