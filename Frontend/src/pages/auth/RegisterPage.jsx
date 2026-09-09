import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StitchAuthLayout from '../../components/stitch/StitchAuthLayout';
import StitchStatusMessage from '../../components/stitch/StitchStatusMessage';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage, register } from '../../services/authService';
import './LoginPage.css';

const emptyForm = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithTelegram } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.firstName.trim()) nextErrors.firstName = t('fieldRequired');
    if (!formData.lastName.trim()) nextErrors.lastName = t('fieldRequired');
    if (!formData.phoneNumber.trim()) nextErrors.phoneNumber = t('fieldRequired');
    if (formData.phoneNumber.trim() && !/^[+\d][\d\s().-]{6,}$/.test(formData.phoneNumber.trim())) {
      nextErrors.phoneNumber = t('invalidPhone');
    }
    if (!formData.email.trim()) nextErrors.email = t('fieldRequired');
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = t('invalidEmail');
    }
    if (!formData.password) nextErrors.password = t('fieldRequired');
    if (formData.password && formData.password.length < 8) nextErrors.password = t('passwordTooShort');
    if (!formData.confirmPassword) nextErrors.confirmPassword = t('fieldRequired');
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t('passwordsNoMatch');
    }
    return nextErrors;
  };

  const fieldErrorsFromBackend = (message) => {
    const lower = String(message || '').toLowerCase();
    if (lower.includes('email') && (lower.includes('exist') || lower.includes('registered') || lower.includes('taken'))) {
      return { email: t('emailAlreadyRegistered') };
    }
    if (lower.includes('phone') && (lower.includes('exist') || lower.includes('registered') || lower.includes('taken'))) {
      return { phoneNumber: t('phoneAlreadyRegistered') };
    }
    if (lower.includes('email')) return { email: message };
    if (lower.includes('phone')) return { phoneNumber: message };
    if (lower.includes('password')) return { password: message };
    return {};
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationErrors = validateForm();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setLoading(true);

    try {
      const response = await register(formData);
      const requiresEmailVerification = response.data?.data?.requires_email_verification !== false;
      if (requiresEmailVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        navigate('/login', { state: { registered: true, email: formData.email } });
      }
    } catch (err) {
      const message = getErrorMessage(err);
      const backendFieldErrors = fieldErrorsFromBackend(message);
      setFieldErrors(backendFieldErrors);
      setError(Object.keys(backendFieldErrors).length ? '' : message);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async (telegramUser) => {
    setError('');
    try {
      await loginWithTelegram(telegramUser);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <StitchAuthLayout
      title={t('createAccount')}
      subtitle={t('signInSubtitle')}
      footer={<>{t('alreadyAccount')} <Link to="/login">{t('signIn')}</Link></>}
    >
      <div className="stitch-form-header">
        <h2>{t('signUp')}</h2>
        <p>{t('enterDetails')}</p>
      </div>
      <StitchStatusMessage type="error">{error}</StitchStatusMessage>
      <form onSubmit={handleSubmit} className="stitch-auth-form">
        <div className="stitch-form-grid">
          <label className="stitch-field">
            <span>{t('firstName')}</span>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
            {fieldErrors.firstName && <small className="field-error">{fieldErrors.firstName}</small>}
          </label>
          <label className="stitch-field">
            <span>{t('lastName')}</span>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
            {fieldErrors.lastName && <small className="field-error">{fieldErrors.lastName}</small>}
          </label>
        </div>
        <label className="stitch-field">
          <span>{t('phoneNumber')}</span>
          <input type="tel" name="phoneNumber" placeholder="+855 12 345 678" value={formData.phoneNumber} onChange={handleChange} required />
          {fieldErrors.phoneNumber && <small className="field-error">{fieldErrors.phoneNumber}</small>}
        </label>
        <label className="stitch-field">
          <span>{t('emailAddress')}</span>
          <input type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </label>
        <label className="stitch-field">
          <span>{t('password')}</span>
          <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </label>
        <label className="stitch-field">
          <span>{t('confirmPassword')}</span>
          <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
          {fieldErrors.confirmPassword && <small className="field-error">{fieldErrors.confirmPassword}</small>}
        </label>
        <button type="submit" disabled={loading} className="stitch-submit-button">
          {loading ? t('registering') : t('register')}
        </button>
      </form>

      <div className="stitch-divider">ឬ</div>
      <TelegramLoginButton onAuth={handleTelegramAuth} onError={setError} />
     
    </StitchAuthLayout>
  );
}