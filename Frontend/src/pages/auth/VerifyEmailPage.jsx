import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { getErrorMessage, verifyEmail } from '../../services/authService';
import './LoginPage.css';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyEmail({ email, code });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StitchAuthLayout
      title="Verify Email"
      subtitle="Enter the code sent to your inbox."
      footer={<>Already verified? <Link to="/login">Sign in</Link></>}
    >
      <div className="stitch-form-header">
        <h2>Verify Email</h2>
        <p>Confirm your email address to activate your workspace.</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="stitch-field">
          <span>Verification Code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} required />
        </label>
        <button type="submit" className="stitch-submit-button" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
