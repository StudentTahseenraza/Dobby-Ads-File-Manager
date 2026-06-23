// components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../Layout/Layout';
import FolderTree from './FolderTree';
import ImageGrid from './ImageGrid';
import CreateFolderModal from '../Modals/CreateFolderModal';
import UploadImageModal from '../Modals/UploadImageModal';
import { FaPlus, FaUpload, FaFolderPlus } from 'react-icons/fa';
import { getFolders, getFolderChildren } from '../../services/folder';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFolders();
      setFolders(response.data.data || []);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleFolderClick = async (folder) => {
    try {
      setLoading(true);
      const response = await getFolderChildren(folder._id);
      setSelectedFolder(folder);
      setSelectedFolderName(folder.name);
      setFolders(response.data.data || []);
      setCurrentPath([...currentPath, folder]);
      // Trigger image refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error loading folder contents:', error);
      toast.error('Failed to load folder contents');
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = async (index) => {
    if (index === -1) {
      // Go to root
      setSelectedFolder(null);
      setSelectedFolderName('');
      setCurrentPath([]);
      await loadFolders();
      setRefreshTrigger(prev => prev + 1);
    } else {
      const folder = currentPath[index];
      setSelectedFolder(folder);
      setSelectedFolderName(folder.name);
      setCurrentPath(currentPath.slice(0, index + 1));
      try {
        setLoading(true);
        const response = await getFolderChildren(folder._id);
        setFolders(response.data.data || []);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error loading folder contents:', error);
        toast.error('Failed to load folder contents');
      } finally {
        setLoading(false);
      }
    }
  };

  const refreshCurrentView = useCallback(async () => {
    console.log('Refreshing view...');
    if (selectedFolder) {
      try {
        const response = await getFolderChildren(selectedFolder._id);
        setFolders(response.data.data || []);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error refreshing folders:', error);
      }
    } else {
      await loadFolders();
    }
  }, [selectedFolder, loadFolders]);

  const handleUploadSuccess = useCallback(async () => {
    console.log('Upload success, refreshing...');
    await refreshCurrentView();
    // Force image refresh
    setRefreshTrigger(prev => prev + 1);
  }, [refreshCurrentView]);

  const handleFolderCreated = useCallback(async () => {
    console.log('Folder created, refreshing...');
    await refreshCurrentView();
  }, [refreshCurrentView]);

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>My Drive</h1>
            <div className="breadcrumb">
              <span 
                className="breadcrumb-item" 
                onClick={() => handleBreadcrumbClick(-1)}
              >
                Root
              </span>
              {currentPath.map((folder, index) => (
                <span key={folder._id}>
                  <span className="breadcrumb-separator">/</span>
                  <span 
                    className="breadcrumb-item"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {folder.name}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowCreateFolder(true)}
            >
              <FaFolderPlus /> New Folder
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => {
                if (!selectedFolder) {
                  toast.warning('Please select a folder first');
                  return;
                }
                setShowUploadImage(true);
              }}
            >
              <FaUpload /> Upload Image
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <>
              <FolderTree 
                folders={folders} 
                onFolderClick={handleFolderClick}
                onRefresh={refreshCurrentView}
                selectedFolderId={selectedFolder?._id}
              />
              <ImageGrid 
                folderId={selectedFolder?._id || null}
                refreshTrigger={refreshTrigger}
                onRefresh={handleUploadSuccess}
              />
            </>
          )}
        </div>

        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          parentFolderId={selectedFolder?._id || null}
          onSuccess={handleFolderCreated}
        />

        <UploadImageModal
          isOpen={showUploadImage}
          onClose={() => setShowUploadImage(false)}
          folderId={selectedFolder?._id || null}
          folderName={selectedFolderName || 'Root'}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;