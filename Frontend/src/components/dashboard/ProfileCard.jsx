import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import UserAvatar from './UserAvatar';

export default function ProfileCard({ profile }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="profile-card">
      <UserAvatar size="lg" />
      <div className="profile-card-copy">
        <h2>{profile.name}</h2>
        <p>{profile.role} · {profile.businessName}</p>
        <p>{profile.email}</p>
      </div>
      <button type="button" onClick={() => navigate('/dashboard/profile/edit')}>
        <Edit size={14} />
        {t('edit')}
      </button>
    </section>
  );
}
