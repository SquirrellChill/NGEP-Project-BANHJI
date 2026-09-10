import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage } from '../../services/authService';
import '../dashboard/ChangePasswordScreen.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithTelegram } = useAuth();
  const { language, t } = useLanguage();
  const isKm = language !== 'en';

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
    <div className="auth-page-container">
      <div className="pwd-split-wrapper font-kantumruy" style={{ width: '100%' }}>
        <div className="pwd-top-nav">
          <button type="button" className="pwd-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>{t('backToHomepage') || 'Back to Homepage'}</span>
          </button>
        </div>

        <div className="pwd-auth-card">
          <div className="pwd-card-banner">
            <div>
              <div className="pwd-icon-badge">
                <KeyRound size={22} />
              </div>
              <span className="pwd-brand-text">KOTCHOMNOL</span>
              <h2 className="pwd-banner-title">
                {t('welcomeBackTitle') || 'Welcome Back'}
              </h2>
              <p className="pwd-banner-desc">
                {t('signInSubtitle') || 'Sign in to access your voice sales dashboard.'}
              </p>
            </div>

            <div className="pwd-banner-footer">
              <ShieldCheck size={16} />
              <span>Encrypted & Secure authentication</span>
            </div>
          </div>

          <div className="pwd-card-body">
            <div className="pwd-form-header">
              <h3>{t('signIn') || 'Sign In'}</h3>
              <p>{t('enterCredentials') || 'Enter your credentials to continue.'}</p>
            </div>

            {error && <div className="pwd-alert-error">{error}</div>}

            <div className="pwd-form-embed">
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email">{t('emailAddress') || 'EMAIL ADDRESS'}</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="password" style={{ margin: 0 }}>
                      {t('password') || 'PASSWORD'}
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: '12px', color: '#9333ea', textDecoration: 'none', fontWeight: '600' }}>
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
                      className="pwd-input-with-toggle"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? (t('signingIn') || 'Signing in...') : (t('signIn') || 'Sign In')}
                </button>
              </form>

              <div className="pwd-divider">
                <div className="pwd-divider-line" />
                <span className="pwd-divider-text">{isKm ? 'ឬ' : (t('or') || 'OR')}</span>
                <div className="pwd-divider-line" />
              </div>

              <TelegramLoginButton onAuth={handleTelegramAuth} onError={setError} />

              <div className="pwd-footer-link">
                {t('newHere') || 'New here?'}{' '}
                <Link to="/register">{t('createAnAccount') || 'Create an account'}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}