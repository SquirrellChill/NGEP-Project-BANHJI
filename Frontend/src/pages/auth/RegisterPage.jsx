import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { register, getErrorMessage } from '../../services/authService';
import './LoginPage.css'; // Shared theme styles across auth pages

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
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
      await register(formData);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">

        {/* Left Panel: Hero & Brand Banner */}
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

            <h1 className="hero-title">Create Account</h1>
            <p className="hero-subtitle">
              Join KotChomnol today to manage real-time voice recognition, dashboard analytics, and logs effortlessly.
            </p>
          </div>
        </div>

        {/* Right Panel: Registration Form */}
        <div className="login-form-panel">
          <div className="form-header-container">
            <h2 className="form-header">Sign Up</h2>
            <p className="form-subheader">Enter your details to create your workspace.</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="dark-pill-input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="dark-pill-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+855 12 345 678"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="dark-pill-input"
              />
            </div>

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
              <label className="input-label">Password</label>
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="login-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </p>

          <div className="terms-policy-footer">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="sub-link">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="sub-link">Privacy Policy</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}