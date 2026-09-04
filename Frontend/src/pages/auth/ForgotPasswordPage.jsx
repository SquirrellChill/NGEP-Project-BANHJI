import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { forgotPassword } from '../../services/authService';
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
      await forgotPassword({ email });
      setStatusMsg({
        type: 'success',
        text: 'A reset link has been sent to your email. Please check your inbox.',
      });
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to send verification code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StitchAuthLayout
      title="Account Security"
      subtitle="Request a reset link and regain access to your workspace."
      footer={<>Remembered your password? <Link to="/login">Back to Sign In</Link></>}
    >
      <div className="stitch-form-header">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>
      </div>
      <StitchStatusMessage type={statusMsg.type}>{statusMsg.text}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>Email Address</span>
          <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit" className="stitch-submit-button" disabled={loading}>
          {loading ? 'Sending Request...' : 'Send Verification Code'}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
