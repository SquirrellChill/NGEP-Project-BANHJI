import React, { useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, Cloud, LayoutDashboard, LogIn, Mic, Minus, Plus, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StitchBrand from '../components/stitch/StitchBrand';
import StitchShowcase from '../components/stitch/StitchShowcase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './LandingPage.css';

const featureTabs = [
  { id: 'voice', icon: Mic, titleKey: 'voiceEngine', textKey: 'voiceEngineCopy' },
  { id: 'analytics', icon: BarChart3, titleKey: 'analyticsTitle', textKey: 'analyticsPaneCopy' },
  { id: 'cloud', icon: Cloud, titleKey: 'cloudTitle', textKey: 'cloudPaneCopy' },
];

const faqItems = [
  { questionKey: 'faqOneQ', answerKey: 'faqOneA' },
  { questionKey: 'faqTwoQ', answerKey: 'faqTwoA' },
  { questionKey: 'faqThreeQ', answerKey: 'faqThreeA' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('voice');
  const [openFaq, setOpenFaq] = useState(0);
  const hasStoredSession = Boolean(localStorage.getItem('kc_token') || localStorage.getItem('kc_user'));
  const isLoggedIn = Boolean(user || hasStoredSession);
  const activeFeature = featureTabs.find((feature) => feature.id === activeTab) || featureTabs[0];
  const ActiveIcon = activeFeature.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="landing-wrapper">
      <header className="navbar-container">
        <nav className="navbar" aria-label="Primary">
          <button className="brand-button" type="button" onClick={() => navigate('/')}>
            <StitchBrand />
          </button>
          <div className="nav-links">
            <a href="#features">{t('features')}</a>
            <a href="#faq">{t('faq')}</a>
            <Link to="/terms">{t('terms')}</Link>
            <Link to="/privacy">{t('privacy')}</Link>
          </div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <button className="nav-link-button" type="button" onClick={handleLogout}>{t('logout')}</button>
                <button className="nav-primary" type="button" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard size={17} />
                  {t('dashboard')}
                </button>
              </>
            ) : (
              <>
                <button className="nav-link-button" type="button" onClick={() => navigate('/login')}>
                  <LogIn size={16} />
                  {t('signIn')}
                </button>
                <button className="nav-primary" type="button" onClick={() => navigate('/register')}>{t('startFree')}</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-badge">
            <Zap size={15} fill="currentColor" />
            {t('heroBadge')}
          </div>
          <h1>
            {t('heroTitleLineOne')}
            <span>{t('heroTitleLineTwo')}</span>
          </h1>
          <p className="hero-subtext">{t('landingCopy')}</p>
          <div className="hero-cta-group">
            <button className="hero-primary" type="button" onClick={() => navigate(isLoggedIn ? '/dashboard/voice' : '/register')}>
              {isLoggedIn ? t('recordSale') : t('createAccount')}
              <ArrowRight size={18} />
            </button>
            <button className="hero-secondary" type="button" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}>
              {isLoggedIn ? t('openDashboard') : t('signIn')}
            </button>
          </div>
          <p className="hero-micro-copy">{t('heroMicroCopy')}</p>
          <div className="hero-mockup-wrapper">
            <div className="hero-mockup-card">
              <StitchShowcase />
            </div>
          </div>
        </section>

        <section className="metrics-section" aria-label={t('productCapabilities')}>
          <Metric value="30s" label={t('averageLogTime')} />
          <Metric value="KHR/USD" label={t('syncedLedger')} />
          <Metric value="24/7" label={t('cloudBackup')} />
          <Metric value="AI" label={t('voiceAccuracy')} />
        </section>

        <section className="features-tab-section" id="features">
          <div className="section-heading-center">
            <span>{t('powerfulCapabilities')}</span>
            <h2>{t('designedForSpeed')}</h2>
          </div>
          <div className="feature-tabs">
            {featureTabs.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  className={feature.id === activeTab ? 'active' : ''}
                  type="button"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <Icon size={18} />
                  {t(feature.titleKey)}
                </button>
              );
            })}
          </div>
          <article className="feature-pane">
            <span className="feature-pane-icon"><ActiveIcon size={24} /></span>
            <div>
              <h3>{t(activeFeature.titleKey)}</h3>
              <p>{t(activeFeature.textKey)}</p>
            </div>
            <CheckCircle2 size={28} />
          </article>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-heading-center">
            <span>{t('faq')}</span>
            <h2>{t('faqTitle')}</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <button className={`faq-item ${isOpen ? 'open' : ''}`} type="button" key={item.questionKey} onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                  <span>
                    <strong>{t(item.questionKey)}</strong>
                    {isOpen && <small>{t(item.answerKey)}</small>}
                  </span>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="footer-cta">
          <h2>KotChomnol</h2>
          <p>{t('landingCopy')}</p>
          <button type="button" onClick={() => navigate(isLoggedIn ? '/dashboard/voice' : '/register')}>
            {isLoggedIn ? t('recordSale') : t('startFree')}
            <ChevronDown size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
