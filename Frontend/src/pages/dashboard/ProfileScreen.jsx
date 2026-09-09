import React, { useState } from 'react';
import { 
  ArrowLeft,
  Check, 
  ChevronRight,
  Globe2, 
  Languages, 
  Lock, 
  LogOut, 
  Mail,
  Moon, 
  Pencil, 
  Phone, 
  Shield, 
  Store, 
  Sun, 
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../components/dashboard/UserAvatar';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { updateMe } from '../../services/authService';
import { buildDashboardProfile } from '../../utils/profile';
import './ProfileSettings.css';

const profileFallback = {
  name: 'Seller',
  firstName: 'Seller',
  lastName: '',
  businessName: 'Kotchomnol Store',
  role: 'Owner',
  email: '',
  phone: '',
  address: '',
};

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const profile = buildDashboardProfile(user, profileFallback);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mobile navigation view: 'menu' (default) or 'account_details'
  const [mobileView, setMobileView] = useState('menu');

  // Form State
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phone || '',
    email: profile.email || '',
    role: profile.role || 'Owner',
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleSelect = (role) => {
    if (!isEditing) return;
    setForm((prev) => ({ ...prev, role }));
  };

  const handleCancel = () => {
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phone || '',
      email: profile.email || '',
      role: profile.role || 'Owner',
    });
    setStatus({ type: '', message: '' });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await updateMe(form);
      updateUser(response.data.data.user);
      setStatus({ type: 'success', message: t('profileUpdated') || 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (err) {
      const errMsg = err?.response?.data?.detail || t('unableProfile') || 'Unable to update profile.';
      setStatus({ type: 'error', message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <MobileAppShell activeTab="profile" showBottomNav={true}>
      <div className="settings-page-wrapper">
        {/* Mobile-only sub-navigation: Switch back to menu when inside account details */}
        {mobileView === 'account_details' && (
          <div className="settings-topbar mobile-only-bar">
            <button 
              className="settings-back-btn" 
              type="button" 
              onClick={() => {
                setMobileView('menu');
                setIsEditing(false);
              }}
            >
              <ArrowLeft size={18} />
              <span>{t('menu') || 'Menu'}</span>
            </button>
          </div>
        )}

        <div className="settings-layout">
          {/* MENU CARD */}
          <aside className={`settings-sidebar ${mobileView === 'menu' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="sidebar-profile-header">
              <div className="sidebar-avatar-wrap">
                <UserAvatar size="xl" />
              </div>
              <h2 className="sidebar-user-name">{profile.name}</h2>
              <div className="sidebar-balance-badge">
                <strong>{profile.role || 'Owner'}</strong>
                <small>{profile.businessName || 'Kotchomnol Store'}</small>
              </div>
            </div>

            <nav className="settings-nav-menu" aria-label="Settings navigation">
              <button 
                type="button" 
                className="settings-nav-item"
                onClick={() => setMobileView('account_details')}
              >
                <User size={18} />
                <div className="nav-item-dual">
                  <span>{t('myAccount') || 'My Account'}</span>
                  <ChevronRight size={16} className="mobile-chevron" />
                </div>
              </button>

              <button 
                type="button" 
                className="settings-nav-item"
                onClick={() => navigate('/dashboard/profile/change-password')}
              >
                <Lock size={18} />
                <div className="nav-item-dual">
                  <span>{t('changePassword') || 'Change password'}</span>
                  <ChevronRight size={16} className="mobile-chevron" />
                </div>
              </button>

              {/* Language: Shows the target language you switch to */}
              <button 
                type="button" 
                className="settings-nav-item"
                onClick={toggleLanguage}
              >
                <Languages size={18} />
                <div className="nav-item-dual">
                  <span>{t('language') || 'Language'}</span>
                  <span className="lang-tag">{language === 'en' ? 'KM' : 'EN'}</span>
                </div>
              </button>

              {/* Theme: Shows the target theme you switch to */}
              <button 
                type="button" 
                className="settings-nav-item"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <div className="nav-item-dual">
                  <span>{t('theme') || 'Theme'}</span>
                  <span className="theme-tag">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
                </div>
              </button>

              <button 
                type="button" 
                className="settings-nav-item"
                onClick={() => navigate('/')}
              >
                <Globe2 size={18} />
                <div className="nav-item-dual">
                  <span>{t('backToWebsite') || 'Back to Website'}</span>
                  <ChevronRight size={16} className="mobile-chevron" />
                </div>
              </button>

              <div className="settings-nav-divider" />

              <button 
                type="button" 
                className="settings-nav-item logout-item"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>{t('logout') || 'Log out'}</span>
              </button>
            </nav>
          </aside>

          {/* ACCOUNT DETAILS PANEL */}
          <main className={`settings-content-panel ${mobileView === 'account_details' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <header className="content-card-header">
              <div className="header-icon-shield">
                <Shield size={24} />
              </div>
              <div className="header-text-block">
                <h1>{t('myAccount') || 'My Account'}</h1>
                <p>Manage your personal details, business role, and system identity.</p>
              </div>

              {!isEditing && (
                <button 
                  type="button" 
                  className="edit-toggle-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={15} />
                  <span>Edit</span>
                </button>
              )}
            </header>

            {status.message && (
              <div className={`settings-alert-banner ${status.type}`}>
                {status.message}
              </div>
            )}

            {/* VIEW MODE */}
            {!isEditing ? (
              <div className="profile-view-container">
                <div className="view-grid">
                  <div className="info-display-tile">
                    <span className="info-tile-label">{t('firstName') || 'First Name'}</span>
                    <strong className="info-tile-value">{profile.firstName || '—'}</strong>
                  </div>

                  <div className="info-display-tile">
                    <span className="info-tile-label">{t('lastName') || 'Last Name'}</span>
                    <strong className="info-tile-value">{profile.lastName || '—'}</strong>
                  </div>
                </div>

                <div className="info-display-tile full-width">
                  <span className="info-tile-label">{t('emailAddress') || 'Email Address'}</span>
                  <div className="info-tile-iconic">
                    <Mail size={16} className="info-icon" />
                    <strong className="info-tile-value">{profile.email || '—'}</strong>
                  </div>
                </div>

                <div className="view-grid">
                  <div className="info-display-tile">
                    <span className="info-tile-label">{t('phoneNumber') || 'Phone Number'}</span>
                    <div className="info-tile-iconic">
                      <Phone size={16} className="info-icon" />
                      <strong className="info-tile-value">{profile.phone || '—'}</strong>
                    </div>
                  </div>

                  <div className="info-display-tile">
                    <span className="info-tile-label">Business Type</span>
                    <div className="info-tile-iconic">
                      <Store size={16} className="info-icon" />
                      <strong className="info-tile-value">Retail & Cafe POS</strong>
                    </div>
                  </div>
                </div>

                <div className="role-summary-box">
                  <span className="info-tile-label">Account Role</span>
                  <div className="role-summary-pill">
                    <span className="role-dot" />
                    <strong>{form.role === 'Manager' ? 'Cashier / Staff' : 'Store Owner'}</strong>
                  </div>
                </div>

                <div className="view-info-footer">
                  <p>Click "Edit" above whenever you need to update your phone number, name, or role.</p>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form className="reference-form" onSubmit={handleSave}>
                <div className="form-row-grid">
                  <div className="floating-field">
                    <label htmlFor="firstName">{t('firstName') || 'First Name'}</label>
                    <input 
                      id="firstName"
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      placeholder="First Name"
                      required 
                    />
                  </div>

                  <div className="floating-field">
                    <label htmlFor="lastName">{t('lastName') || 'Last Name'}</label>
                    <input 
                      id="lastName"
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      placeholder="Last Name"
                      required 
                    />
                  </div>
                </div>

                <div className="floating-field full-width">
                  <label htmlFor="email">{t('emailAddress') || 'Email Address'}</label>
                  <input 
                    id="email"
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="yourname@domain.com"
                  />
                </div>

                <div className="form-row-grid">
                  <div className="floating-field">
                    <label htmlFor="phoneNumber">{t('phoneNumber') || 'Phone Number'}</label>
                    <div className="phone-prefix-input">
                      <span className="phone-tag">🇰🇭 +855</span>
                      <input 
                        id="phoneNumber"
                        name="phoneNumber" 
                        value={form.phoneNumber} 
                        onChange={handleChange} 
                        placeholder="71 995 6996"
                        required 
                      />
                    </div>
                  </div>

                  <div className="floating-field">
                    <label>Business Type</label>
                    <div className="field-select-mock">
                      <Store size={16} />
                      <span>Retail & Cafe POS</span>
                    </div>
                  </div>
                </div>

                <div className="role-selector-block">
                  <span className="selector-title">Account Role</span>
                  <div className="role-cards-grid">
                    <button
                      type="button"
                      className={`role-option-card ${form.role === 'Owner' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('Owner')}
                    >
                      {form.role === 'Owner' && <Check size={14} className="role-check" />}
                      <User size={18} />
                      <span>Store Owner</span>
                    </button>

                    <button
                      type="button"
                      className={`role-option-card ${form.role === 'Manager' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('Manager')}
                    >
                      {form.role === 'Manager' && <Check size={14} className="role-check" />}
                      <Shield size={18} />
                      <span>Cashier / Staff</span>
                    </button>
                  </div>
                </div>

                <p className="form-explanatory-copy">
                  In order to access all synced accounting tools, please keep your phone and account details updated.
                </p>

                <div className="form-actions-group">
                  <button className="settings-primary-btn" type="submit" disabled={saving}>
                    {saving ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                  </button>
                  <button 
                    className="settings-cancel-btn" 
                    type="button" 
                    disabled={saving}
                    onClick={handleCancel}
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </MobileAppShell>
  );
}