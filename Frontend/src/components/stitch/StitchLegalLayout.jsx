import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function StitchLegalLayout({ icon, title, updated, children }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <div className="stitch-legal-page">
      <main className="stitch-legal-shell">
        <header className="stitch-legal-header">
          <button 
            type="button" 
            className="legal-back-btn" 
            onClick={() => navigate('/')}
            title={isKhmer ? 'ត្រឡប់ទៅគេហទំព័រដើម' : 'Back to Website'}
          >
            <ArrowLeft size={16} />
            <span>{isKhmer ? 'ត្រឡប់ទៅគេហទំព័រដើម' : 'Back to Website'}</span>
          </button>
        </header>

        <section className="stitch-legal-title">
          {icon && <div className="stitch-legal-icon">{icon}</div>}
          <h1>{title}</h1>
          {updated && <p>{updated}</p>}
        </section>

        <article className="stitch-legal-card">{children}</article>
      </main>
    </div>
  );
}