import { Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import UserAvatar from './UserAvatar';

export default function AppHeader({ profile }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="app-profile-header">
      <div className="app-profile-left">
        <UserAvatar />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.businessName}</p>
        </div>
      </div>
      <button
        className="public-home-button"
        type="button"
        onClick={() => navigate('/')}
        title={t('publicHomepageHint')}
        aria-label={t('backToWebsite')}
      >
        <Globe2 size={17} />
        <span>{t('backToWebsite')}</span>
      </button>
    </header>
  );
}