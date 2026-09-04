import { ShoppingBag } from 'lucide-react';

export default function ProductSummaryCard({ totalItems, totalQuantity }) {
  return (
    <section className="product-summary-card">
      <div className="summary-icon">
        <ShoppingBag size={24} />
      </div>
      <div className="summary-metric">
        <span>Total Items</span>
        <strong>{totalItems}</strong>
        <small>types of products</small>
      </div>
      <div className="summary-divider" />
      <div className="summary-metric">
        <span>Total Quantity</span>
        <strong>{totalQuantity}</strong>
        <small>items</small>
      </div>
    </section>
  );
}
