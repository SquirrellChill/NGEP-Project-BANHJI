import React from 'react';
import { Check, Pencil, RotateCcw, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { calculateEquivalentTotals, formatCurrencyValue } from '../../utils/currency';
import './ReviewSalePanel.css';

const getUnitPrice = (item) =>
  Number(item.unit_price ?? item.unitPrice ?? item.unitPriceKHR ?? item.unitPriceUSD ?? item.price ?? 0);

const getCurrency = (item) =>
  item.currency || (item.unitPriceKHR !== undefined || item.totalKHR !== undefined ? 'KHR' : 'USD');

export default function ReviewSalePanel({
  items = [],
  onEdit,
  onConfirm,
  onRerecord,
  deletedIds = [],
  error = '',
  isSaving = false,
  exchangeRate = 4050,
}) {
  const { t, language } = useLanguage();
  const isKm = language !== 'en';

  const visibleItems = items.filter((item) => !deletedIds.includes(item.id));

  // Compute item totals
  let rawUsd = 0;
  let rawKhr = 0;

  visibleItems.forEach((item) => {
    const qty = Number(item.quantity || 1);
    const unitPrice = getUnitPrice(item);
    const currency = getCurrency(item);
    const lineTotal = qty * unitPrice;

    if (currency === 'USD') {
      rawUsd += lineTotal;
    } else {
      rawKhr += lineTotal;
    }
  });

  const totals = calculateEquivalentTotals({
    usd: rawUsd,
    khr: rawKhr,
    exchangeRate,
  });

  return (
    <div className="review-sale-panel font-kantomruy">
      {/* Success AI Alert Banner */}
      <section className="review-success-banner">
        <div className="banner-left">
          <span className="success-icon-badge">
            <Check size={18} strokeWidth={2.6} />
          </span>
          <div className="success-copy">
            <strong>{t('aiExtractionComplete') || 'AI Extraction Complete!'}</strong>
            <small>
              {t('reviewBeforeSaving') || "We've captured the details. Please review before saving."}
            </small>
          </div>
        </div>
        {onRerecord && (
          <button type="button" className="rerecord-btn" onClick={onRerecord}>
            <RotateCcw size={14} />
            <span>{t('rerecord') || 'Re-record'}</span>
          </button>
        )}
      </section>

      {/* Items List Card */}
      <div className="review-card">
        <div className="review-card-header">
          <div className="header-title-wrap">
            <ShoppingBag size={18} className="header-icon" />
            <span className="header-title">{t('foundItems') || 'Identified Items'}</span>
          </div>
          <span className="items-count-badge">
            {visibleItems.length} {isKm ? 'មុខទំនិញ' : 'items'}
          </span>
        </div>

        <div className="review-table-wrap">
          <div className="review-table-head">
            <span className="col-product">{t('product') || 'Product'}</span>
            <span className="col-qty">{t('qty') || 'Qty'}</span>
            <span className="col-price">{t('unitPrice') || 'Unit Price'}</span>
            <span className="col-total">{t('total') || 'Total'}</span>
          </div>

          <div className="review-table-body">
            {visibleItems.length === 0 ? (
              <div className="empty-review-text">
                {isKm ? 'មិនមានទំនិញសម្រាប់ពិនិត្យទេ។' : 'No items found to review.'}
              </div>
            ) : (
              visibleItems.map((item) => {
                const unitPrice = getUnitPrice(item);
                const currency = getCurrency(item);
                const total = Number(item.quantity || 0) * unitPrice;

                return (
                  <div
                    className="review-table-row clickable"
                    key={item.id}
                    onClick={() => onEdit && onEdit(item)}
                  >
                    <span className="col-product row-product-name">
                      {item.product || item.description || (isKm ? 'ទំនិញទូទៅ' : 'Item')}
                    </span>
                    <span className="col-qty">{item.quantity}</span>
                    <span className="col-price">{formatCurrencyValue(unitPrice, currency)}</span>
                    <strong className="col-total">{formatCurrencyValue(total, currency)}</strong>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Totals Summary Card */}
      <section className="review-totals-card">
        <div className="totals-row-item">
          <span className="totals-label">{t('totalItems') || 'Total Items'}</span>
          <span className="totals-value">{visibleItems.length}</span>
        </div>
        <div className="totals-row-item">
          <span className="totals-label">{t('totalUsdLabel') || 'Total (USD)'}</span>
          <strong className="totals-value usd-text">${totals.totalUSD.toFixed(2)}</strong>
        </div>
        <div className="totals-row-item">
          <span className="totals-label">{t('totalKhrLabel') || 'Total (KHR)'}</span>
          <strong className="totals-value khr-text">{Math.round(totals.totalKHR).toLocaleString()} KHR</strong>
        </div>
      </section>

      {error && <p className="review-error-message">{error}</p>}

      {/* Action Buttons */}
      <section className="review-screen-actions">
        <button
          className="review-edit-btn"
          type="button"
          onClick={() => onEdit && onEdit(visibleItems[0])}
          disabled={!visibleItems.length || isSaving}
        >
          <Pencil size={16} />
          <span>{t('editItems') || 'Edit Items'}</span>
        </button>

        <button
          className="review-confirm-btn"
          type="button"
          onClick={onConfirm}
          disabled={!visibleItems.length || isSaving}
        >
          <Check size={18} />
          <span>{isSaving ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (t('confirmSaveSale') || 'Confirm & Save Sale')}</span>
        </button>
      </section>
    </div>
  );
}