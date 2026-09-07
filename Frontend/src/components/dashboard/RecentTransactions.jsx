import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrencyTotals } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/sales';

const getTotals = (transaction) => formatCurrencyTotals({
  khr: transaction.amountKHR,
  usd: transaction.amountUSD,
  exchangeRate: transaction.exchangeRate,
});

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
        {transactions.map((transaction) => {
          const totals = getTotals(transaction);
          return (
            <button
              className="transaction-row-button"
              key={transaction.id}
              type="button"
              onClick={() => navigate('/dashboard/transactions', { state: { saleId: transaction.id } })}
            >
              <span>
                <strong>{transaction.title}</strong>
                <small>{formatDisplayDate(transaction.time, language)} - {t('saleSource')}</small>
              </span>
              <span className="transaction-amount transaction-total-stack">
                <span>{t('totalUsdLabel')}: {totals.usdLabel}</span>
                <span>{t('totalKhrLabel')}: {totals.khrLabel}</span>
                <ChevronRight size={17} strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}