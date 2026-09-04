import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ProfileForm from '../../components/dashboard/ProfileForm';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import UserAvatar from '../../components/dashboard/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { currentUserProfile } from '../../data/dashboardMockData';
import { buildDashboardProfile } from '../../utils/profile';
import '../DashboardPage.css';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const profile = buildDashboardProfile(user, currentUserProfile);

  return (
    <MobileAppShell showBottomNav={false}>
      <ScreenHeader title="Edit Profile" onBack={() => window.history.back()} />
      <div className="profile-edit-avatar">
        <UserAvatar size="xl" />
      </div>
      <ProfileForm profile={profile} />
    </MobileAppShell>
  );
}
