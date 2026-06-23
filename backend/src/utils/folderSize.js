const Image = require('../models/Image');
const Folder = require('../models/Folder');

/**
 * Recursively calculate folder size including all nested folders
 * @param {string} folderId - Folder ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Total size in bytes
 */
async function calculateFolderSize(folderId, userId) {
  try {
    // Get all images directly in this folder
    const images = await Image.find({ 
      folderId: folderId, 
      userId: userId 
    });
    
    let totalSize = images.reduce((sum, img) => sum + img.size, 0);

    // Get all subfolders
    const subfolders = await Folder.find({ 
      parentFolderId: folderId, 
      userId: userId 
    });

    // Recursively calculate size of each subfolder
    for (const subfolder of subfolders) {
      const subfolderSize = await calculateFolderSize(subfolder._id, userId);
      totalSize += subfolderSize;
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating folder size:', error);
    return 0;
  }
}

/**
 * Get folder size with caching
 * @param {string} folderId - Folder ID
 * @param {string} userId - User ID
 * @returns {Promise<{size: number, formatted: string}>}
 */
async function getFolderSize(folderId, userId) {
  const sizeInBytes = await calculateFolderSize(folderId, userId);
  const formatted = formatFileSize(sizeInBytes);
  return { size: sizeInBytes, formatted };
}

/**
 * Format file size to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Batch calculate sizes for multiple folders
 * @param {Array} folders - Array of folder objects
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Folders with sizes
 */
async function batchCalculateFolderSizes(folders, userId) {
  const foldersWithSizes = await Promise.all(
    folders.map(async (folder) => {
      const size = await calculateFolderSize(folder._id, userId);
      return {
        ...folder.toObject(),
        size: size,
        formattedSize: formatFileSize(size)
      };
    })
  );
  return foldersWithSizes;
}

module.exports = {
  calculateFolderSize,
  getFolderSize,
  formatFileSize,
  batchCalculateFolderSizes
};