import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { forgotPassword } from '../../services/authService';

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
        text: t('resetLinkSent') || 'Password reset link has been sent to your email.',
      });
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || t('resetLinkFailed') || 'Failed to send reset link.',
      });
    } finally {
      setLoading(false);
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
      {/* Back button above card */}
      <div style={{ maxWidth: '960px', width: '100%', marginBottom: '16px' }}>
        <Link
          to="/login"
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
            transition: 'background 0.2s',
          }}
        >
          ← {t('backToSignIn') || 'Back to Login'}
        </Link>
      </div>

      {/* Main Container Card */}
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
        {/* Left Side Hero Panel */}
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
              {t('accountSecurity') || 'Account Security'}
            </h2>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#cec8ea', margin: 0 }}>
              {t('resetRequestSubtitle') || 'Request a secure reset link to recover your account.'}
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

        {/* Right Side Form Content */}
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
            {t('forgotPasswordTitle') || 'Forgot Password'}
          </h3>
          <p style={{ fontSize: '13px', color: '#8e8aab', margin: '0 0 24px' }}>
            {t('enterEmailReset') || 'Enter your email to receive a password reset link.'}
          </p>

          {statusMsg.text && (
            <div
              style={{
                backgroundColor: statusMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${statusMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
                color: statusMsg.type === 'success' ? '#86efac' : '#fca5a5',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '20px',
                lineHeight: '1.5',
              }}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '22px' }}>
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
                {t('emailAddress') || 'Email Address'}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #282444',
                  backgroundColor: '#1c1833',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
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
                marginBottom: '16px',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? (t('sendingRequest') || 'Sending Request...') : (t('sendReset') || 'Send Reset Link')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8e8aab', margin: '8px 0 0' }}>
            {t('rememberedPassword') || 'Remembered your password?'}{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: '600', textDecoration: 'none' }}>
              {t('backToSignIn') || 'Back to Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}