import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage, register } from '../../services/authService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0914',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top back button */}
      <div style={{ maxWidth: '940px', width: '100%', marginBottom: '10px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1b1730',
            color: '#c4c1db',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #2d284a',
          }}
        >
          ← {t('backToSignIn') || 'Back to Sign In'}
        </Link>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: '940px',
          width: '100%',
          backgroundColor: '#141124',
          borderRadius: '20px',
          border: '1px solid #262143',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
        }}
      >
        {/* Left Side Purple Hero Panel */}
        <div
          style={{
            flex: '1 1 300px',
            background: 'linear-gradient(160deg, #44217d 0%, #201547 50%, #150f30 100%)',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.12em',
                color: '#b6a6e8',
                textTransform: 'uppercase',
              }}
            >
              KOTCHOMNOL
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '6px 0 10px', color: '#ffffff' }}>
              {t('createAccount') || 'Create Account'}
            </h2>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#cec8ea', margin: 0 }}>
              {t('signInSubtitle') || 'Sign up to manage your sales voice records and track revenue.'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#9891be',
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Encrypted & Secure authentication
          </div>
        </div>

        {/* Right Form Content */}
        <div
          style={{
            flex: '1 1 480px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#ffffff' }}>
              {t('signUp') || 'Sign Up'}
            </h3>
            <p style={{ fontSize: '12px', color: '#8e8aab', margin: 0 }}>
              {t('enterDetails') || 'Enter your details to create your workspace.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '12px',
                lineHeight: '1.4',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Grid 1: First Name & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('firstName') || 'First Name'}
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #282444',
                    backgroundColor: '#1c1833',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {fieldErrors.firstName && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.firstName}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('lastName') || 'Last Name'}
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #282444',
                    backgroundColor: '#1c1833',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {fieldErrors.lastName && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.lastName}</span>}
              </div>
            </div>

            {/* Grid 2: Phone & Email (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('phoneNumber') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+855 12 345 678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #282444',
                    backgroundColor: '#1c1833',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {fieldErrors.phoneNumber && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.phoneNumber}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('emailAddress') || 'Email Address'}
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #282444',
                    backgroundColor: '#1c1833',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {fieldErrors.email && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.email}</span>}
              </div>
            </div>

            {/* Grid 3: Password & Confirm Password (Side by Side with Toggles) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('password') || 'Password'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #282444',
                      backgroundColor: '#1c1833',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8e8aab',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.password}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#8e8aab' }}>
                  {t('confirmPassword') || 'Confirm Password'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #282444',
                      backgroundColor: '#1c1833',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8e8aab',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <span style={{ color: '#f87171', fontSize: '10.5px' }}>{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #7e22ce 0%, #9333ea 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '10px',
              }}
            >
              {loading ? (t('registering') || 'Registering...') : (t('register') || 'Register')}
            </button>
          </form>

          {/* Khmer Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0 8px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#262143' }} />
            <span style={{ padding: '0 10px', fontSize: '11px', color: '#68628a' }}>ឬ</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#262143' }} />
          </div>

          <TelegramLoginButton onAuth={handleTelegramAuth} onError={setError} />

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#8e8aab', margin: '10px 0 0' }}>
            {t('alreadyAccount') || 'Already have an account?'}{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: '600', textDecoration: 'none' }}>
              {t('signIn') || 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}