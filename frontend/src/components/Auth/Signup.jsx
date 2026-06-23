import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // FIXED: Better password validation
  const validatePassword = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    // Check minimum length
    if (password.length > 0 && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    // Clear error if everything is valid
    setPasswordError('');
    return true;
  };

  // Validate on password change
  useEffect(() => {
    if (password || confirmPassword) {
      validatePassword();
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    // Validate passwords
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us and start organizing your images</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={email && !email.includes('@') ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={password && password.length < 6 ? 'input-error' : ''}
              />
            </div>
            {password && password.length < 6 && (
              <div className="hint-text">Password must be at least 6 characters</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={
                  confirmPassword && password !== confirmPassword ? 'input-error' : 
                  confirmPassword && password === confirmPassword ? 'input-success' : ''
                }
              />
            </div>
            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <div className="success-message">✓ Passwords match</div>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !!passwordError || !email || !password || !confirmPassword}
          >
            {loading ? 'Creating account...' : (
              <>
                <FaUserPlus /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;