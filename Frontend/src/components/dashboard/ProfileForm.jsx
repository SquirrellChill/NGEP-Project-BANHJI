import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileForm({ profile, onSubmit, saving = false, status = '' }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phone || '',
    email: profile.email || '',
    businessName: profile.businessName || '',
    address: profile.address || '',
  });

  useEffect(() => {
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phone || '',
      email: profile.email || '',
      businessName: profile.businessName || '',
      address: profile.address || '',
    });
  }, [profile]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {status && <p className="review-error-message">{status}</p>}
      <label className="dash-field">
        <span>{t('firstName')}</span>
        <input name="firstName" value={form.firstName} onChange={handleChange} required />
      </label>
      <label className="dash-field">
        <span>{t('lastName')}</span>
        <input name="lastName" value={form.lastName} onChange={handleChange} required />
      </label>
      <label className="dash-field">
        <span>{t('businessName')}</span>
        <input name="businessName" value={form.businessName} onChange={handleChange} />
      </label>
      <label className="dash-field">
        <span>{t('phoneNumber')}</span>
        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
      </label>
      <label className="dash-field">
        <span>{t('emailAddress')}</span>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>
      <label className="dash-field">
        <span>{t('address')}</span>
        <textarea name="address" value={form.address} onChange={handleChange} rows={3} />
      </label>
      <section className="screen-actions two-col">
        <button className="outline-action" type="reset" disabled={saving}>{t('cancel')}</button>
        <button className="primary-action" type="submit" disabled={saving}>
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </section>
    </form>
  );
}
