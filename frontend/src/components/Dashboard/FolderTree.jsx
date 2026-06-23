import React, { useState } from 'react';
import FolderItem from './FolderItem';
import { FaFolderOpen } from 'react-icons/fa';
import './FolderTree.css';

const FolderTree = ({ folders, onFolderClick, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (folders.length === 0 && !searchTerm) {
    return (
      <div className="folder-tree empty">
        <FaFolderOpen className="empty-icon" />
        <h3>No folders yet</h3>
        <p>Create your first folder to get started</p>
      </div>
    );
  }

  return (
    <div className="folder-tree">
      <div className="folder-tree-header">
        <h2>Folders</h2>
        <div className="folder-stats">
          {folders.length} folder{folders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="folder-search">
        <input
          type="text"
          placeholder="Search folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="folder-list">
        {filteredFolders.length === 0 ? (
          <div className="no-results">No folders found</div>
        ) : (
          filteredFolders.map((folder) => (
            <FolderItem
              key={folder._id}
              folder={folder}
              onClick={onFolderClick}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FolderTree;