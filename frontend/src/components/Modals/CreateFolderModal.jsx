import React, { useState } from 'react';
import { FaTimes, FaFolderPlus } from 'react-icons/fa';
import { createFolder } from '../../services/folder';
import { toast } from 'react-toastify';
import './Modal.css';

const CreateFolderModal = ({ isOpen, onClose, parentFolderId, onSuccess }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setLoading(true);
      await createFolder({
        name: folderName.trim(),
        parentFolderId: parentFolderId || null
      });
      
      toast.success('Folder created successfully!');
      setFolderName('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Folder</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="folderName">Folder Name</label>
            <input
              type="text"
              id="folderName"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !folderName.trim()}
            >
              {loading ? 'Creating...' : (
                <>
                  <FaFolderPlus /> Create Folder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;