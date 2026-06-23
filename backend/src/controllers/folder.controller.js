const Folder = require('../models/Folder');
const { calculateFolderSize, formatFileSize } = require('../utils/folderSize');

// @desc    Get all folders for user
// @route   GET /api/folders
// @access  Private
const getAllFolders = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get root folders (parentFolderId is null)
    const folders = await Folder.find({ 
      userId, 
      parentFolderId: null 
    }).sort({ createdAt: -1 });

    // Calculate sizes for each folder
    const foldersWithSizes = await Promise.all(
      folders.map(async (folder) => {
        const size = await calculateFolderSize(folder._id, userId);
        return {
          ...folder.toObject(),
          size,
          formattedSize: formatFileSize(size)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: foldersWithSizes.length,
      data: foldersWithSizes
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching folders'
    });
  }
};

// @desc    Get folder children (subfolders)
// @route   GET /api/folders/:id/children
// @access  Private
const getFolderChildren = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify folder belongs to user
    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const subfolders = await Folder.find({ 
      parentFolderId: id, 
      userId 
    }).sort({ createdAt: -1 });

    // Calculate sizes for subfolders
    const subfoldersWithSizes = await Promise.all(
      subfolders.map(async (subfolder) => {
        const size = await calculateFolderSize(subfolder._id, userId);
        return {
          ...subfolder.toObject(),
          size,
          formattedSize: formatFileSize(size)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subfoldersWithSizes.length,
      data: subfoldersWithSizes
    });
  } catch (error) {
    console.error('Get folder children error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subfolders'
    });
  }
};

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name, parentFolderId = null } = req.body;
    const userId = req.userId;

    // Check if parent folder exists and belongs to user
    if (parentFolderId) {
      const parentFolder = await Folder.findOne({ _id: parentFolderId, userId });
      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
    }

    // Check if folder with same name exists at same level
    const existingFolder = await Folder.findOne({
      name,
      userId,
      parentFolderId: parentFolderId
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists at this location'
      });
    }

    // Create folder
    const folder = new Folder({
      name,
      userId,
      parentFolderId
    });

    await folder.save();

    // Get folder size (will be 0 for new folder)
    const size = await calculateFolderSize(folder._id, userId);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: {
        ...folder.toObject(),
        size,
        formattedSize: formatFileSize(size)
      }
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating folder'
    });
  }
};

// @desc    Get folder details with size
// @route   GET /api/folders/:id
// @access  Private
const getFolderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Calculate total size
    const size = await calculateFolderSize(id, userId);

    // Get subfolders count
    const subfoldersCount = await Folder.countDocuments({ 
      parentFolderId: id, 
      userId 
    });

    res.status(200).json({
      success: true,
      data: {
        ...folder.toObject(),
        size,
        formattedSize: formatFileSize(size),
        subfoldersCount
      }
    });
  } catch (error) {
    console.error('Get folder details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching folder details'
    });
  }
};

// @desc    Delete folder and all its contents
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Delete all subfolders recursively (this will also delete their images)
    // We'll use a simple approach: find and delete all descendants
    await deleteFolderRecursive(id, userId);

    res.status(200).json({
      success: true,
      message: 'Folder and all its contents deleted successfully'
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting folder'
    });
  }
};

// Helper function to delete folder recursively
async function deleteFolderRecursive(folderId, userId) {
  // Get all subfolders
  const subfolders = await Folder.find({ parentFolderId: folderId, userId });
  
  // Recursively delete each subfolder
  for (const subfolder of subfolders) {
    await deleteFolderRecursive(subfolder._id, userId);
  }

  // Delete all images in this folder
  const Image = require('../models/Image');
  await Image.deleteMany({ folderId: folderId, userId });

  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
}

module.exports = {
  getAllFolders,
  getFolderChildren,
  createFolder,
  getFolderDetails,
  deleteFolder
};