import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import '../DashboardPage.css';

export default function ChangePasswordScreen() {
  return (
    <MobileAppShell showBottomNav={false}>
      <ScreenHeader title="Change Password" onBack={() => window.history.back()} />
      <section className="password-hero">
        <div className="lock-illustration">
          <span />
        </div>
        <h1>Create a New Password</h1>
        <p>Choose a strong password to keep your account secure.</p>
      </section>
      <ChangePasswordForm />
    </MobileAppShell>
  );
}
