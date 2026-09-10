import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { resetPassword } from '../../services/authService';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatusMsg({
        type: 'error',
        text: t('resetMissing') || 'Reset token is missing or invalid.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({
        type: 'error',
        text: t('passwordsNoMatch') || 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await resetPassword({ token, password });
      setStatusMsg({
        type: 'success',
        text: t('resetSuccess') || 'Password updated successfully! Redirecting to login...',
      });
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
          }}
        >
          ← {t('backToSignIn') || 'Back to Login'}
        </Link>
      </div>

      {/* Main card matching Change Password screen */}
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
                <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5 1.5M10.5 13.5L3 21l3 3 7.5-7.5" />
                <circle cx="16.5" cy="7.5" r="4.5" />
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
              {t('resetPassword') || 'Change Password'}
            </h2>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#cec8ea', margin: 0 }}>
              {t('resetSubtitle') || 'Update your password regularly to keep your business records and sales safe.'}
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
            {t('setNewPassword') || 'Create a New Password'}
          </h3>
          <p style={{ fontSize: '13px', color: '#8e8aab', margin: '0 0 24px' }}>
            {t('enterNewPassword') || 'Please enter your new credentials below.'}
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
            {/* New Password with Eye Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <label
                htmlFor="new-password"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8e8aab',
                }}
              >
                {t('newPassword') || 'NEW PASSWORD'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password with Eye Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
              <label
                htmlFor="confirm-password"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8e8aab',
                }}
              >
                {t('confirmNewPassword') || 'CONFIRM PASSWORD'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? (
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
                marginBottom: '16px',
              }}
            >
              {loading ? (t('updatingPassword') || 'Updating Password...') : (t('resetPassword') || 'Change password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}