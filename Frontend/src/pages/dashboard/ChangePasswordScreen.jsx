import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import '../DashboardPage.css';

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <MobileAppShell showBottomNav={false}>
      <ScreenHeader title={t('changePassword')} onBack={() => navigate('/dashboard/profile')} />
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
