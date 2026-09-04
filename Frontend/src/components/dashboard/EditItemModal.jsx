import { Edit, Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatKHR, formatUSD, usdToKhr } from '../../utils/currency';

export default function EditItemModal({ item, onClose, onDelete }) {
  const [productName, setProductName] = useState(item?.product || '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [currency, setCurrency] = useState(item?.unitPriceKHR ? 'KHR' : 'USD');
  const [unitPrice, setUnitPrice] = useState(item?.unitPriceKHR || item?.unitPriceUSD || 1);
  const exchangeRate = 4104;

  useEffect(() => {
    setProductName(item?.product || '');
    setQuantity(item?.quantity || 1);
    setCurrency(item?.unitPriceKHR ? 'KHR' : 'USD');
    setUnitPrice(item?.unitPriceKHR || item?.unitPriceUSD || 1);
  }, [item]);

  if (!item) return null;

  const totalKHR = currency === 'KHR' ? quantity * unitPrice : usdToKhr(quantity * unitPrice, exchangeRate);
  const totalUSD = currency === 'USD' ? quantity * unitPrice : totalKHR / exchangeRate;

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Edit item">
      <div className="edit-item-panel">
        <div className="modal-title-row">
          <h2>Edit Items</h2>
          <button className="plain-icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <label className="dash-field">
          <span>Product Name</span>
          <div className="input-action-wrap">
            <input value={productName} onChange={(event) => setProductName(event.target.value)} />
            <button type="button"><Edit size={14} /> Edit</button>
          </div>
        </label>
        <div className="form-grid-two">
          <label className="dash-field">
            <span>Quantity</span>
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
          </label>
          <label className="dash-field">
            <span>Currency</span>
            <div className="currency-toggle">
              <button className={currency === 'KHR' ? 'active' : ''} type="button" onClick={() => setCurrency('KHR')}>៛ KHR</button>
              <button className={currency === 'USD' ? 'active' : ''} type="button" onClick={() => setCurrency('USD')}>$ USD</button>
            </div>
          </label>
        </div>
        <label className="dash-field">
          <span>Unit Price</span>
          <div className="currency-input-wrap">
            <input type="number" min="0" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} />
            <b>{currency}</b>
          </div>
        </label>
        <section className="price-calculation-card">
          <small>TOTAL PRICE <span>(Auto Calculated)</span></small>
          <strong>{formatKHR(totalKHR)}</strong>
          <span>{formatUSD(totalUSD)}</span>
          <em>Exchange rate: 1 USD = {exchangeRate.toLocaleString('en-US')} KHR</em>
        </section>
        <section className="screen-actions two-col">
          <button className="danger-action" type="button" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
            Delete
          </button>
          <button className="primary-action" type="button" onClick={onClose}>Save Item</button>
        </section>
      </div>
    </div>
  );
}
