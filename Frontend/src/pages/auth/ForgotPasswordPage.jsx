import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Lock } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await axios.post('http://localhost:8000/auth/forgot-password', { email });

      // Keep user on this page and notify them to check their email inbox
      setStatusMsg({
        type: 'success',
        text: 'A reset link has been sent to your email. Please check your inbox.'
      });
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to send verification code. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">
        {/* Left Panel */}
        <div className="login-hero-panel">
          <svg className="topo-top-left" viewBox="0 0 200 200" fill="none">
            <path d="M10 80 Q 50 20 100 60 T 190 20" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <path d="M10 100 Q 60 40 120 80 T 190 50" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="2" />
          </svg>

          <div className="hero-content center-aligned">
            <div className="security-icon-badge"><Lock size={28} /></div>
            <div className="brand-container">
              <span className="brand-logo-icon"><Zap size={18} /></span>
              <span className="brand-name">KotChomnol</span>
            </div>
            <h1 className="hero-title">Account Security</h1>
            <p className="hero-subtitle">
              Don't worry! We'll send a password reset link to help you regain access.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-form-panel">
          <div className="form-header-container">
            <h2 className="form-header">Forgot Password</h2>
            <p className="form-subheader">Enter your email to receive a password reset link.</p>
          </div>

          {statusMsg.text && (
            <div style={{ 
              color: statusMsg.type === 'error' ? '#ef4444' : '#22c55e', 
              fontSize: '14px', 
              marginBottom: '12px' 
            }}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark-pill-input"
              />
            </div>

            <button type="submit" className="primary-submit-btn" disabled={loading}>
              {loading ? 'Sending Request...' : 'Send Verification Code'}
            </button>
          </form>

          <p className="login-footer-text">
            Remembered your password?{' '}
            <Link to="/login" className="login-link">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}