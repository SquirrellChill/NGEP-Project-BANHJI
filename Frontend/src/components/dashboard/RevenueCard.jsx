import { Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrencyPair } from '../../utils/currency';
import { formatDisplayDate, formatDisplayDateRange } from '../../utils/sales';

export default function RevenueCard({ summary, variant = 'home' }) {
  const { language, t } = useLanguage();
  const label = variant === 'history' ? summary.filteredLabel : summary.label;
  const amountKHR = summary.amountKHR || 0;
  const amountUSD = summary.amountUSD || 0;
  const totals = formatCurrencyPair({ khr: amountKHR, usd: amountUSD });
  const displayDate = summary.endDate
    ? formatDisplayDateRange(summary.date, summary.endDate, language)
    : formatDisplayDate(summary.date, language);

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
            <span>{displayDate}</span>
          </div>
        )}
      </div>
      <div className="revenue-main-row">
        <strong>{totals.primary}</strong>
        <span>({totals.equivalent})</span>
      </div>
      {variant === 'home' && (
        <>
          <p className="revenue-equivalent">
            {t('equivalentAmount')} <b>{totals.equivalent}</b>
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
          <span>{displayDate}</span>
          <button type="button" aria-label="Next date">›</button>
        </div>
      )}
    </section>
  );
}
