import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import StitchAssistantAvatar from './StitchAssistantAvatar';
import StitchBrand from './StitchBrand';

export default function StitchAuthLayout({ title, subtitle, children, footer }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="stitch-auth-page">
      <main className="stitch-auth-shell">
        <section className="stitch-auth-hero">
          <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="Go home">
            <StitchBrand />
          </button>
          <div className="stitch-auth-avatar-wrap">
            <StitchAssistantAvatar />
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        <section className="stitch-auth-panel">
          {children}
          {footer && <div className="stitch-auth-footer">{footer}</div>}
          <p className="stitch-legal-note">
            {t('termsAgree')} <Link to="/terms">{t('terms')}</Link> {t('and')} <Link to="/privacy">{t('privacyPolicy')}</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
