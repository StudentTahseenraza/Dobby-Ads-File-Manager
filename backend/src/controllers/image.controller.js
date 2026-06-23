const Image = require('../models/Image');
const Folder = require('../models/Folder');
const fs = require('fs');
const path = require('path');

// @desc    Upload image to folder
// @route   POST /api/images/upload
// @access  Private
const uploadImage = async (req, res) => {
  try {
    const { name, folderId } = req.body;
    const userId = req.userId;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Check if folder exists and belongs to user
    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      // Delete uploaded file if folder doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Create image record
    const image = new Image({
      name,
      userId,
      folderId,
      imageUrl: `/uploads/${userId}/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname
    });

    await image.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: image
    });
  } catch (error) {
    console.error('Upload image error:', error);
    // Delete uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error while uploading image'
    });
  }
};

// @desc    Get all images in a folder
// @route   GET /api/images/:folderId
// @access  Private
const getImagesByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.userId;

    // Verify folder belongs to user
    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const images = await Image.find({ 
      folderId: folderId, 
      userId: userId 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching images'
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const image = await Image.findOne({ _id: id, userId });
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../', image.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting image'
    });
  }
};

// @desc    Get all images for user (across all folders)
// @route   GET /api/images
// @access  Private
const getAllUserImages = async (req, res) => {
  try {
    const userId = req.userId;

    const images = await Image.find({ userId })
      .populate('folderId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Get all images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching images'
    });
  }
};

module.exports = {
  uploadImage,
  getImagesByFolder,
  deleteImage,
  getAllUserImages
};