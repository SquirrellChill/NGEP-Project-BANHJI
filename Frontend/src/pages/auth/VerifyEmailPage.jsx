import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage, verifyEmail } from '../../services/authService';
import './LoginPage.css';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = t('fieldRequired');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = t('invalidEmail');
    if (!code.trim()) nextErrors.code = t('fieldRequired');
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await verifyEmail({ email, code });
      navigate('/login');
    } catch (err) {
      const message = getErrorMessage(err);
      const lower = String(message).toLowerCase();
      if (lower.includes('code') || lower.includes('verification') || lower.includes('invalid')) {
        setFieldErrors({ code: t('invalidVerificationCode') });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StitchAuthLayout
      title={t('verifyEmail')}
      subtitle={t('verifySubtitle')}
      footer={<>{t('alreadyVerified')} <Link to="/login">{t('signIn')}</Link></>}
    >
      <div className="stitch-form-header">
        <h2>{t('verifyEmail')}</h2>
        <p>{t('confirmEmail')}</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>{t('email')}</span>
          <input type="email" value={email} onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((current) => ({ ...current, email: '' }));
          }} required />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </label>
        <label className="stitch-field">
          <span>{t('verificationCode')}</span>
          <input value={code} onChange={(e) => {
            setCode(e.target.value);
            setFieldErrors((current) => ({ ...current, code: '' }));
          }} required />
          {fieldErrors.code && <small className="field-error">{fieldErrors.code}</small>}
        </label>
        <button type="submit" className="stitch-submit-button" disabled={loading}>
          {loading ? t('verifying') : t('verifyEmail')}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
