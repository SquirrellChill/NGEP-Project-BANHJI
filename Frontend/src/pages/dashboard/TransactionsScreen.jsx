import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EditItemModal from '../../components/dashboard/EditItemModal';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ReviewSalePanel from '../../components/dashboard/ReviewSalePanel';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import TransactionSavedView from '../../components/dashboard/TransactionSavedView';
import { useLanguage } from '../../context/LanguageContext';
import { createSale, deleteSale, getSale, getSales, updateSale } from '../../services/transactionService';
import { formatKHR, formatUSD } from '../../utils/currency';
import {
  firstDefined,
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

const resolveDraftItems = (draft) => {
  const items = Array.isArray(draft?.items) ? draft.items : [];
  return items.map(normalizeReviewItem);
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((entry) => entry?.msg || entry?.message).filter(Boolean).join(' ');
  }
  return error?.message || 'Unable to complete request. Please try again.';
};

const formatSaleTotal = (sale) => {
  const parts = [];
  if (Number(sale.totalKHR || 0) > 0) parts.push(formatKHR(sale.totalKHR));
  if (Number(sale.totalUSD || 0) > 0) parts.push(formatUSD(sale.totalUSD));
  return parts.join(' / ') || formatKHR(0);
};

export default function TransactionsScreen() {
  const location = useLocation();
  const { t } = useLanguage();
  const draft = useMemo(() => resolveDraft(location.state), [location.state]);
  const [editingItem, setEditingItem] = useState(null);
  const [saleItems, setSaleItems] = useState(() => resolveDraftItems(draft));
  const [deletedIds, setDeletedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [editingSavedSale, setEditingSavedSale] = useState(false);

  const isReviewMode = Boolean(draft) || editingSavedSale;

  const refreshSales = async () => {
    setLoadingSales(true);
    setError('');
    try {
      const response = await getSales({ limit: 100 });
      setSales(response.data.map(normalizeSaleFromApi));
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    if (!isReviewMode) {
      refreshSales();
    }
  }, [isReviewMode]);

  const handleDeleteItem = (id) => {
    setDeletedIds((current) => (current.includes(id) ? current : [...current, id]));
    setEditingItem(null);
  };

  const handleSaveItem = (updatedItem) => {
    setSaleItems((current) =>
      current.map((item) => (item.id === updatedItem.id ? normalizeReviewItem(updatedItem, 0) : item))
    );
    setEditingItem(null);
    setError('');
  };

  const activeItems = saleItems.filter((item) => !deletedIds.includes(item.id));

  const buildSalePayload = () => saleToPayload(selectedSale?.date || draft?.sale_date || draft?.date, activeItems);

  const handleConfirm = async () => {
    const payload = buildSalePayload();
    if (!payload.items.length) {
      setError(t('addOneItem'));
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
        await createSale(payload);
        setSaved(true);
      }
    } catch (err) {
      setError(getErrorMessage(err) || t('unableRequest'));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSale = async (saleId) => {
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

  const handleEditSale = () => {
    if (!selectedSale) return;
    setSaleItems(selectedSale.items.map(normalizeReviewItem));
    setDeletedIds([]);
    setEditingSavedSale(true);
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;
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
          onNewSale={() => {
            setSaved(false);
            setDeletedIds([]);
          }}
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
            window.history.back();
          }
        }} />
        <ReviewSalePanel
          items={saleItems}
          deletedIds={deletedIds}
          error={error || (!saleItems.length ? t('noReviewItems') : '')}
          isSaving={saving}
          onEdit={setEditingItem}
          onConfirm={handleConfirm}
        />
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onDelete={handleDeleteItem}
          onSave={handleSaveItem}
        />
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell activeTab="transactions">
      <ScreenHeader title={selectedSale ? t('transactionDetails') : t('transactions')} onBack={() => {
        if (selectedSale) {
          setSelectedSale(null);
        } else {
          window.history.back();
        }
      }} />
      {error && <p className="review-error-message">{error}</p>}
      {selectedSale ? (
        <TransactionDetail
          sale={selectedSale}
          isBusy={saving}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />
      ) : (
        <section className="transaction-list-card">
          {loadingSales && <p className="empty-state-copy">{t('loadingTransactions')}</p>}
          {!loadingSales && !sales.length && <p className="empty-state-copy">{t('noTransactions')}</p>}
          {sales.map((sale) => (
            <button className="transaction-row-button" key={sale.saleId} type="button" onClick={() => handleSelectSale(sale.saleId)}>
              <span>
                <strong>{summarizeSaleTitle(sale)}</strong>
                <small>{sale.date} · {t('transactions')}</small>
              </span>
              <span className="transaction-amount">{formatSaleTotal(sale)}</span>
            </button>
          ))}
        </section>
      )}
    </MobileAppShell>
  );
}

function TransactionDetail({ sale, isBusy, onEdit, onDelete }) {
  const { t } = useLanguage();
  return (
    <>
      <section className="sale-total-section">
        <div><strong>{t('date')}</strong><span>{resolveSaleDate(sale.date)}</span></div>
        <div><strong>{t('totalKHR')}</strong><span>{formatKHR(sale.totalKHR)}</span></div>
        <div><strong>{t('totalUSD')}</strong><span>{formatUSD(sale.totalUSD)}</span></div>
      </section>
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
              <span>{currency === 'KHR' ? formatKHR(unitPrice) : formatUSD(unitPrice)}</span>
              <span>{currency === 'KHR' ? formatKHR(total) : formatUSD(total)}</span>
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
    </>
  );
}
