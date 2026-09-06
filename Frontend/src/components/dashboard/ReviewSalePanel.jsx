import { Check, Pencil, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatKHR, formatUSD } from '../../utils/currency';

const getUnitPrice = (item) => Number(item.unit_price ?? item.unitPrice ?? item.unitPriceKHR ?? item.unitPriceUSD ?? item.price ?? 0);
const getCurrency = (item) => item.currency || (item.unitPriceKHR !== undefined || item.totalKHR !== undefined ? 'KHR' : 'USD');
const formatMoney = (value, currency) => (currency === 'KHR' ? formatKHR(value) : formatUSD(value));

export default function ReviewSalePanel({ items, onEdit, onConfirm, deletedIds = [], error = '', isSaving = false }) {
  const { t } = useLanguage();
  const visibleItems = items.filter((item) => !deletedIds.includes(item.id));
  const totals = visibleItems.reduce(
    (sum, item) => {
      const currency = getCurrency(item);
      sum[currency] += Number(item.quantity || 0) * getUnitPrice(item);
      return sum;
    },
    { KHR: 0, USD: 0 }
  );
  const totalLabel = [
    totals.KHR > 0 ? formatKHR(totals.KHR) : '',
    totals.USD > 0 ? formatUSD(totals.USD) : '',
  ].filter(Boolean).join(' / ') || formatUSD(0);

  return (
    <div className="review-sale-panel">
      <section className="success-banner">
        <span className="success-icon"><Check size={18} /></span>
        <span className="success-copy">
          <strong>{t('aiExtractionComplete')}</strong>
          <small>{t('reviewBeforeSaving')}</small>
        </span>
        <button type="button">
          <RotateCcw size={13} />
          {t('rerecord')}
        </button>
      </section>

      <p className="review-intro">{t('foundItems')}</p>
      <section className="review-items-card">
        <div className="review-grid review-head">
          <span>{t('product')}</span>
          <span>{t('qty')}</span>
          <span>{t('unitPrice')}</span>
          <span>{t('total')}</span>
        </div>
        {visibleItems.map((item) => (
          <button className="review-grid review-row" type="button" key={item.id} onClick={() => onEdit(item)}>
            <span>{item.product}</span>
            <span>{item.quantity}</span>
            <span>{formatMoney(getUnitPrice(item), getCurrency(item))}</span>
            <span>{formatMoney(Number(item.quantity || 0) * getUnitPrice(item), getCurrency(item))}</span>
          </button>
        ))}
      </section>
      <section className="sale-total-section">
        <div><strong>{t('totalItems')}:</strong><span>{visibleItems.length}</span></div>
        <div><strong>{t('totalAmount')}</strong><span>{totalLabel}</span></div>
      </section>
      {error && <p className="review-error-message">{error}</p>}
      <section className="screen-actions two-col">
        <button className="outline-action" type="button" onClick={() => onEdit(visibleItems[0])} disabled={!visibleItems.length || isSaving}>
          <Pencil size={16} fill="currentColor" />
          {t('editItems')}
        </button>
        <button className="primary-action" type="button" onClick={onConfirm} disabled={!visibleItems.length || isSaving}>
          {isSaving ? t('saving') : t('confirmSaveSale')}
        </button>
      </section>
    </div>
  );
}
