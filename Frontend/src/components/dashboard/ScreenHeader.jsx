import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function ScreenHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const goBack = onBack || (() => navigate(-1));

  return (
    <header className="screen-header">
      <button className="icon-soft-btn" type="button" onClick={goBack} aria-label={t('back')}>
        <ChevronLeft size={21} strokeWidth={2.6} />
      </button>
      <h1>{title}</h1>
      <div className="screen-header-right">{right}</div>
    </header>
  );
}
