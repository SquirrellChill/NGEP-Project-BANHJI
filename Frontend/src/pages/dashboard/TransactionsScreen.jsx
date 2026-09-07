import { useEffect, useMemo, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditItemModal from '../../components/dashboard/EditItemModal';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ReviewSalePanel from '../../components/dashboard/ReviewSalePanel';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import TransactionSavedView from '../../components/dashboard/TransactionSavedView';
import { useLanguage } from '../../context/LanguageContext';
import { createSale, deleteSale, getSale, getSales, updateSale } from '../../services/transactionService';
import { APPLICATION_EXCHANGE_RATE, formatCurrencyTotals, formatCurrencyValue } from '../../utils/currency';
import {
  firstDefined,
  formatDisplayDate,
  normalizeReviewItem,
  normalizeSaleFromApi,
  resolveCurrency,
  resolveSaleDate,
  resolveUnitPrice,
  saleToPayload,
  summarizeSaleTitle,
} from '../../utils/sales';
import '../DashboardPage.css';

const resolveDraft = (state) => state?.saleDraft || state?.record || state?.sale || null;
const resolveDraftItems = (draft) => (Array.isArray(draft?.items) ? draft.items : []).map(normalizeReviewItem);

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((entry) => entry?.msg || entry?.message).filter(Boolean).join(' ');
  return error?.message || 'Unable to complete request. Please try again.';
};

const hasMissingDetails = (items) =>
  items.some((item) => {
    const description = String(firstDefined(item.description, item.product, item.item, '')).trim();
    const quantity = Number(item.quantity || 0);
    const unitPrice = resolveUnitPrice(item);
    return !description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0;
  });

export default function TransactionsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const draft = useMemo(() => resolveDraft(location.state), [location.state]);
  const [editingItem, setEditingItem] = useState(null);
  const [saleItems, setSaleItems] = useState(() => resolveDraftItems(draft));
  const [deletedIds, setDeletedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedSaleId, setSavedSaleId] = useState(null);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [editingSavedSale, setEditingSavedSale] = useState(false);
  const [exchangeRate] = useState(APPLICATION_EXCHANGE_RATE);

  const isReviewMode = Boolean(draft) || editingSavedSale;
  const activeItems = saleItems.filter((item) => !deletedIds.includes(item.id));

  const refreshSales = async () => {
    setLoadingSales(true);
    setError('');
    try {
      const salesResponse = await getSales({ limit: 100 });
      setSales(salesResponse.data.map(normalizeSaleFromApi));
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setLoadingSales(false);
    }
  };

  const handleSelectSale = async (saleId) => {
    if (!saleId) return;
    setLoadingSales(true);
    setError('');
    try {
      const response = await getSale(saleId);
      setSelectedSale(normalizeSaleFromApi(response.data));
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    if (!isReviewMode) refreshSales();
  }, [isReviewMode]);

  useEffect(() => {
    if (location.state?.saleId && !isReviewMode) handleSelectSale(location.state.saleId);
  }, [location.state?.saleId, isReviewMode]);

  const handleDeleteItem = (id) => {
    setDeletedIds((current) => (current.includes(id) ? current : [...current, id]));
    setEditingItem(null);
  };

  const handleSaveItem = (updatedItem) => {
    setSaleItems((current) => current.map((item) => (item.id === updatedItem.id ? normalizeReviewItem(updatedItem, 0) : item)));
    setEditingItem(null);
    setError('');
  };

  const handleConfirm = async () => {
    if (saving) return;
    const payload = saleToPayload(selectedSale?.date || draft?.sale_date || draft?.date, activeItems);
    if (!payload.items.length) {
      setError(t('addOneItem'));
      return;
    }
    if (hasMissingDetails(activeItems)) {
      setError(t('missingSaleDetails'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingSavedSale && selectedSale) {
        const response = await updateSale(selectedSale.saleId, payload);
        setSelectedSale(normalizeSaleFromApi(response.data));
        setEditingSavedSale(false);
        await refreshSales();
      } else {
        const response = await createSale(payload);
        setSavedSaleId(response.data?.sale_id || response.data?.saleId || null);
        setSaved(true);
      }
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSale = () => {
    if (!selectedSale) return;
    setSaleItems(selectedSale.items.map(normalizeReviewItem));
    setDeletedIds([]);
    setEditingSavedSale(true);
  };

  const handleDeleteSale = async () => {
    if (!selectedSale || saving) return;
    setSaving(true);
    setError('');
    try {
      await deleteSale(selectedSale.saleId);
      setSelectedSale(null);
      await refreshSales();
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <MobileAppShell activeTab="transactions" showBottomNav={false}>
        <TransactionSavedView
          savedSaleId={savedSaleId}
          onNewSale={() => navigate('/dashboard/voice', { state: { entryMode: 'manual' } })}
        />
      </MobileAppShell>
    );
  }

  if (isReviewMode) {
    return (
      <MobileAppShell activeTab="transactions">
        <ScreenHeader title={editingSavedSale ? t('editTransaction') : t('reviewConfirmSale')} onBack={() => {
          if (editingSavedSale) {
            setEditingSavedSale(false);
            setSaleItems([]);
            setDeletedIds([]);
          } else {
            navigate('/dashboard');
          }
        }} />
        <ReviewSalePanel
          items={saleItems}
          deletedIds={deletedIds}
          error={error || (!saleItems.length ? t('noReviewItems') : '')}
          isSaving={saving}
          exchangeRate={exchangeRate}
          onEdit={setEditingItem}
          onConfirm={handleConfirm}
        />
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onDelete={handleDeleteItem} onSave={handleSaveItem} />
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell activeTab="transactions">
      <ScreenHeader title={selectedSale ? t('transactionDetails') : t('transactions')} onBack={() => {
        if (selectedSale) setSelectedSale(null);
        else navigate('/dashboard');
      }} />
      {error && <p className="review-error-message">{error}</p>}
      {selectedSale ? (
        <TransactionDetail sale={selectedSale} exchangeRate={exchangeRate} isBusy={saving} onEdit={handleEditSale} onDelete={handleDeleteSale} />
      ) : (
        <section className="invoice-list">
          {loadingSales && <p className="empty-state-copy">{t('loadingTransactions')}</p>}
          {!loadingSales && !sales.length && <p className="empty-state-copy">{t('noTransactions')}</p>}
          {sales.map((sale) => (
            <SaleSummaryCard key={sale.saleId} sale={sale} language={language} exchangeRate={exchangeRate} onView={() => handleSelectSale(sale.saleId)} />
          ))}
        </section>
      )}
    </MobileAppShell>
  );
}

function SaleSummaryCard({ sale, language, exchangeRate, onView }) {
  const { t } = useLanguage();
  const totals = formatCurrencyTotals({ khr: sale.totalKHR, usd: sale.totalUSD, exchangeRate });

  return (
    <article className="invoice-summary-card">
      <div className="invoice-summary-main">
        <span className="invoice-date">{formatDisplayDate(sale.date, language)}</span>
        <h3>{summarizeSaleTitle(sale)}</h3>
        <p>{sale.items.length} {t('items')}</p>
      </div>
      <div className="invoice-summary-amounts">
        <span>{t('totalUsdLabel')}: {totals.usdLabel}</span>
        <span>{t('totalKhrLabel')}: {totals.khrLabel}</span>
        <button className="outline-action" type="button" onClick={onView}><Eye size={15} />{t('viewDetails')}</button>
      </div>
    </article>
  );
}

function TransactionDetail({ sale, exchangeRate, isBusy, onEdit, onDelete }) {
  const { language, t } = useLanguage();
  const totals = formatCurrencyTotals({ khr: sale.totalKHR, usd: sale.totalUSD, exchangeRate });

  return (
    <section className="invoice-detail-card">
      <div className="invoice-detail-header">
        <div>
          <span className="invoice-date">{formatDisplayDate(resolveSaleDate(sale.date), language)}</span>
          <h2>{summarizeSaleTitle(sale)}</h2>
          <p>{sale.items.length} {t('items')}</p>
        </div>
        <div className="invoice-summary-amounts">
          <span>{t('totalUsdLabel')}: {totals.usdLabel}</span>
          <span>{t('totalKhrLabel')}: {totals.khrLabel}</span>
        </div>
      </div>
      <section className="review-items-card">
        <div className="review-grid review-head">
          <span>{t('product')}</span>
          <span>{t('qty')}</span>
          <span>{t('unitPrice')}</span>
          <span>{t('total')}</span>
        </div>
        {sale.items.map((item) => {
          const unitPrice = resolveUnitPrice(item);
          const currency = resolveCurrency(item);
          const total = Number(firstDefined(item.amount, Number(item.quantity || 0) * unitPrice, 0));
          return (
            <div className="review-grid review-row static-row" key={item.id}>
              <span>{item.product}</span>
              <span>{item.quantity}</span>
              <span>{formatCurrencyValue(unitPrice, currency)}</span>
              <span>{formatCurrencyValue(total, currency)}</span>
            </div>
          );
        })}
      </section>

      <section className="screen-actions two-col">
        <button className="outline-action" type="button" onClick={onEdit} disabled={isBusy}>{t('edit')}</button>
        <button className="danger-action" type="button" onClick={onDelete} disabled={isBusy}>
          <Trash2 size={16} />
          {t('delete')}
        </button>
      </section>
    </section>
  );
}