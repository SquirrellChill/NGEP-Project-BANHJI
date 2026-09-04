import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScreenHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  const goBack = onBack || (() => navigate(-1));

  return (
    <header className="screen-header">
      <button className="icon-soft-btn" type="button" onClick={goBack} aria-label="Go back">
        <ChevronLeft size={21} strokeWidth={2.6} />
      </button>
      <h1>{title}</h1>
      <div className="screen-header-right">{right}</div>
    </header>
  );
}
