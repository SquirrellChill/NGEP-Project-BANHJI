import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { changePassword } from '../../services/authService';

export default function ChangePasswordForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus(t('passwordsNoMatch'));
      return;
    }

    setSaving(true);
    setStatus('');
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus(t('passwordChanged'));
    } catch (err) {
      setStatus(err?.response?.data?.detail || t('unablePassword'));
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ['currentPassword', t('currentPassword')],
    ['newPassword', t('newPassword')],
    ['confirmPassword', t('confirmPassword')],
  ];

  return (
    <form className="profile-form password-form" onSubmit={handleSubmit}>
      {status && <p className="review-error-message">{status}</p>}
      {fields.map(([name, label]) => (
        <label className="dash-field password-input-field" key={name}>
          <span>{label}</span>
          <div>
            <input
              type={visible ? 'text' : 'password'}
              name={name}
              placeholder="••••••••"
              value={form[name]}
              onChange={handleChange}
              required
            />
            <button type="button" aria-label={`Toggle ${label.toLowerCase()} visibility`} onClick={() => setVisible((current) => !current)}>
              <Eye size={18} />
            </button>
          </div>
        </label>
      ))}
      <button className="primary-action full-width-action" type="submit" disabled={saving}>
        {saving ? t('changing') : t('changePassword')}
      </button>
    </form>
  );
}
