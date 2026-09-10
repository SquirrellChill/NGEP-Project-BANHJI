import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithTelegram } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top back navigation */}
      <div style={{ maxWidth: '960px', width: '100%', marginBottom: '16px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1b1730',
            color: '#c4c1db',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #2d284a',
          }}
        >
          ← {t('backToHomepage') || 'Back to Homepage'}
        </Link>
      </div>

      {/* Main card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: '960px',
          width: '100%',
          backgroundColor: '#141124',
          borderRadius: '24px',
          border: '1px solid #262143',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
        }}
      >
        {/* Left purple panel */}
        <div
          style={{
            flex: '1 1 320px',
            background: 'linear-gradient(160deg, #44217d 0%, #201547 50%, #150f30 100%)',
            padding: '44px 34px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.12em',
                color: '#b6a6e8',
                textTransform: 'uppercase',
              }}
            >
              KOTCHOMNOL
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 12px', color: '#ffffff' }}>
              {t('welcomeBackTitle') || 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#cec8ea', margin: 0 }}>
              {t('signInSubtitle') || 'Sign in to access your voice sales dashboard.'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9891be',
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Encrypted & Secure authentication
          </div>
        </div>

        {/* Right form panel */}
        <div
          style={{
            flex: '1 1 440px',
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 6px', color: '#ffffff' }}>
            {t('signIn') || 'Sign In'}
          </h3>
          <p style={{ fontSize: '13px', color: '#8e8aab', margin: '0 0 24px' }}>
            {t('enterCredentials') || 'Enter your credentials to continue.'}
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '20px',
                lineHeight: '1.5',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8e8aab',
                }}
              >
                {t('emailAddress') || 'EMAIL ADDRESS'}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #282444',
                  backgroundColor: '#1c1833',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#8e8aab',
                  }}
                >
                  {t('password') || 'PASSWORD'}
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '12px',
                    color: '#a855f7',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  {t('forgotPassword') || 'Forgot Password?'}
                </Link>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #282444',
                    backgroundColor: '#1c1833',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(90deg, #7e22ce 0%, #9333ea 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '10px',
                marginBottom: '14px',
              }}
            >
              {loading ? (t('signingIn') || 'Signing in...') : (t('signIn') || 'Sign In')}
            </button>
          </form>

          {/* Khmer divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0 14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#262143' }} />
            <span style={{ padding: '0 12px', fontSize: '12px', color: '#68628a' }}>ឬ</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#262143' }} />
          </div>

          <TelegramLoginButton onAuth={handleTelegramAuth} onError={setError} />

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8e8aab', margin: '14px 0 0' }}>
            {t('newHere') || 'New here?'}{' '}
            <Link to="/register" style={{ color: '#a855f7', fontWeight: '600', textDecoration: 'none' }}>
              {t('createAnAccount') || 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}