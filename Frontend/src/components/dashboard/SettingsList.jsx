import { ChevronRight, Languages, Lock, LogOut, Moon, Sun, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsList() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <section className="settings-list">
      <button type="button" onClick={() => navigate('/dashboard/profile/edit')}>
        <SettingIcon><User size={21} /></SettingIcon>
        <span><strong>{t('myAccount')}</strong><small>{t('makeChanges')}</small></span>
        <ChevronRight size={21} />
      </button>
      <button type="button" onClick={toggleLanguage}>
        <SettingIcon><Languages size={21} /></SettingIcon>
        <span><strong>{t('language')}</strong><small>{t('appLanguage')}</small></span>
        <b className={`language-toggle ${language === 'en' ? 'active' : ''}`}><span>{language.toUpperCase()}</span><i /></b>
      </button>
      <button type="button" onClick={toggleTheme}>
        <SettingIcon>{theme === 'dark' ? <Moon size={21} /> : <Sun size={21} />}</SettingIcon>
        <span><strong>{t('theme')}</strong><small>{theme === 'dark' ? t('darkMode') : t('lightMode')}</small></span>
        <b className={`language-toggle theme-toggle ${theme === 'dark' ? 'active' : ''}`}><span>{theme === 'dark' ? 'DRK' : 'LGT'}</span><i /></b>
      </button>
      <button type="button" onClick={() => navigate('/dashboard/profile/change-password')}>
        <SettingIcon><Lock size={21} /></SettingIcon>
        <span><strong>{t('changePassword')}</strong><small>{t('choosePassword')}</small></span>
        <ChevronRight size={21} />
      </button>
      <button type="button" onClick={handleLogout}>
        <SettingIcon><LogOut size={21} /></SettingIcon>
        <span><strong>{t('logout')}</strong><small>{t('logoutHint')}</small></span>
      </button>
    </section>
  );
}

function SettingIcon({ children }) {
  return <span className="setting-icon">{children}</span>;
}
