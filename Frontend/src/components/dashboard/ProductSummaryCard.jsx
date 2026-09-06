import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductSummaryCard({ totalItems, totalQuantity }) {
  const { t } = useLanguage();
  return (
    <section className="product-summary-card">
      <div className="summary-icon">
        <ShoppingBag size={24} />
      </div>
      <div className="summary-metric">
        <span>{t('totalItems')}</span>
        <strong>{totalItems}</strong>
        <small>{t('productTypes')}</small>
      </div>
      <div className="summary-divider" />
      <div className="summary-metric">
        <span>{t('totalQuantity')}</span>
        <strong>{totalQuantity}</strong>
        <small>{t('items')}</small>
      </div>
    </section>
  );
}
