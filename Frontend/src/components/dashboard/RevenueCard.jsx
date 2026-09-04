import { Calendar, TrendingUp } from 'lucide-react';
import { formatKHR, formatRiel, formatUSD } from '../../utils/currency';

export default function RevenueCard({ summary, variant = 'home' }) {
  const label = variant === 'history' ? summary.filteredLabel : summary.label;

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
        <strong>{formatKHR(summary.amountKHR)}</strong>
        {variant === 'history' && <span>({formatUSD(summary.amountUSD)})</span>}
      </div>
      {variant === 'home' && (
        <>
          <p className="revenue-equivalent">
            Equivalent: <b>{formatUSD(summary.amountUSD)}</b> <span>(1$= {formatRiel(summary.exchangeRate)})</span>
          </p>
          <div className="revenue-divider" />
          <div className="revenue-orders">
            <span>Total Orders</span>
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
