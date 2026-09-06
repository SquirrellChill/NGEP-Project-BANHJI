import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatKHR, formatUSD } from '../../utils/currency';

export default function RecentTransactions({ transactions }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const formatTotal = (transaction) => {
    const parts = [];
    if (Number(transaction.amountKHR || 0) > 0) parts.push(formatKHR(transaction.amountKHR));
    if (Number(transaction.amountUSD || 0) > 0) parts.push(formatUSD(transaction.amountUSD));
    return parts.join(' / ') || formatKHR(0);
  };

  return (
    <section>
      <div className="section-title-row">
        <h3 className="section-heading">{t('recentTransactions')}</h3>
        <button className="text-action" type="button" onClick={() => navigate('/dashboard/transactions')}>
          {t('viewAll')}
        </button>
      </div>
      <div className="transaction-list-card">
        {!transactions.length && <p className="empty-state-copy">{t('noTransactions')}</p>}
        {transactions.map((transaction) => (
          <button className="transaction-row-button" key={transaction.id} type="button" onClick={() => navigate('/dashboard/transactions')}>
            <span>
              <strong>{transaction.title}</strong>
              <small>{transaction.time} · {transaction.source}</small>
            </span>
            <span className="transaction-amount">
              {formatTotal(transaction)}
              <ChevronRight size={17} strokeWidth={2.5} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
