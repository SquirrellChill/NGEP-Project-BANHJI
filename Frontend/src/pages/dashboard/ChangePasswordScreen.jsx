import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import { useLanguage } from '../../context/LanguageContext';
import '../DashboardPage.css';

export default function ChangePasswordScreen() {
  const { t } = useLanguage();
  return (
    <MobileAppShell showBottomNav={false}>
      <ScreenHeader title={t('changePassword')} onBack={() => window.history.back()} />
      <section className="password-hero">
        <div className="lock-illustration">
          <span />
        </div>
        <h1>{t('createNewPassword')}</h1>
        <p>{t('choosePassword')}</p>
      </section>
      <ChangePasswordForm />
    </MobileAppShell>
  );
}
