import { ArrowUpRight, AudioLines, Keyboard } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function QuickActionCard({ onVoice, onManual }) {
  const { t } = useLanguage();
  return (
    <section>
      <h3 className="section-heading">{t('quickAction')}</h3>
      <button className="quick-action-card" type="button" onClick={onManual}>
        <span className="quick-action-icon">
          <Keyboard size={27} />
        </span>
        <span className="quick-action-copy">
          <strong>{t('manualEntry')}</strong>
          <span>{t('manualEntryHint')}</span>
        </span>
        <ArrowUpRight className="quick-action-arrow" size={22} strokeWidth={2.5} />
      </button>
      <button className="quick-action-card secondary" type="button" onClick={onVoice}>
        <span className="quick-action-icon">
          <AudioLines size={27} />
        </span>
        <span className="quick-action-copy">
          <strong>{t('recordSale')}</strong>
          <span>{t('listeningSale')}</span>
        </span>
        <ArrowUpRight className="quick-action-arrow" size={22} strokeWidth={2.5} />
      </button>
    </section>
  );
}
