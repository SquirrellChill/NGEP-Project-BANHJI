import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Zap, Lock } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract token from URL parameter (?token=...)
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatusMsg({ type: 'error', text: 'Reset token is missing from the link.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      // Send payload with exact keys expected by ResetPasswordRequest schema: token and password
      await axios.post('http://localhost:8000/auth/reset-password', {
        token: token,
        password: password
      });

      setStatusMsg({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to reset password. Token may be invalid or expired.'
      });
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">
        {/* Left Panel */}
        <div className="login-hero-panel">
          <div className="hero-content center-aligned">
            <div className="security-icon-badge"><Lock size={28} /></div>
            <div className="brand-container">
              <span className="brand-logo-icon"><Zap size={18} /></span>
              <span className="brand-name">KotChomnol</span>
            </div>
            <h1 className="hero-title">Reset Password</h1>
            <p className="hero-subtitle">Choose a strong password to keep your account secure.</p>
          </div>
        </div>

        {/* Right Panel Form */}
        <div className="login-form-panel">
          <div className="form-header-container">
            <h2 className="form-header">Set New Password</h2>
            <p className="form-subheader">Enter your new security credentials below.</p>
          </div>

          {statusMsg.text && (
            <div style={{ color: statusMsg.type === 'error' ? '#ef4444' : '#22c55e', fontSize: '14px', marginBottom: '12px' }}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark-pill-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="dark-pill-input"
              />
            </div>

            <button type="submit" className="primary-submit-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>

          <p className="login-footer-text">
            <Link to="/login" className="login-link">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}