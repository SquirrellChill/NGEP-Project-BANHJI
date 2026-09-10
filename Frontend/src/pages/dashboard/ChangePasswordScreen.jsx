import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import { useLanguage } from '../../context/LanguageContext';
import { changePassword, getErrorMessage } from '../../services/authService';
import './ChangePasswordScreen.css';

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isKm = language !== 'en';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setStatusMsg({
        type: 'success',
        text: isKm ? 'បានផ្លាស់ប្តូរលេខសម្ងាត់ដោយជោគជ័យ!' : 'Password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: getErrorMessage(err) || (isKm ? 'បរាជ័យក្នុងការផ្លាស់ប្តូរលេខសម្ងាត់' : 'Failed to change password.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileAppShell activeTab="profile" showBottomNav={false}>
      <div className="pwd-split-wrapper font-kantumruy">
        {/* Top Floating Back Bar */}
        <div className="pwd-top-nav">
          <button 
            type="button" 
            className="pwd-back-btn" 
            onClick={() => navigate('/dashboard/profile')}
          >
            <ArrowLeft size={16} />
            <span>{isKm ? 'ត្រឡប់ទៅប្រវត្តិរូប' : 'Back to Profile'}</span>
          </button>
        </div>

        {/* Master Dual-Pane Card */}
        <div className="pwd-auth-card">
          {/* Left Gradient Brand Banner */}
          <div className="pwd-card-banner">
            <div>
              <div className="pwd-icon-badge">
                <KeyRound size={22} />
              </div>
              <span className="pwd-brand-text">KOTCHOMNOL</span>
              <h2 className="pwd-banner-title">
                {isKm ? 'ផ្លាស់ប្តូរលេខសម្ងាត់' : 'Change Password'}
              </h2>
              <p className="pwd-banner-desc">
                {isKm 
                  ? 'បង្កើតលេខសម្ងាត់ដែលមានសុវត្ថិភាពខ្ពស់ ដើម្បីការពារគណនី និងទិន្នន័យហាងរបស់អ្នក។' 
                  : 'Update your password regularly to keep your business records and sales safe.'}
              </p>
            </div>

            <div className="pwd-banner-footer">
              <ShieldCheck size={16} />
              <span>{isKm ? 'ការការពារគណនីមានសុវត្ថិភាព 256-bit' : 'Encrypted & Secure authentication'}</span>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="pwd-card-body">
            <div className="pwd-form-header">
              <h3>{isKm ? 'កំណត់លេខសម្ងាត់ថ្មី' : 'Create a New Password'}</h3>
              <p>{isKm ? 'សូមបញ្ចូលលេខសម្ងាត់បច្ចុប្បន្ន និងលេខសម្ងាត់ថ្មី' : 'Please enter your current and new credentials below.'}</p>
            </div>

            {statusMsg.text && (
              <div className={statusMsg.type === 'success' ? 'pwd-alert-success' : 'pwd-alert-error'}>
                {statusMsg.text}
              </div>
            )}

            <div className="pwd-form-embed">
              <form onSubmit={handleSubmit}>
                {/* Current Password */}
                <div>
                  <label htmlFor="current-password">
                    {isKm ? 'លេខសម្ងាត់បច្ចុប្បន្ន' : 'CURRENT PASSWORD'}
                  </label>
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

                {/* New Password */}
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password">
                    {isKm ? 'បញ្ជាក់លេខសម្ងាត់' : 'CONFIRM PASSWORD'}
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
                  {loading ? (isKm ? 'កំពុងផ្លាស់ប្តូរ...' : 'Updating Password...') : (isKm ? 'ផ្លាស់ប្តូរលេខសម្ងាត់' : 'Change password')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}