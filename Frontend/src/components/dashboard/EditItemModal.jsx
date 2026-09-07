import { Edit, Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrencyValue, setPreferredCurrency } from '../../utils/currency';

const normalizeNumberInput = (value) => {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '');
  const [wholeRaw, ...rest] = cleaned.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || (cleaned.startsWith('0') ? '0' : '');
  return rest.length ? `${whole || '0'}.${rest.join('')}` : whole;
};

export default function EditItemModal({ item, onClose, onDelete, onSave }) {
  const { t } = useLanguage();
  const [productName, setProductName] = useState(item?.product || '');
  const [quantity, setQuantity] = useState(String(item?.quantity || 1));
  const [currency, setCurrency] = useState(item?.currency || (item?.unitPriceKHR ? 'KHR' : 'USD'));
  const [unitPrice, setUnitPrice] = useState(String(item?.unit_price ?? item?.unitPriceKHR ?? item?.unitPriceUSD ?? 0));

  useEffect(() => {
    setProductName(item?.product || item?.description || '');
    setQuantity(String(item?.quantity || 1));
    setCurrency(item?.currency || (item?.unitPriceKHR ? 'KHR' : 'USD'));
    setUnitPrice(String(item?.unit_price ?? item?.unitPriceKHR ?? item?.unitPriceUSD ?? 0));
  }, [item]);

  const errors = useMemo(() => {
    const quantityValue = Number(quantity);
    const priceValue = Number(unitPrice);
    return {
      productName: productName.trim() ? '' : t('fieldRequired'),
      quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? '' : t('quantityGreaterZero'),
      unitPrice: unitPrice !== '' && Number.isFinite(priceValue) && priceValue >= 0 ? '' : t('validPriceRequired'),
    };
  }, [productName, quantity, t, unitPrice]);

  if (!item) return null;

  const quantityValue = Number(quantity) || 0;
  const priceValue = Number(unitPrice) || 0;
  const lineTotal = quantityValue * priceValue;
  const isValid = !errors.productName && !errors.quantity && !errors.unitPrice;

  const chooseCurrency = (nextCurrency) => {
    setCurrency(nextCurrency);
    setPreferredCurrency(nextCurrency);
  };

  const handleSave = () => {
    if (!isValid) return;
    setPreferredCurrency(currency);
    onSave({
      ...item,
      product: productName.trim(),
      description: productName.trim(),
      quantity: Number(quantity),
      currency,
      unit_price: Number(unitPrice),
      price_basis: 'unit',
    });
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label={t('editItems')}>
      <div className="edit-item-panel">
        <div className="modal-title-row">
          <h2>{t('editItems')}</h2>
          <button className="plain-icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <label className="dash-field">
          <span>{t('product')}</span>
          <div className="input-action-wrap">
            <input value={productName} onChange={(event) => setProductName(event.target.value)} />
            <button type="button"><Edit size={14} /> {t('edit')}</button>
          </div>
          {errors.productName && <small className="field-error">{errors.productName}</small>}
        </label>
        <div className="form-grid-two">
          <label className="dash-field">
            <span>{t('qty')}</span>
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity(String(Math.max(1, Number(quantity || 1) - 1)))} aria-label="Decrease quantity"><Minus size={15} /></button>
              <input inputMode="decimal" value={quantity} onChange={(event) => setQuantity(normalizeNumberInput(event.target.value))} aria-label={t('qty')} />
              <button type="button" onClick={() => setQuantity(String(Number(quantity || 0) + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            {errors.quantity && <small className="field-error">{errors.quantity}</small>}
          </label>
          <label className="dash-field">
            <span>{t('currency')}</span>
            <div className="currency-toggle" aria-label={t('currency')}>
              <button className={currency === 'KHR' ? 'active' : ''} type="button" onClick={() => chooseCurrency('KHR')}>KHR</button>
              <button className={currency === 'USD' ? 'active' : ''} type="button" onClick={() => chooseCurrency('USD')}>USD</button>
            </div>
          </label>
        </div>
        <label className="dash-field">
          <span>{t('unitPrice')}</span>
          <div className="currency-input-wrap">
            <input inputMode="decimal" value={unitPrice} onChange={(event) => setUnitPrice(normalizeNumberInput(event.target.value))} />
            <b>{currency}</b>
          </div>
          {errors.unitPrice && <small className="field-error">{errors.unitPrice}</small>}
        </label>
        <section className="price-calculation-card">
          <small>{t('total')} <span>({t('autoCalculated')})</span></small>
          <strong>{formatCurrencyValue(lineTotal, currency)}</strong>
        </section>
        <section className="screen-actions two-col">
          <button className="danger-action" type="button" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
            {t('delete')}
          </button>
          <button className="primary-action" type="button" onClick={handleSave} disabled={!isValid}>{t('saveChanges')}</button>
        </section>
      </div>
    </div>
  );
}