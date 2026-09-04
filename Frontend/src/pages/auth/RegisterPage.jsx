import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { getErrorMessage, register } from '../../services/authService';
import './LoginPage.css';

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
    <StitchAuthLayout
      title="Create Account"
      subtitle="Set up your shop workspace and start recording daily sales."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <div className="stitch-form-header">
        <h2>Sign Up</h2>
        <p>Enter your details to create your workspace.</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <div className="stitch-form-grid">
          <label className="stitch-field">
            <span>First Name</span>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
          </label>
          <label className="stitch-field">
            <span>Last Name</span>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
          </label>
        </div>
        <label className="stitch-field">
          <span>Phone Number</span>
          <input type="tel" name="phoneNumber" placeholder="+855 12 345 678" value={formData.phoneNumber} onChange={handleChange} required />
        </label>
        <label className="stitch-field">
          <span>Email Address</span>
          <input type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
        </label>
        <label className="stitch-field">
          <span>Password</span>
          <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading} className="stitch-submit-button">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
