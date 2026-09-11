import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  requestPasswordChangeOTP,
  verifyChangePasswordWithOTP,
  getErrorMessage,
} from '../../services/authService';

export default function ChangePasswordForm() {
  const { t, language } = useLanguage();
  const isKm = language !== 'en';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    currentPassword: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSaving(true);

    try {
      await requestPasswordChangeOTP({ currentPassword: form.currentPassword });
      setStatusMsg({
        type: 'success',
        text: isKm
          ? 'កូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅ Gmail របស់អ្នក!'
          : 'A 6-digit verification code has been sent to your Gmail!',
      });
      setStep(2);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          getErrorMessage?.(err) ||
          err?.response?.data?.detail ||
          (isKm ? 'លេខសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ' : 'Invalid current password.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (form.newPassword !== form.confirmPassword) {
      setStatusMsg({
        type: 'error',
        text: isKm ? 'លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ' : (t('passwordsNoMatch') || 'Passwords do not match.'),
      });
      return;
    }

    setSaving(true);
    try {
      await verifyChangePasswordWithOTP({
        currentPassword: form.currentPassword,
        code: form.code,
        newPassword: form.newPassword,
      });

      setStatusMsg({
        type: 'success',
        text: isKm ? 'បានផ្លាស់ប្តូរលេខសម្ងាត់ដោយជោគជ័យ!' : (t('passwordChanged') || 'Password changed successfully!'),
      });
      setForm({ currentPassword: '', code: '', newPassword: '', confirmPassword: '' });
      setStep(1);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          getErrorMessage?.(err) ||
          err?.response?.data?.detail ||
          (isKm ? 'កូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ ឬផុតកំណត់' : 'Invalid or expired code.'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pwd-card-body font-kantumruy" style={{ padding: 0 }}>
      {statusMsg.text && (
        <div className={statusMsg.type === 'success' ? 'pwd-alert-success' : 'pwd-alert-error'}>
          {statusMsg.text}
        </div>
      )}

      <div className="pwd-form-embed">
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div>
              <label htmlFor="form-current-password">
                {isKm ? 'លេខសម្ងាត់បច្ចុប្បន្ន' : (t('currentPassword') || 'CURRENT PASSWORD')}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="form-current-password"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="pwd-input-with-toggle"
                  placeholder="••••••••"
                  value={form.currentPassword}
                  onChange={handleChange}
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

            <button type="submit" disabled={saving}>
              {saving
                ? (isKm ? 'កំពុងផ្ញើកូដ...' : 'Sending Code to Gmail...')
                : (isKm ? 'ផ្ញើកូដផ្ទៀងផ្ទាត់ទៅ Gmail' : 'Send Verification Code')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div>
              <label htmlFor="form-otp-code">
                {isKm ? 'កូដផ្ទៀងផ្ទាត់ Gmail (៦ ខ្ទង់)' : 'GMAIL VERIFICATION CODE'}
              </label>
              <input
                id="form-otp-code"
                name="code"
                type="text"
                maxLength={6}
                required
                className="pwd-input-with-toggle"
                placeholder="123456"
                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
                value={form.code}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="form-new-password">
                {isKm ? 'លេខសម្ងាត់ថ្មី' : (t('newPassword') || 'NEW PASSWORD')}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="form-new-password"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="pwd-input-with-toggle"
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={handleChange}
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
              <label htmlFor="form-confirm-password">
                {isKm ? 'បញ្ជាក់លេខសម្ងាត់ថ្មី' : (t('confirmPassword') || 'CONFIRM NEW PASSWORD')}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="form-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="pwd-input-with-toggle"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
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

            <button type="submit" disabled={saving}>
              {saving
                ? (isKm ? 'កំពុងផ្លាស់ប្តូរ...' : (t('changing') || 'Updating Password...'))
                : (isKm ? 'ផ្ទៀងផ្ទាត់ និងផ្លាស់ប្តូរលេខសម្ងាត់' : (t('changePassword') || 'Confirm Password Change'))}
            </button>
            <button
              type="button"
              style={{ background: 'transparent', color: '#9ca3af', marginTop: 4, border: 'none', cursor: 'pointer', fontSize: 13 }}
              onClick={() => setStep(1)}
            >
              {isKm ? 'ត្រឡប់ទៅជំហានទី ១' : 'Back to Step 1'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}