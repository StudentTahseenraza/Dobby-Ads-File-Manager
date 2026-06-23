// UploadImageModal.jsx - Complete working version
import React, { useState, useCallback, useEffect } from 'react';
import { FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../../services/image';
import { toast } from 'react-toastify';
import './Modal.css';

const UploadImageModal = ({ isOpen, onClose, folderId, onSuccess }) => {
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      if (!imageName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setImageName(nameWithoutExt);
      }
    }
  }, [imageName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const resetForm = () => {
    setImageName('');
    setImageFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageName.trim()) {
      toast.error('Please enter an image name');
      return;
    }

    if (!imageFile) {
      toast.error('Please select an image file');
      return;
    }

    if (!folderId) {
      toast.error('Please select a folder first');
      return;
    }

    const formData = new FormData();
    formData.append('name', imageName.trim());
    formData.append('folderId', folderId);
    formData.append('image', imageFile);

    try {
      setLoading(true);
      await uploadImage(formData);
      toast.success('Image uploaded successfully!');
      resetForm();
      onClose();
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Image</h2>
          <button className="modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="imageName">Image Name</label>
            <input
              type="text"
              id="imageName"
              placeholder="Enter image name..."
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Image File</label>
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <p>Click or drag to change</p>
                </div>
              ) : (
                <div className="dropzone-content">
                  <FaImage className="dropzone-icon" />
                  <p>
                    {isDragActive 
                      ? 'Drop the image here...' 
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <span className="dropzone-hint">Supports: JPEG, PNG, GIF, WEBP (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !imageFile || !imageName.trim() || !folderId}
            >
              {loading ? 'Uploading...' : (
                <>
                  <FaUpload /> Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;