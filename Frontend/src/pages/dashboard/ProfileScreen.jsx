import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ProfileCard from '../../components/dashboard/ProfileCard';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import SettingsList from '../../components/dashboard/SettingsList';
import { useAuth } from '../../context/AuthContext';
import { currentUserProfile } from '../../data/dashboardMockData';
import { buildDashboardProfile } from '../../utils/profile';
import '../DashboardPage.css';

export default function ProfileScreen() {
  const { user } = useAuth();
  const profile = buildDashboardProfile(user, currentUserProfile);

  return (
    <MobileAppShell activeTab="profile" showBottomNav={false}>
      <ScreenHeader title="Profile" onBack={() => window.history.back()} />
      <ProfileCard profile={profile} />
      <h2 className="account-heading">Account</h2>
      <SettingsList />
    </MobileAppShell>
  );
}
