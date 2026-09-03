import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Zap, KeyRound } from 'lucide-react';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: defaultEmail,
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">
        {/* Left Panel: Hero Graphic */}
        <div className="login-hero-panel">
          <svg className="topo-bottom-right" viewBox="0 0 200 200" fill="none">
            <path d="M20 180 Q 80 120 140 160 T 190 100" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
          </svg>

          <div className="hero-content center-aligned">
            <div className="security-icon-badge"><KeyRound size={28} /></div>
            <div className="brand-container">
              <span className="brand-logo-icon"><Zap size={18} /></span>
              <span className="brand-name">KotChomnol</span>
            </div>
            <h1 className="hero-title">Reset Password</h1>
            <p className="hero-subtitle">
              Choose a strong password to keep your dashboard secure.
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="login-form-panel">
          <div className="form-header-container">
            <h2 className="form-header">Set New Password</h2>
            <p className="form-subheader">Enter the code sent to your mailbox.</p>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">Password updated! Redirecting to login...</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="dark-pill-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Verification Code</label>
              <input
                type="text"
                name="code"
                required
                placeholder="0757"
                value={formData.code}
                onChange={handleChange}
                className="dark-pill-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                className="dark-pill-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="dark-pill-input"
              />
            </div>

            <button type="submit" className="primary-submit-btn">
              Reset Password
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