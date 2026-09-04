import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    <StitchAuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your voice sales dashboard."
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <div className="stitch-form-header">
        <h2>Sign In</h2>
        <p>Enter your credentials to continue.</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>Email Address</span>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="stitch-field">
          <span className="field-label-row">
            Password
            <Link to="/forgot-password">Forgot Password?</Link>
          </span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading} className="stitch-submit-button">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
