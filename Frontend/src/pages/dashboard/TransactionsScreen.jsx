import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Trash2, ArrowLeft, Search, Calendar, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditItemModal from '../../components/dashboard/EditItemModal';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ReviewSalePanel from '../../components/dashboard/ReviewSalePanel';
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
import './TransactionsScreen.css';

const resolveDraft = (state) => state?.saleDraft || state?.record || state?.sale || null;
const resolveDraftItems = (draft) => (Array.isArray(draft?.items) ? draft.items : []).map(normalizeReviewItem);

export default function TransactionsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isKm = language !== 'en';

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
  const [exchangeRate] = useState(APPLICATION_EXCHANGE_RATE || 4050);

  // Runtime Period Filtering: 'today' | 'week' | 'month' | 'all'
  const [timeFilter, setTimeFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  const isReviewMode = Boolean(draft) || editingSavedSale;
  const activeItems = saleItems.filter((item) => !deletedIds.includes(item.id));

  const refreshSales = async () => {
    setLoadingSales(true);
    setError('');
    try {
      const salesResponse = await getSales({ limit: 100 });
      setSales(salesResponse.data.map(normalizeSaleFromApi));
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem('kotchomnol_sales') || '[]');
        setSales(cached.map(normalizeSaleFromApi));
      } catch {
        setError(isKm ? 'មិនអាចទាញទិន្នន័យបានទេ។' : 'Unable to load sales records.');
      }
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
      const found = sales.find((s) => s.saleId === saleId);
      if (found) setSelectedSale(found);
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

  // Dynamic filter by period & search query
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date || sale.createdAt || Date.now());

      // Period matching
      if (timeFilter === 'today' && saleDate < startOfToday) return false;
      if (timeFilter === 'week' && saleDate < startOfWeek) return false;
      if (timeFilter === 'month' && saleDate < startOfMonth) return false;

      // Text search matching
      if (searchQuery.trim()) {
        const title = summarizeSaleTitle(sale).toLowerCase();
        const matchesQuery =
          title.includes(searchQuery.toLowerCase()) ||
          sale.items?.some((it) =>
            (it.product || it.description || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [sales, timeFilter, searchQuery]);

  // Aggregate totals for the active filtered period
  const { totalUSD, totalKHR } = useMemo(() => {
    let usd = 0;
    let khr = 0;
    filteredSales.forEach((s) => {
      usd += Number(s.totalUSD || 0);
      khr += Number(s.totalKHR || (s.totalUSD ? s.totalUSD * exchangeRate : 0));
    });
    return { totalUSD: usd, totalKHR: Math.round(khr) };
  }, [filteredSales, exchangeRate]);

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

  const handleConfirm = async () => {
    if (saving) return;
    const payload = saleToPayload(selectedSale?.date || draft?.sale_date || draft?.date, activeItems);
    if (!payload.items.length) {
      setError(isKm ? 'សូមបន្ថែមទំនិញយ៉ាងហោចមួយ។' : 'Please add at least one item.');
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
      setError(isKm ? 'មិនអាចរក្សាទុកបានទេ។' : 'Unable to complete request.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!selectedSale || saving) return;
    setSaving(true);
    setError('');
    try {
      await deleteSale(selectedSale.saleId);
      setSelectedSale(null);
      await refreshSales();
    } catch {
      setError(isKm ? 'មិនអាចលុបបានទេ។' : 'Failed to delete sale.');
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
        <div className="tx-screen-top-bar">
          <button
            type="button"
            className="tx-back-btn"
            onClick={() => {
              if (editingSavedSale) setEditingSavedSale(false);
              else navigate('/dashboard');
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="tx-page-title">
            {editingSavedSale
              ? isKm
                ? 'កែប្រែកំណត់ត្រា'
                : 'Edit Sale Record'
              : isKm
              ? 'ពិនិត្យ និងបញ្ជាក់'
              : 'Review & Confirm'}
          </h2>
        </div>

        <ReviewSalePanel
          items={saleItems}
          deletedIds={deletedIds}
          error={error}
          isSaving={saving}
          exchangeRate={exchangeRate}
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
      {/* Header Bar */}
      <div className="tx-screen-top-bar">
        {selectedSale && (
          <button
            type="button"
            className="tx-back-btn"
            onClick={() => setSelectedSale(null)}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="tx-page-title">
          {selectedSale
            ? isKm
              ? 'ព័ត៌មានលម្អិត'
              : 'Sale Details'
            : isKm
            ? 'កំណត់ត្រាការលក់'
            : 'Sales Records'}
        </h2>
      </div>

      {selectedSale ? (
        <TransactionDetail
          sale={selectedSale}
          exchangeRate={exchangeRate}
          isBusy={saving}
          isKm={isKm}
          onEdit={() => {
            setSaleItems(selectedSale.items.map(normalizeReviewItem));
            setDeletedIds([]);
            setEditingSavedSale(true);
          }}
          onDelete={handleDeleteSale}
        />
      ) : (
        <div className="sales-records-container">
          {/* Filtered Sales Summary */}
          <div className="records-summary-card">
            <div className="records-summary-header">
              <span>{isKm ? 'សរុបតាមការជ្រើសរើស' : 'Filtered Sales Total'}</span>
              <span className="records-count-pill">
                {filteredSales.length} {isKm ? 'ការលក់' : 'records'}
              </span>
            </div>
            <div className="records-amounts-row">
              <div>
                <span className="summary-currency-label">USD</span>
                <span className="summary-usd-value">${totalUSD.toFixed(2)}</span>
              </div>
              <div>
                <span className="summary-currency-label">KHR</span>
                <span className="summary-khr-value">{totalKHR.toLocaleString()} KHR</span>
              </div>
            </div>
          </div>

          {/* Time Filter Pills */}
          <div className="time-filter-row">
            <button
              type="button"
              className={`time-pill-btn ${timeFilter === 'today' ? 'active' : ''}`}
              onClick={() => setTimeFilter('today')}
            >
              {isKm ? 'ថ្ងៃនេះ' : 'Today'}
            </button>
            <button
              type="button"
              className={`time-pill-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
            >
              {isKm ? 'សប្តាហ៍នេះ' : 'This Week'}
            </button>
            <button
              type="button"
              className={`time-pill-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFilter('month')}
            >
              {isKm ? 'ខែនេះ' : 'This Month'}
            </button>
            <button
              type="button"
              className={`time-pill-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              {isKm ? 'ទាំងអស់' : 'All Time'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="records-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះទំនិញ...' : 'Search by item name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sales List */}
          <section className="records-list">
            {loadingSales && (
              <div className="records-loading">
                {isKm ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading sales records...'}
              </div>
            )}
            {!loadingSales && filteredSales.length === 0 && (
              <div className="records-empty">
                <FileText size={36} />
                <p>
                  {isKm
                    ? 'គ្មានកំណត់ត្រាលក់ក្នុងកំឡុងពេលនេះទេ។'
                    : 'No sales records found for this period.'}
                </p>
              </div>
            )}
            {filteredSales.map((sale) => {
              const saleUsd = Number(sale.totalUSD || 0);
              const saleKhr = Number(sale.totalKHR || saleUsd * exchangeRate);
              const formattedDate = formatDisplayDate(sale.date, language);

              return (
                <article
                  key={sale.saleId}
                  className="record-item-card"
                  onClick={() => handleSelectSale(sale.saleId)}
                >
                  <div className="record-card-left">
                    <span className="record-date-chip">{formattedDate}</span>
                    <h4 className="record-item-title">{summarizeSaleTitle(sale)}</h4>
                    <span className="record-item-count">
                      {sale.items.length} {isKm ? 'ទំនិញ' : 'items'}
                    </span>
                  </div>
                  <div className="record-card-right">
                    <div className="record-usd-price">${saleUsd.toFixed(2)}</div>
                    <div className="record-khr-price">
                      {Math.round(saleKhr).toLocaleString()} KHR
                    </div>
                    <button className="view-detail-link" type="button">
                      <Eye size={14} /> {isKm ? 'មើល' : 'View'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      )}
    </MobileAppShell>
  );
}

function TransactionDetail({ sale, exchangeRate, isBusy, isKm, onEdit, onDelete }) {
  const totals = formatCurrencyTotals({ khr: sale.totalKHR, usd: sale.totalUSD, exchangeRate });

  return (
    <section className="tx-detail-container">
      <div className="tx-detail-card">
        <span className="tx-detail-date">
          {sale.date ? new Date(sale.date).toLocaleDateString() : 'Today'}
        </span>
        <h3>{summarizeSaleTitle(sale)}</h3>
        <div className="tx-detail-totals">
          <div>
            <label>USD</label>
            <strong>{totals.usdLabel}</strong>
          </div>
          <div>
            <label>KHR</label>
            <strong>{totals.khrLabel}</strong>
          </div>
        </div>
      </div>

      <div className="tx-items-table-card">
        <h4 className="tx-items-title">{isKm ? 'បញ្ជីទំនិញ' : 'Items List'}</h4>
        <div className="tx-table-head">
          <span>{isKm ? 'ទំនិញ' : 'Item'}</span>
          <span>{isKm ? 'ចំនួន' : 'Qty'}</span>
          <span>{isKm ? 'តម្លៃរាយ' : 'Price'}</span>
          <span>{isKm ? 'សរុប' : 'Total'}</span>
        </div>
        {sale.items.map((item, idx) => {
          const unitPrice = resolveUnitPrice(item);
          const currency = resolveCurrency(item);
          const total = Number(firstDefined(item.amount, Number(item.quantity || 0) * unitPrice, 0));

          return (
            <div className="tx-table-row" key={item.id || idx}>
              <span className="item-name">{item.product || item.description}</span>
              <span>{item.quantity}</span>
              <span>{formatCurrencyValue(unitPrice, currency)}</span>
              <strong>{formatCurrencyValue(total, currency)}</strong>
            </div>
          );
        })}
      </div>

      <div className="tx-action-row">
        <button className="tx-btn-edit" type="button" onClick={onEdit} disabled={isBusy}>
          {isKm ? 'កែប្រែ' : 'Edit'}
        </button>
        <button className="tx-btn-delete" type="button" onClick={onDelete} disabled={isBusy}>
          <Trash2 size={16} /> {isKm ? 'លុប' : 'Delete'}
        </button>
      </div>
    </section>
  );
}