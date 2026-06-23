const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
folderSchema.index({ userId: 1, parentFolderId: 1 });
folderSchema.index({ userId: 1, path: 1 });

// Pre-save middleware to generate path
folderSchema.pre('save', async function(next) {
  if (this.isNew && this.parentFolderId) {
    const parentFolder = await this.constructor.findById(this.parentFolderId);
    if (parentFolder) {
      this.path = parentFolder.path ? `${parentFolder.path}/${this.name}` : this.name;
    }
  } else if (this.isNew && !this.parentFolderId) {
    this.path = this.name;
  }
  next();
});

module.exports = mongoose.model('Folder', folderSchema);