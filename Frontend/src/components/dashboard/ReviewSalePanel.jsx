import { Check, Pencil, RotateCcw } from 'lucide-react';
import { formatUSD } from '../../utils/currency';

export default function ReviewSalePanel({ items, onEdit, onConfirm, deletedId }) {
  const visibleItems = items.filter((item) => item.id !== deletedId);
  const totalAmount = visibleItems.reduce((sum, item) => sum + item.totalUSD, 0);

  return (
    <div className="review-sale-panel">
      <section className="success-banner">
        <span className="success-icon"><Check size={18} /></span>
        <span className="success-copy">
          <strong>AI Extraction Complete!</strong>
          <small>We've captured the details. Please review quantities and prices before saving.</small>
        </span>
        <button type="button">
          <RotateCcw size={13} />
          Re-record
        </button>
      </section>

      <p className="review-intro">We found the following items:</p>
      <section className="review-items-card">
        <div className="review-grid review-head">
          <span>Product</span>
          <span>Qty</span>
          <span>Unit Price</span>
          <span>Total</span>
        </div>
        {visibleItems.map((item) => (
          <button className="review-grid review-row" type="button" key={item.id} onClick={() => onEdit(item)}>
            <span>{item.product}</span>
            <span>{item.quantity}</span>
            <span>{formatUSD(item.unitPriceUSD)}</span>
            <span>{formatUSD(item.totalUSD)}</span>
          </button>
        ))}
      </section>
      <section className="sale-total-section">
        <div><strong>Total Items:</strong><span>{visibleItems.length}</span></div>
        <div><strong>Total amount:</strong><span>{formatUSD(totalAmount)}</span></div>
      </section>
      <section className="screen-actions two-col">
        <button className="outline-action" type="button" onClick={() => onEdit(visibleItems[0])}>
          <Pencil size={16} fill="currentColor" />
          Edit Items
        </button>
        <button className="primary-action" type="button" onClick={onConfirm}>Confirm & Save Sale</button>
      </section>
    </div>
  );
}
