import { ChevronRight, Languages, Lock, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SettingsList() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [english, setEnglish] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <section className="settings-list">
      <button type="button" onClick={() => navigate('/dashboard/profile/edit')}>
        <SettingIcon><User size={21} /></SettingIcon>
        <span><strong>My Account</strong><small>Make changes to your account</small></span>
        <ChevronRight size={21} />
      </button>
      <button type="button" onClick={() => setEnglish(!english)}>
        <SettingIcon><Languages size={21} /></SettingIcon>
        <span><strong>Language</strong><small>App display language</small></span>
        <b className={`language-toggle ${english ? 'active' : ''}`}><span>EN</span><i /></b>
      </button>
      <button type="button" onClick={() => navigate('/dashboard/profile/change-password')}>
        <SettingIcon><Lock size={21} /></SettingIcon>
        <span><strong>Change password</strong><small>Choose a strong password</small></span>
        <ChevronRight size={21} />
      </button>
      <button type="button" onClick={handleLogout}>
        <SettingIcon><LogOut size={21} /></SettingIcon>
        <span><strong>Log out</strong><small>Further secure your account for safety</small></span>
      </button>
    </section>
  );
}

function SettingIcon({ children }) {
  return <span className="setting-icon">{children}</span>;
}
