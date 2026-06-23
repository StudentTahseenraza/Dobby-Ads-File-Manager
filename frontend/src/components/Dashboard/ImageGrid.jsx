// components/Dashboard/ImageGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaImage, FaTrash, FaDownload, FaSpinner } from 'react-icons/fa';
import { getImagesByFolder, deleteImage } from '../../services/image';
import { toast } from 'react-toastify';
import './ImageGrid.css';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';

const ImageGrid = ({ folderId, refreshTrigger, onRefresh }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getImageUrl = useCallback((imageUrl) => {
    // Ensure the URL is properly formatted
    if (!imageUrl) return '';
    // If the URL already starts with http, return it as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend the base URL
    return `${IMAGE_BASE_URL}${imageUrl}`;
  }, []);

  const loadImages = useCallback(async () => {
    if (!folderId) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading images for folder:', folderId);
      const response = await getImagesByFolder(folderId);
      console.log('Images loaded:', response.data.data);
      setImages(response.data.data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images');
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  // Load images when folder changes or refresh is triggered
  useEffect(() => {
    loadImages();
  }, [loadImages, refreshTrigger]);

  const handleDelete = async (imageId, imageName) => {
    if (!window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
      return;
    }

    try {
      await deleteImage(imageId);
      toast.success('Image deleted successfully');
      await loadImages();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Show message when no folder is selected
  if (!folderId) {
    return (
      <div className="image-grid empty">
        <FaImage className="empty-icon" />
        <h3>Select a folder</h3>
        <p>Choose a folder from the left to view its images</p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="image-grid loading">
        <FaSpinner className="spinning" />
        <p>Loading images...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="image-grid error">
        <p>{error}</p>
        <button onClick={loadImages} className="retry-btn">Retry</button>
      </div>
    );
  }

  // Show empty state
  if (images.length === 0) {
    return (
      <div className="image-grid empty">
        <FaImage className="empty-icon" />
        <h3>No images in this folder</h3>
        <p>Upload some images to get started</p>
      </div>
    );
  }

  return (
    <div className="image-grid">
      <div className="image-grid-header">
        <h2>Images</h2>
        <span className="image-count">{images.length} images</span>
      </div>
      <div className="image-grid-container">
        {images.map((image) => {
          const imageUrl = getImageUrl(image.imageUrl);
          console.log('Image URL:', imageUrl); // Debug log
          
          return (
            <div key={image._id} className="image-card">
              <div className="image-card-image">
                <img 
                  src={imageUrl} 
                  alt={image.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50" y="110" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                    e.target.onerror = null;
                  }}
                />
                <div className="image-overlay">
                  <button 
                    className="overlay-btn delete"
                    onClick={() => handleDelete(image._id, image.name)}
                    title="Delete image"
                  >
                    <FaTrash />
                  </button>
                  <a 
                    href={imageUrl} 
                    download={image.name}
                    className="overlay-btn download"
                    title="Download image"
                  >
                    <FaDownload />
                  </a>
                </div>
              </div>
              <div className="image-card-info">
                <span className="image-name" title={image.name}>
                  {image.name}
                </span>
                <div className="image-meta">
                  <span>{formatSize(image.size)}</span>
                  <span>•</span>
                  <span>{formatDate(image.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGrid;