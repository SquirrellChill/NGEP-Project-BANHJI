import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getErrorMessage, register } from '../../services/authService';
import '../dashboard/ChangePasswordScreen.css';

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
    <div className="auth-page-container">
      <div className="pwd-split-wrapper font-kantumruy" style={{ width: '100%', maxWidth: '940px' }}>
        <div className="pwd-top-nav">
          <button type="button" className="pwd-back-btn" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            <span>{t('backToSignIn') || 'Back to Sign In'}</span>
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
                {t('createAccount') || 'Create Account'}
              </h2>
              <p className="pwd-banner-desc">
                {t('signInSubtitle') || 'Sign up to manage your sales voice records and track revenue.'}
              </p>
            </div>

            <div className="pwd-banner-footer">
              <ShieldCheck size={16} />
              <span>Encrypted & Secure authentication</span>
            </div>
          </div>

          <div className="pwd-card-body" style={{ padding: '26px 30px' }}>
            <div className="pwd-form-header" style={{ marginBottom: '12px' }}>
              <h3>{t('signUp') || 'Sign Up'}</h3>
              <p>{t('enterDetails') || 'Enter your details to create your workspace.'}</p>
            </div>

            {error && <div className="pwd-alert-error">{error}</div>}

            <div className="pwd-form-embed">
              <form onSubmit={handleSubmit} style={{ gap: '10px' }}>
                {/* First Name & Last Name */}
                <div className="pwd-form-grid-2">
                  <div>
                    <label htmlFor="firstName">{t('firstName') || 'First Name'}</label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.firstName && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.firstName}</span>}
                  </div>
                  <div>
                    <label htmlFor="lastName">{t('lastName') || 'Last Name'}</label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.lastName && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.lastName}</span>}
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="pwd-form-grid-2">
                  <div>
                    <label htmlFor="phoneNumber">{t('phoneNumber') || 'Phone Number'}</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      placeholder="+855 12 345 678"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.phoneNumber && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.phoneNumber}</span>}
                  </div>
                  <div>
                    <label htmlFor="email">{t('emailAddress') || 'Email Address'}</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.email}</span>}
                  </div>
                </div>

                {/* Password & Confirm Password with Eye Toggles Inside Inputs */}
                <div className="pwd-form-grid-2">
                  <div>
                    <label htmlFor="password">{t('password') || 'Password'}</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        className="pwd-input-with-toggle"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.password}</span>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword">{t('confirmPassword') || 'Confirm Password'}</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="pwd-input-with-toggle"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '11px' }}>{fieldErrors.confirmPassword}</span>}
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ marginTop: '4px' }}>
                  {loading ? (t('registering') || 'Registering...') : (t('register') || 'Register')}
                </button>
              </form>

              <div className="pwd-divider" style={{ margin: '4px 0 8px' }}>
                <div className="pwd-divider-line" />
                <span className="pwd-divider-text">ឬ</span>
                <div className="pwd-divider-line" />
              </div>

              <TelegramLoginButton onAuth={handleTelegramAuth} onError={setError} />

              <div className="pwd-footer-link" style={{ marginTop: '8px' }}>
                {t('alreadyAccount') || 'Already have an account?'}{' '}
                <Link to="/login">{t('signIn') || 'Sign In'}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}