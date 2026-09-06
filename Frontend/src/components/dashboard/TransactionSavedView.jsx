import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionSavedView({ onNewSale }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="transaction-saved-view">
      <div className="saved-icon-badge">
        <Check size={42} strokeWidth={3} />
      </div>
      <h1>{t('transactionSaved')}</h1>
      <p>{t('saleAdded')}</p>
      <div className="saved-actions">
        <button className="primary-action" type="button" onClick={onNewSale}>{t('recordAnotherSale')}</button>
        <button className="outline-action" type="button" onClick={() => navigate('/dashboard')}>{t('backHome')}</button>
      </div>
    </section>
  );
}
