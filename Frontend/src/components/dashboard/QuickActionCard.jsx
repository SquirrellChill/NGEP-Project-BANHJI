import { ArrowUpRight, Mic } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function QuickActionCard({ onClick }) {
  const { t } = useLanguage();
  return (
    <section>
      <h3 className="section-heading">Quick action</h3>
      <button className="quick-action-card" type="button" onClick={onClick}>
        <span className="quick-action-icon">
          <Mic size={27} fill="currentColor" />
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
