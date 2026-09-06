import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
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
      title={t('welcomeBackTitle')}
      subtitle={t('signInSubtitle')}
      footer={<>{t('newHere')} <Link to="/register">{t('createAnAccount')}</Link></>}
    >
      <div className="stitch-form-header">
        <h2>{t('signIn')}</h2>
        <p>{t('enterCredentials')}</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <label className="stitch-field">
          <span>{t('emailAddress')}</span>
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
            {t('password')}
            <Link to="/forgot-password">{t('forgotPassword')}</Link>
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
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>
    </StitchAuthLayout>
  );
}
