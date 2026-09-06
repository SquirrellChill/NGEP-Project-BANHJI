import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ProfileCard from '../../components/dashboard/ProfileCard';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import SettingsList from '../../components/dashboard/SettingsList';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { buildDashboardProfile } from '../../utils/profile';
import '../DashboardPage.css';

const profileFallback = {
  name: 'Seller',
  firstName: 'Seller',
  businessName: 'BANHJI',
  role: 'Owner',
  email: '',
  phone: '',
  address: '',
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const profile = buildDashboardProfile(user, profileFallback);

  return (
    <MobileAppShell activeTab="profile" showBottomNav={false}>
      <ScreenHeader title={t('profile')} onBack={() => window.history.back()} />
      <ProfileCard profile={profile} />
      <h2 className="account-heading">{t('account')}</h2>
      <SettingsList />
    </MobileAppShell>
  );
}
