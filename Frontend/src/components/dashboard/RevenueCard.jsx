import { Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatKHR, formatUSD } from '../../utils/currency';

export default function RevenueCard({ summary, variant = 'home' }) {
  const { t } = useLanguage();
  const label = variant === 'history' ? summary.filteredLabel : summary.label;
  const amountKHR = summary.amountKHR || 0;
  const amountUSD = summary.amountUSD || 0;

  return (
    <section className="revenue-summary-card">
      <div className="revenue-card-top">
        <div className="revenue-label">
          <TrendingUp size={16} />
          <span>{label}</span>
        </div>
        {variant === 'home' && (
          <div className="date-pill">
            <Calendar size={14} />
            <span>{summary.date}</span>
          </div>
        )}
      </div>
      <div className="revenue-main-row">
        <strong>{formatKHR(amountKHR)}</strong>
        <span>({formatUSD(amountUSD)})</span>
      </div>
      {variant === 'home' && (
        <>
          <p className="revenue-equivalent">
            {t('usdTotal')} <b>{formatUSD(amountUSD)}</b> <span>{t('khrSeparate')}</span>
          </p>
          <div className="revenue-divider" />
          <div className="revenue-orders">
            <span>{t('totalOrders')}</span>
            <b>{summary.totalOrders}</b>
          </div>
        </>
      )}
      {variant === 'history' && (
        <div className="history-date-inline">
          <button type="button" aria-label="Previous date">‹</button>
          <span>{summary.date}</span>
          <button type="button" aria-label="Next date">›</button>
        </div>
      )}
    </section>
  );
}
