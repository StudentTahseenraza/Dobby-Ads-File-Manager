import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaFolder, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <FaFolder className="brand-icon" />
          <span>Dobby Drive</span>
        </div>

        <div className="navbar-right">
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;