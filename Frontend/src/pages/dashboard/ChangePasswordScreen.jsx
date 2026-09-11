import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, Mail, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import { useLanguage } from '../../context/LanguageContext';
import {
  requestPasswordChangeOTP,
  verifyChangePasswordWithOTP,
  requestForgotCurrentPasswordOTP,
  resetWithOtpAuthenticated,
  getErrorMessage,
} from '../../services/authService';
import './ChangePasswordScreen.css';

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isKm = language !== 'en';

  // Modes: 'standard' (knows old pwd) or 'forgot' (forgot old pwd)
  const [mode, setMode] = useState('standard');
  const [step, setStep] = useState(1); // 1: prompt/request, 2: verify + new pwd

  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSwitchToForgot = () => {
    setMode('forgot');
    setStep(1);
    setStatusMsg({ type: '', text: '' });
  };

  const handleSwitchToStandard = () => {
    setMode('standard');
    setStep(1);
    setStatusMsg({ type: '', text: '' });
  };

  // Step 1: Submit handler
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      if (mode === 'standard') {
        await requestPasswordChangeOTP({ currentPassword });
      } else {
        await requestForgotCurrentPasswordOTP({ email });
      }

      setStatusMsg({
        type: 'success',
        text: isKm
          ? 'កូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅ Gmail របស់អ្នក!'
          : 'A 6-digit verification code has been sent to your registered Gmail!',
      });
      setStep(2);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          getErrorMessage(err) ||
          (isKm ? 'បរាជ័យក្នុងការផ្ញើកូដ' : 'Failed to send verification code.'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verification and Password Update
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setStatusMsg({
        type: 'error',
        text: isKm ? 'លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ' : 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'standard') {
        await verifyChangePasswordWithOTP({
          currentPassword,
          code,
          newPassword,
        });
      } else {
        await resetWithOtpAuthenticated({
          code,
          newPassword,
        });
      }

      setStatusMsg({
        type: 'success',
        text: isKm ? 'បានផ្លាស់ប្តូរលេខសម្ងាត់ដោយជោគជ័យ!' : 'Password updated successfully!',
      });

      setCurrentPassword('');
      setEmail('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => navigate('/dashboard/profile'), 1500);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          getErrorMessage(err) ||
          (isKm ? 'កូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ ឬផុតកំណត់' : 'Invalid or expired verification code.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileAppShell activeTab="profile" showBottomNav={false}>
      <div className="pwd-split-wrapper font-kantumruy">
        {/* Navigation Bar */}
        <div className="pwd-top-nav">
          <button
            type="button"
            className="pwd-back-btn"
            onClick={() => (step === 2 ? setStep(1) : navigate('/dashboard/profile'))}
          >
            <ArrowLeft size={16} />
            <span>
              {step === 2
                ? isKm
                  ? 'ថយក្រោយទៅជំហានទី ១'
                  : 'Back to Step 1'
                : isKm
                ? 'ត្រឡប់ទៅប្រវត្តិរូប'
                : 'Back to Profile'}
            </span>
          </button>
        </div>

        {/* Master Card */}
        <div className="pwd-auth-card">
          {/* Left Gradient Banner */}
          <div className="pwd-card-banner">
            <div>
              <div className="pwd-icon-badge">
                {mode === 'forgot' ? <HelpCircle size={22} /> : step === 1 ? <KeyRound size={22} /> : <Mail size={22} />}
              </div>
              <span className="pwd-brand-text">KOTCHOMNOL</span>
              <h2 className="pwd-banner-title">
                {mode === 'forgot'
                  ? isKm
                    ? 'កំណត់លេខសម្ងាត់ឡើងវិញ'
                    : 'Reset Forgotten Password'
                  : isKm
                  ? 'ការការពារគណនី ២ ជាន់'
                  : 'Two-Factor Verification'}
              </h2>
              <p className="pwd-banner-desc">
                {mode === 'forgot'
                  ? isKm
                    ? 'សូមបញ្ចូល Gmail គណនីរបស់អ្នកដើម្បីទទួលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់។'
                    : 'Please enter your registered Gmail address to receive a 6-digit verification code.'
                  : isKm
                  ? 'ដើម្បីធានាសុវត្ថិភាព ពួកយើងនឹងផ្ញើលេខកូដសម្ងាត់ទៅកាន់ Gmail របស់អ្នកមុនពេលផ្លាស់ប្តូរលេខសម្ងាត់។'
                  : 'To protect your account, we dispatch a verification token to your registered Gmail address before updating credentials.'}
              </p>
            </div>

            <div className="pwd-banner-footer">
              <ShieldCheck size={16} />
              <span>{isKm ? 'សុវត្ថិភាពខ្ពស់តាម Gmail OTP' : 'Encrypted & Gmail 2FA Verified'}</span>
            </div>
          </div>

          {/* Right Form Body */}
          <div className="pwd-card-body">
            <div className="pwd-form-header">
              <h3>
                {mode === 'forgot'
                  ? step === 1
                    ? isKm
                      ? 'ភ្លេចលេខសម្ងាត់បច្ចុប្បន្ន?'
                      : 'Forgot Current Password?'
                    : isKm
                    ? 'បញ្ចូលកូដ និងលេខសម្ងាត់ថ្មី'
                    : 'Enter OTP & Set New Password'
                  : step === 1
                  ? isKm
                    ? 'ជំហានទី ១៖ បញ្ជាក់លេខសម្ងាត់'
                    : 'Step 1: Confirm Current Password'
                  : isKm
                  ? 'ជំហានទី ២៖ ផ្ទៀងផ្ទាត់កូដ Gmail'
                  : 'Step 2: Enter OTP & New Password'}
              </h3>
              <p>
                {mode === 'forgot'
                  ? step === 1
                    ? isKm
                      ? 'បញ្ចូលអាសយដ្ឋាន Gmail របស់អ្នក ដើម្បីទទួលកូដផ្ទៀងផ្ទាត់។'
                      : 'Enter your account Gmail address to receive the verification code.'
                    : isKm
                    ? 'សូមបញ្ចូលកូដ ៦ ខ្ទង់ពី Gmail និងលេខសម្ងាត់ថ្មី។'
                    : 'Enter the 6-digit code received in your inbox along with your new password.'
                  : step === 1
                  ? isKm
                    ? 'បញ្ចូលលេខសម្ងាត់បច្ចុប្បន្ន ដើម្បីទទួលកូដតាម Gmail'
                    : 'Enter your current password to request a 6-digit authorization code.'
                  : isKm
                  ? 'សូមបញ្ចូលលេខកូដ ៦ ខ្ទង់ពី Gmail និងលេខសម្ងាត់ថ្មី'
                  : 'Enter the 6-digit code sent to your Gmail inbox along with your new password.'}
              </p>
            </div>

            {statusMsg.text && (
              <div className={statusMsg.type === 'success' ? 'pwd-alert-success' : 'pwd-alert-error'}>
                {statusMsg.text}
              </div>
            )}

            <div className="pwd-form-embed">
              {step === 1 ? (
                <form onSubmit={handleStep1Submit}>
                  {mode === 'standard' ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label htmlFor="current-password" style={{ margin: 0 }}>
                          {isKm ? 'លេខសម្ងាត់បច្ចុប្បន្ន' : 'CURRENT PASSWORD'}
                        </label>
                        <button
                          type="button"
                          onClick={handleSwitchToForgot}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: '12px',
                            color: '#9333ea',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          {isKm ? 'ភ្លេចលេខសម្ងាត់?' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          id="current-password"
                          type={showCurrent ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          className="pwd-input-with-toggle"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="pwd-toggle-btn"
                          onClick={() => setShowCurrent(!showCurrent)}
                        >
                          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="registered-email">
                        {isKm ? 'អាសយដ្ឋាន GMAIL គណនី' : 'REGISTERED GMAIL ADDRESS'}
                      </label>
                      <input
                        id="registered-email"
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  )}

                  <button type="submit" disabled={loading}>
                    {loading
                      ? isKm
                        ? 'កំពុងផ្ញើកូដ...'
                        : 'Sending Code to Gmail...'
                      : isKm
                      ? 'ផ្ញើកូដផ្ទៀងផ្ទាត់ទៅ Gmail'
                      : 'Send Verification Code'}
                  </button>

                  {mode === 'forgot' && (
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '6px',
                        textAlign: 'center',
                      }}
                      onClick={handleSwitchToStandard}
                    >
                      {isKm ? 'ចាំលេខសម្ងាត់ចាស់? ប្តូរធម្មតា' : 'Remember your password? Switch back'}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleStep2Submit}>
                  <div>
                    <label htmlFor="otp-code">
                      {isKm ? 'កូដផ្ទៀងផ្ទាត់ Gmail (៦ ខ្ទង់)' : 'GMAIL VERIFICATION CODE'}
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      required
                      className="pwd-input-with-toggle"
                      placeholder="123456"
                      style={{
                        letterSpacing: '0.3em',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password">
                      {isKm ? 'លេខសម្ងាត់ថ្មី' : 'NEW PASSWORD'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="new-password"
                        type={showNew ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        className="pwd-input-with-toggle"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password">
                      {isKm ? 'បញ្ជាក់លេខសម្ងាត់ថ្មី' : 'CONFIRM NEW PASSWORD'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        className="pwd-input-with-toggle"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading
                      ? isKm
                        ? 'កំពុងដំណើរការ...'
                        : 'Verifying & Updating...'
                      : isKm
                      ? 'ផ្ទៀងផ្ទាត់ និងកំណត់លេខសម្ងាត់ថ្មី'
                      : 'Confirm New Password'}
                  </button>

                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      textAlign: 'center',
                    }}
                    onClick={() => setStep(1)}
                  >
                    {isKm ? 'ត្រឡប់ទៅជំហានទី ១' : 'Back to Step 1'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}