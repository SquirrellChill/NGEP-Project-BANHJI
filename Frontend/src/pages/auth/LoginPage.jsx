import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { getErrorMessage } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">

        {/* Left Panel: Form Area */}
        <div className="login-form-panel">
          <div className="form-header-container">
            <h2 className="form-header">Sign In</h2>
            <p className="form-subheader">Enter your credentials to continue.</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="dark-pill-input"
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label className="input-label">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="dark-pill-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-submit-btn"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer-text">
            New here?{' '}
            <Link to="/register" className="login-link">
              Create an Account
            </Link>
          </p>

          {/* Terms and Privacy Policy Links */}
          <div className="terms-policy-footer">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="sub-link">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="sub-link">Privacy Policy</Link>.
          </div>
        </div>

        {/* Right Panel: Hero & Brand Banner */}
        <div className="login-hero-panel">
          <svg className="topo-top-left" viewBox="0 0 200 200" fill="none">
            <path d="M10 80 Q 50 20 100 60 T 190 20" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <path d="M10 100 Q 60 40 120 80 T 190 50" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="2" />
          </svg>

          <svg className="topo-bottom-right" viewBox="0 0 200 200" fill="none">
            <path d="M20 180 Q 80 120 140 160 T 190 100" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <path d="M40 190 Q 90 140 150 170 T 190 120" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="2" />
          </svg>

          <div className="dot-grid">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="dot"></span>
            ))}
          </div>

          <div className="hero-content">
            <div className="brand-container">
              <span className="brand-logo-icon"><Zap size={18} /></span>
              <span className="brand-name">KotChomnol</span>
            </div>

            <h1 className="hero-title">Welcome Back</h1>
            <p className="hero-subtitle">
              Sign in to access your existing account and control your live dashboard.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}