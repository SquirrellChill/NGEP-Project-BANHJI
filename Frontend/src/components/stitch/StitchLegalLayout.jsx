import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StitchBrand from './StitchBrand';

export default function StitchLegalLayout({ icon, title, updated, children }) {
  const navigate = useNavigate();

  return (
    <div className="stitch-legal-page">
      <main className="stitch-legal-shell">
        <header className="stitch-legal-header">
          <button className="icon-soft-btn" type="button" onClick={() => navigate('/')} aria-label="Back to home">
            <ArrowLeft size={20} />
          </button>
          <StitchBrand compact />
          <span />
        </header>
        <section className="stitch-legal-title">
          <div className="stitch-legal-icon">{icon}</div>
          <h1>{title}</h1>
          <p>{updated}</p>
        </section>
        <article className="stitch-legal-card">{children}</article>
      </main>
    </div>
  );
}
