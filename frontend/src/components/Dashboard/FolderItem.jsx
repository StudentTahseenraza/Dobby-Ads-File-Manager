// components/Dashboard/FolderItem.jsx
import React from 'react';
import { FaFolder, FaTrash } from 'react-icons/fa';
import { deleteFolder } from '../../services/folder';
import { toast } from 'react-toastify';
import './FolderItem.css';

const FolderItem = ({ folder, onClick, onRefresh, isSelected }) => {
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${folder.name}" and all its contents?`)) {
      return;
    }

    try {
      await deleteFolder(folder._id);
      toast.success('Folder deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const formatSize = (size) => {
    if (!size && size !== 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let sizeValue = size;
    while (sizeValue >= 1024 && unitIndex < units.length - 1) {
      sizeValue /= 1024;
      unitIndex++;
    }
    return `${sizeValue.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div 
      className={`folder-item ${isSelected ? 'selected' : ''}`} 
      onClick={() => onClick(folder)}
    >
      <div className="folder-item-left">
        <FaFolder className={`folder-icon ${isSelected ? 'selected' : ''}`} />
        <div className="folder-info">
          <span className="folder-name">{folder.name}</span>
          <span className="folder-meta">
            {formatSize(folder.size)} • {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
      <div className="folder-item-right">
        <span className="folder-size">{formatSize(folder.size)}</span>
        <button 
          className="delete-btn"
          onClick={handleDelete}
          title="Delete folder"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default FolderItem;