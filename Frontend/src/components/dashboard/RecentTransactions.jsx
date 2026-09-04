import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatKHR } from '../../utils/currency';

export default function RecentTransactions({ transactions }) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="section-title-row">
        <h3 className="section-heading">Recent transactions</h3>
        <button className="text-action" type="button" onClick={() => navigate('/dashboard/transactions')}>
          View all
        </button>
      </div>
      <div className="transaction-list-card">
        {transactions.map((transaction) => (
          <button className="transaction-row-button" key={transaction.id} type="button" onClick={() => navigate('/dashboard/transactions')}>
            <span>
              <strong>{transaction.title}</strong>
              <small>{transaction.time} · {transaction.source}</small>
            </span>
            <span className="transaction-amount">
              {formatKHR(transaction.amountKHR)}
              <ChevronRight size={17} strokeWidth={2.5} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
