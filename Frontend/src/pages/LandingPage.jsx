import React from 'react';
import { BarChart3, CheckCircle2, Cloud, Mic, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StitchAssistantAvatar from '../components/stitch/StitchAssistantAvatar';
import StitchPublicShell from '../components/stitch/StitchPublicShell';
import StitchShowcase from '../components/stitch/StitchShowcase';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasStoredSession = Boolean(localStorage.getItem('kc_token') || localStorage.getItem('kc_user'));
  const isLoggedIn = Boolean(user || hasStoredSession);

  return (
    <StitchPublicShell isAuthenticated={isLoggedIn}>
      <main className="stitch-landing-main">
        <section className="stitch-hero">
          <div className="stitch-hero-copy">
            <span className="stitch-eyebrow">
              <Zap size={15} fill="currentColor" />
              Voice bookkeeping for daily sales
            </span>
            <h1>KotChomnol</h1>
            <p>
              Speak shop transactions naturally and turn them into structured sales records,
              revenue summaries, and reviewable ledgers.
            </p>
            <div className="stitch-hero-actions">
              <button className="stitch-primary-action" type="button" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}>
                {isLoggedIn ? 'Open Dashboard' : 'Create Account'}
              </button>
              <button className="stitch-secondary-action" type="button" onClick={() => navigate(isLoggedIn ? '/dashboard/voice' : '/login')}>
                {isLoggedIn ? 'Record Sale' : 'Sign In'}
              </button>
            </div>
          </div>
          <div className="stitch-hero-preview">
            <StitchAssistantAvatar size="lg" />
            <StitchShowcase />
          </div>
        </section>

        <section className="stitch-feature-grid" aria-label="Product capabilities">
          <Feature icon={<Mic size={22} />} title="Voice-to-sales" text="Capture products, quantities, and prices from natural speech." />
          <Feature icon={<BarChart3 size={22} />} title="Revenue summaries" text="Review today, week, and month totals from one consistent dashboard." />
          <Feature icon={<CheckCircle2 size={22} />} title="Confirm before saving" text="Edit extracted items before they become official sales records." />
          <Feature icon={<Cloud size={22} />} title="Cloud connected" text="Use the same account across browser devices once authenticated." />
          <Feature icon={<ShieldCheck size={22} />} title="Protected workspace" text="Auth, bearer tokens, and route protection remain part of the app flow." />
        </section>
      </main>
    </StitchPublicShell>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="stitch-feature-card">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}
