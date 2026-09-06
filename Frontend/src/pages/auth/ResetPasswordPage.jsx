import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { useLanguage } from '../../context/LanguageContext';
import { resetPassword } from '../../services/authService';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatusMsg({ type: 'error', text: t('resetMissing') });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: t('passwordsNoMatch') });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await resetPassword({ token, password });
      setStatusMsg({ type: 'success', text: t('resetSuccess') });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to reset password. Token may be invalid or expired.',
      });
      setLoading(false);
    }
  };

  return (
    <StitchAuthLayout
      title={t('resetPassword')}
      subtitle={t('resetSubtitle')}
      footer={<Link to="/login">{t('backToSignIn')}</Link>}
    >
      <div className="stitch-form-header">
        <h2>{t('setNewPassword')}</h2>
        <p>{t('enterNewPassword')}</p>
      </div>
      <StitchStatusMessage type={statusMsg.type}>{statusMsg.text}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>{t('newPassword')}</span>
          <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="stitch-field">
          <span>{t('confirmNewPassword')}</span>
          <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        <button type="submit" className="stitch-submit-button" disabled={loading}>
          {loading ? t('updatingPassword') : t('resetPassword')}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
