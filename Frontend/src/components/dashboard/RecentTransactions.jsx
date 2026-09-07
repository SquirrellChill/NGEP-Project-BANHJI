import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrencyPair } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/sales';

const formatTotal = (transaction) => {
  const totals = formatCurrencyPair({ khr: transaction.amountKHR, usd: transaction.amountUSD });
  return totals.equivalent && totals.equivalent !== '$0.00' && totals.equivalent !== '0 KHR'
    ? `${totals.primary} (${totals.equivalent})`
    : totals.primary;
};

export default function RecentTransactions({ transactions }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

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
              <small>{formatDisplayDate(transaction.time, language)} · {t('saleSource')}</small>
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
