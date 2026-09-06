import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { useLanguage } from '../../context/LanguageContext';
import { forgotPassword } from '../../services/authService';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
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
        text: t('resetLinkSent'),
      });
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || t('resetLinkFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StitchAuthLayout
      title={t('accountSecurity')}
      subtitle={t('resetRequestSubtitle')}
      footer={<>{t('rememberedPassword')} <Link to="/login">{t('backToSignIn')}</Link></>}
    >
      <div className="stitch-form-header">
        <h2>{t('forgotPasswordTitle')}</h2>
        <p>{t('enterEmailReset')}</p>
      </div>
      <StitchStatusMessage type={statusMsg.type}>{statusMsg.text}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>{t('emailAddress')}</span>
          <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit" className="stitch-submit-button" disabled={loading}>
          {loading ? t('sendingRequest') : t('sendReset')}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
