import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/auth/AuthCard';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';
import { verifyEmail, getErrorMessage } from '../../services/authService';

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
    <AuthCard title="Verify Email" subtitle="Enter the code sent to your inbox">
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>
    </AuthCard>
  );
}