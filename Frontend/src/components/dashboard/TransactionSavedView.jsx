import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransactionSavedView({ onNewSale }) {
  const navigate = useNavigate();

  return (
    <section className="transaction-saved-view">
      <div className="saved-icon-badge">
        <Check size={42} strokeWidth={3} />
      </div>
      <h1>Transaction Saved</h1>
      <p>Your sale has been added to today&apos;s revenue.</p>
      <div className="saved-actions">
        <button className="primary-action" type="button" onClick={onNewSale}>Record Another Sale</button>
        <button className="outline-action" type="button" onClick={() => navigate('/dashboard')}>Back to Home</button>
      </div>
    </section>
  );
}
