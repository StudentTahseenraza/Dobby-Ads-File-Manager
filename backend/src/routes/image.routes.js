const express = require('express');
const router = express.Router();
const {
  uploadImage,
  getImagesByFolder,
  deleteImage,
  getAllUserImages
} = require('../controllers/image.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');
const {
  validateImage,
  handleValidationErrors
} = require('../utils/validation');

// All routes are protected
router.use(authMiddleware);

// Get all user images
router.get('/', getAllUserImages);

// Upload image
router.post(
  '/upload',
  handleUpload,
  validateImage,
  handleValidationErrors,
  uploadImage
);

// Get images by folder
router.get('/:folderId', getImagesByFolder);

// Delete image
router.delete('/:id', deleteImage);

module.exports = router;