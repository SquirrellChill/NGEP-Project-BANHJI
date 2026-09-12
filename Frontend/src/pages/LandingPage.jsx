import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Mic, BarChart3, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

const content = {
  km: {
    navFeatures: 'មុខងារ',
    navFaq: 'សំណួរ',
    navAbout: 'អំពីយើង',
    navTerms: 'លក្ខខណ្ឌ',
    navPrivacy: 'ឯកជនភាព',
    navContact: 'ទំនាក់ទំនង',
    navSignIn: 'ចូលគណនី',
    navStartFree: 'ចាប់ផ្ដើម',
    navDashboard: 'ទំព័រដើម',
    navLogout: 'ចាកចេញ',
    heroBadge: 'បង្កើតសម្រាប់ម្ចាស់ហាងខ្មែរ',
    heroTitle1: 'និយាយការលក់របស់អ្នក ',
    heroTitle2: 'មើលចំណូលរបស់អ្នក',
    heroSub: 'និយាយការលក់ក្នុងហាង ហើយបម្លែងទៅជាកំណត់ត្រាលក់ សង្ខេបចំណូល និងបញ្ជីដែលអាចពិនិត្យបាន។',
    heroBtnPrimaryAuth: 'កត់ត្រាការលក់',
    heroBtnPrimaryGuest: 'បង្កើតគណនី',
    heroBtnSecondaryAuth: 'ទំព័រដើម',
    heroBtnSecondaryGuest: 'ចូលគណនី',
    heroDisclaimer: 'គ្មានទិន្នន័យក្លែងក្លាយ​ ការលក់ដែលបានបញ្ជាក់ត្រូវបានរក្សាទុកតាមគណនីរបស់អ្នក។',
    revLabel: 'ចំណូលថ្ងៃនេះ',
    revBadge: 'ផ្សាយផ្ទាល់',
    revUsd: 'សមមូល: $10.25',
    revVoiceTitle: 'កត់ត្រាតាមសំឡេង',
    revVoiceStatus: 'AI បានស្គាល់',
    revItem1: 'កាហ្វេទឹកដោះគោទឹកកក x2',
    revItem2: 'នំប៉័ងក្រូសង់ x1',
    statTime: 'ពេលកត់ត្រាជាមធ្យម',
    statCurrency: 'គាំទ្រទ្វេដង',
    statCloud: 'Cloud Safe',
    featuresTitle: 'សមត្ថភាពសំខាន់ៗ',
    featuresSub: 'រចនាសម្រាប់ល្បឿនប្រចាំថ្ងៃរបស់ហាង',
    feat1Title: 'កត់ត្រាសំឡេងខ្មែរ និងអង់គ្លេស',
    feat1Desc: 'ថតការលក់ ឆ្លើយសំណួរបន្ថែមបើចាំបាច់ ហើយពិនិត្យទំនិញដែលបានដកស្រង់មុនរក្សាទុក។',
    feat2Title: 'ចំណូលពីការលក់ដែលបានរក្សាទុក',
    feat2Desc: 'សង្ខេបចំណូលច្បាស់លាស់ ងាយស្រួលតាមដានរបាយការណ៍ប្រចាំថ្ងៃដោយស្វ័យប្រវត្តិ។',
    feat3Title: 'កន្លែងការងារគណនីមានសុវត្ថិភាព',
    feat3Desc: 'ទិន្នន័យហាងរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពខ្ពស់នៅលើប្រព័ន្ធ Cloud ម៉ាស៊ីនមេ។',
    faqTitle: 'សំណួរដែលសួរញឹកញាប់',
    faq1Q: 'តើខ្ញុំអាចពិនិត្យការលក់មុនរក្សាទុកបានទេ?',
    faq1A: 'បាន។ លទ្ធផលសំឡេងនឹងបើកក្នុងទំព័រពិនិត្យដដែល ដើម្បីឱ្យអ្នកកែទំនិញមុនបញ្ជាក់។',
    faq2Q: 'តើចំណូលមកពីប្រតិបត្តិការពិតទេ?',
    faq2A: 'បាទ/ចាស ចំណូលទាំងអស់ត្រូវបានកត់ត្រាផ្អែកលើការបញ្ចូលជាក់ស្តែងរបស់អ្នក និងត្រូវបានធ្វើសមកាលកម្មភ្លាមៗ។',
    faq3Q: 'តើខ្ញុំអាចប្រើភាសាខ្មែរបានទេ?',
    faq3A: 'ប្រព័ន្ធរបស់យើងគាំទ្រទាំងភាសាខ្មែរ និងអង់គ្លេសយ៉ាងពេញលេញសម្រាប់សំឡេងនិងអត្ថបទ។',
    ctaDesc: 'និយាយការលក់ក្នុងហាង ហើយបម្លែងទៅជាកំណត់ត្រាលក់ សង្ខេបចំណូល និងបញ្ជីដែលអាចពិនិត្យបាន។',
    ctaBtn: 'ចាប់ផ្ដើមឥតគិតថ្លៃ',
    footerDesc: 'KOTCHOMNOL ជួយម្ចាស់ហាងកត់ត្រាការលក់ដោយសំឡេង ឬបញ្ចូលដោយដៃ ពិនិត្យទំនិញនីមួយៗ ហើយរក្សាទុកប្រតិបត្តិការដែលបានបញ្ជាក់ទៅក្នុងកំណត់ត្រាចំណូលដែលបានផ្ទៀងផ្ទាត់។',
    footerHome: 'ទំព័រដើម',
    footerFeatures: 'មុខងារ',
    footerAbout: 'អំពីយើង',
    footerTerms: 'លក្ខខណ្ឌ',
    footerPrivacy: 'ឯកជនភាព',
    footerContact: 'ទំនាក់ទំនង',
    footerCopyright: 'រក្សាសិទ្ធិ 2026 KOTCHOMNOL​ រក្សាសិទ្ធិគ្រប់យ៉ាង',
  },
  en: {
    navFeatures: 'Features',
    navFaq: 'FAQ',
    navAbout: 'About',
    navTerms: 'Terms',
    navPrivacy: 'Privacy',
    navContact: 'Contact',
    navSignIn: 'Sign In',
    navStartFree: 'Start Free',
    navDashboard: 'Home',
    navLogout: 'Logout',
    heroBadge: 'Built for Cambodian Shop Owners',
    heroTitle1: 'Speak your sales. ',
    heroTitle2: 'See your revenue.',
    heroSub: 'Speak in-store sales naturally, convert speech to sales records, revenue summaries, and reviewable lists.',
    heroBtnPrimaryAuth: 'Record Sale',
    heroBtnPrimaryGuest: 'Create Account',
    heroBtnSecondaryAuth: 'Home',
    heroBtnSecondaryGuest: 'Sign In',
    heroDisclaimer: 'No fake data. Verified sales are saved directly to your account.',
    revLabel: "Today's Revenue",
    revBadge: 'Live Sync',
    revUsd: 'Equivalent: $10.25',
    revVoiceTitle: 'Voice-to-sales',
    revVoiceStatus: 'AI Matched',
    revItem1: 'Iced coffee x2',
    revItem2: 'Croissant x1',
    statTime: 'Avg log time',
    statCurrency: 'Dual Currency',
    statCloud: 'Cloud Safe',
    featuresTitle: 'Key Capabilities',
    featuresSub: 'Built for the daily speed of local businesses',
    feat1Title: 'Khmer & English Voice Entry',
    feat1Desc: 'Record spoken sales, answer follow-ups if needed, and review extracted items before saving.',
    feat2Title: 'Saved Sales Revenue Tracking',
    feat2Desc: 'Clear revenue summaries with automated daily reports that are effortless to track.',
    feat3Title: 'Secure Account Workspace',
    feat3Desc: 'Your shop data is securely saved with cloud infrastructure and access protection.',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'Can I review sales before saving?',
    faq1A: 'Yes. Voice results open in a review page so you can edit quantities and prices before confirming.',
    faq2Q: 'Does revenue come from verified transactions?',
    faq2A: 'Yes. All revenue is computed strictly from actual saved items and synced in real time.',
    faq3Q: 'Can I speak in Khmer?',
    faq3A: 'Our system natively supports Khmer and English voice entry and translation.',
    ctaDesc: 'Speak in-store sales, automate bookkeeping, and manage cash flow with zero paperwork.',
    ctaBtn: 'Start Free',
    footerDesc: 'KOTCHOMNOL helps shop owners log sales via voice or manual entry, review each line item, and store confirmed transactions in a verified ledger.',
    footerHome: 'Home',
    footerFeatures: 'Features',
    footerAbout: 'About',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
    footerCopyright: '© 2026 KOTCHOMNOL. All rights reserved.',
  }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLang = language === 'en' ? 'en' : 'km';
  const txt = content[activeLang];

  const hasStoredSession = Boolean(localStorage.getItem('kc_token') || localStorage.getItem('kc_user'));
  const isLoggedIn = Boolean(user || hasStoredSession);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMenu();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page font-kantomruy">
      {/* Floating Header */}
      <header className="landing-navbar-wrapper">
        <div className="landing-navbar">
          {/* Logo */}
          <button 
            className="landing-brand-btn" 
            type="button" 
            onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="landing-brand-icon">K</div>
            <span className="landing-brand-title">KOTCHOMNOL</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="landing-nav-links" aria-label="Primary Navigation">
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>{txt.navFeatures}</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>{txt.navFaq}</a>
            <Link to="/about">{txt.navAbout}</Link>
            <Link to="/terms">{txt.navTerms}</Link>
            <Link to="/privacy">{txt.navPrivacy}</Link>
            <Link to="/contact">{txt.navContact}</Link>
          </nav>

          {/* Nav Right Controls */}
          <div className="landing-nav-right">
            {/* Desktop Theme & Language */}
            <div className="desktop-controls">
              <button 
                type="button" 
                className="landing-theme-btn" 
                onClick={toggleTheme}
                aria-label="Toggle theme mode"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                type="button" 
                className="landing-lang-btn" 
                onClick={toggleLanguage}
                aria-label="Toggle language"
              >
                {language === 'en' ? 'KM' : 'EN'}
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="landing-auth-buttons">
              {isLoggedIn ? (
                <>
                  <button 
                    type="button" 
                    className="landing-text-btn desktop-only" 
                    onClick={handleLogout}
                  >
                    {txt.navLogout}
                  </button>
                  <button 
                    type="button" 
                    className="landing-primary-btn compact" 
                    onClick={() => navigate('/dashboard')}
                  >
                    {txt.navDashboard}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="landing-text-btn" 
                    onClick={() => navigate('/login')}
                  >
                    {txt.navSignIn}
                  </button>
                  <button 
                    type="button" 
                    className="landing-primary-btn compact" 
                    onClick={() => navigate('/register')}
                  >
                    {txt.navStartFree}
                  </button>
                </>
              )}
            </div>

            {/* Hamburger Button */}
            <button
              type="button"
              className="landing-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div 
        className={`landing-drawer-backdrop ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      />

      {/* Mobile Drawer Menu */}
      <aside className={`landing-drawer-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header-row">
          <button 
            type="button" 
            className="drawer-x-btn" 
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav-links">
          <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>{txt.navFeatures}</a>
          <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>{txt.navFaq}</a>
          <Link to="/about" onClick={closeMenu}>{txt.navAbout}</Link>
          <Link to="/terms" onClick={closeMenu}>{txt.navTerms}</Link>
          <Link to="/privacy" onClick={closeMenu}>{txt.navPrivacy}</Link>
          <Link to="/contact" onClick={closeMenu}>{txt.navContact}</Link>

          {/* Theme Mode Toggle */}
          <button 
            type="button" 
            className="drawer-list-btn" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Language Toggle */}
          <button 
            type="button" 
            className="drawer-list-btn" 
            onClick={toggleLanguage}
          >
            <span>{language === 'en' ? 'KH Khmer' : 'EN English'}</span>
          </button>
        </nav>
      </aside>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-container">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-hero-badge">
                {txt.heroBadge}
              </span>

              <h1 className="landing-hero-h1">
                {txt.heroTitle1}<span className="highlight">{txt.heroTitle2}</span>
              </h1>

              <p className="landing-hero-sub">
                {txt.heroSub}
              </p>

              <div className="landing-hero-actions">
                <button 
                  type="button" 
                  className="hero-btn-primary" 
                  onClick={() => navigate(isLoggedIn ? '/dashboard/voice' : '/register')}
                >
                  {isLoggedIn ? txt.heroBtnPrimaryAuth : txt.heroBtnPrimaryGuest}
                </button>
                <button 
                  type="button" 
                  className="hero-btn-secondary" 
                  onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                >
                  {isLoggedIn ? txt.heroBtnSecondaryAuth : txt.heroBtnSecondaryGuest}
                </button>
              </div>

              <p className="landing-hero-disclaimer">
                {txt.heroDisclaimer}
              </p>
            </div>

            <div className="landing-hero-preview">
              <div className="revenue-card">
                <div className="rev-header">
                  <span className="rev-header-label">{txt.revLabel}</span>
                  <span className="rev-badge">{txt.revBadge}</span>
                </div>

                <div className="rev-amount-block">
                  <div className="rev-main-amount">42,000 KHR</div>
                  <div className="rev-usd-amount">{txt.revUsd}</div>
                </div>

                <div className="rev-voice-box">
                  <div className="voice-box-header">
                    <span>{txt.revVoiceTitle}</span>
                    <span>{txt.revVoiceStatus}</span>
                  </div>
                  <div className="voice-item-row">
                    <span>{txt.revItem1}</span>
                    <strong>4,000 KHR</strong>
                  </div>
                  <div className="voice-item-row">
                    <span>{txt.revItem2}</span>
                    <strong>6,000 KHR</strong>
                  </div>
                </div>

                <div className="rev-metrics-grid">
                  <div className="rev-metric-col">
                    <span className="metric-val">30s</span>
                    <span className="metric-sub">{txt.statTime}</span>
                  </div>
                  <div className="rev-metric-col">
                    <span className="metric-val">KHR/USD</span>
                    <span className="metric-sub">{txt.statCurrency}</span>
                  </div>
                  <div className="rev-metric-col">
                    <span className="metric-val">24/7</span>
                    <span className="metric-sub">{txt.statCloud}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features-section">
        <div className="landing-container">
          <div className="section-title-wrap">
            <h2>{txt.featuresTitle}</h2>
            <p>{txt.featuresSub}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Mic size={22} strokeWidth={2.4} />
              </div>
              <h3>{txt.feat1Title}</h3>
              <p>{txt.feat1Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <BarChart3 size={22} strokeWidth={2.4} />
              </div>
              <h3>{txt.feat2Title}</h3>
              <p>{txt.feat2Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={22} strokeWidth={2.4} />
              </div>
              <h3>{txt.feat3Title}</h3>
              <p>{txt.feat3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-faq-section">
        <div className="faq-container">
          <h2 className="faq-title">{txt.faqTitle}</h2>

          <div className="faq-list">
            <div className="faq-card">
              <h3>{txt.faq1Q}</h3>
              <p>{txt.faq1A}</p>
            </div>

            <div className="faq-card">
              <h3>{txt.faq2Q}</h3>
              <p>{txt.faq2A}</p>
            </div>

            <div className="faq-card">
              <h3>{txt.faq3Q}</h3>
              <p>{txt.faq3A}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="landing-cta-banner">
        <div className="faq-container">
          <h2>KOTCHOMNOL</h2>
          <p>{txt.ctaDesc}</p>
          <button 
            type="button" 
            className="cta-white-btn" 
            onClick={() => navigate(isLoggedIn ? '/dashboard/voice' : '/register')}
          >
            {txt.ctaBtn}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="footer-brand-logo">
                <div className="footer-brand-icon">K</div>
                <span className="footer-brand-title">KOTCHOMNOL</span>
              </div>
              <p className="footer-brand-desc">
                {txt.footerDesc}
              </p>
            </div>

            <div className="footer-links-col">
              <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{txt.footerHome}</a>
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>{txt.footerFeatures}</a>
              <Link to="/about">{txt.footerAbout}</Link>
              <Link to="/terms">{txt.footerTerms}</Link>
              <Link to="/privacy">{txt.footerPrivacy}</Link>
              <Link to="/contact">{txt.footerContact}</Link>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p>{txt.footerCopyright}</p>
            <p>support@kotchomnol.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}