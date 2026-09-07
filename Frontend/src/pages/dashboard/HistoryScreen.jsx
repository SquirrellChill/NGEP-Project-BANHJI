import { Eye, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePickerModal from '../../components/dashboard/DatePickerModal';
import HistoryFilters from '../../components/dashboard/HistoryFilters';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ProductSummaryCard from '../../components/dashboard/ProductSummaryCard';
import ProductSummaryTable from '../../components/dashboard/ProductSummaryTable';
import RevenueCard from '../../components/dashboard/RevenueCard';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import { useLanguage } from '../../context/LanguageContext';
import { getSales, getSummary } from '../../services/transactionService';
import { APPLICATION_EXCHANGE_RATE, formatCurrencyTotals } from '../../utils/currency';
import { aggregateProductSummary, dateRangeForFilter, formatDisplayDate, formatLocalDate, normalizeSaleFromApi, summarizeSaleTitle } from '../../utils/sales';
import '../DashboardPage.css';

const emptySummary = {
  label: 'REVENUE',
  filteredLabel: 'FILTERED REVENUE',
  date: '',
  amountKHR: 0,
  amountUSD: 0,
  totalOrders: 0,
};

const periodForFilter = (filter) => {
  if (filter === 'week') return 'weekly';
  if (filter === 'month') return 'monthly';
  return 'daily';
};

const totalForCurrency = (summary, currency) =>
  Number((summary?.totals || []).find((entry) => entry.currency === currency)?.total || 0);

export default function HistoryScreen() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [summary, setSummary] = useState(emptySummary);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');


  const range = useMemo(() => dateRangeForFilter(activeFilter, selectedDate), [activeFilter, selectedDate]);
  const productSummary = useMemo(() => aggregateProductSummary(sales), [sales]);
  const totalQuantity = productSummary.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = new Set(productSummary.map((item) => item.product)).size;

  useEffect(() => {
    let alive = true;
    const anchor = formatLocalDate(selectedDate);

    Promise.all([
      getSummary({ period: periodForFilter(activeFilter), anchor }),
      getSales({ startDate: range.startDate, endDate: range.endDate, limit: 200 }),
    ])
      .then(([summaryResponse, salesResponse]) => {
        if (!alive) return;
        const summaryData = summaryResponse.data;
        setSummary({
          ...emptySummary,
          label: t('filteredRevenue'),
          filteredLabel: t('filteredRevenue'),
          date: range.startDate,
          endDate: range.endDate,
          amountKHR: totalForCurrency(summaryData, 'KHR'),
          amountUSD: totalForCurrency(summaryData, 'USD'),
          exchangeRate: APPLICATION_EXCHANGE_RATE,
          combinedTotals: true,
          totalOrders: summaryData.sales_count,
        });
        setSales(salesResponse.data.map(normalizeSaleFromApi));
        setError('');
      })
      .catch(() => {
        if (alive) setError(t('unableHistory'));
      });

    return () => {
      alive = false;
    };
  }, [activeFilter, range.endDate, range.startDate, selectedDate, t]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handlePickDate = (date) => {
    setSelectedDate(date);
    setActiveFilter('date');
    setShowDatePicker(false);
  };

  return (
    <MobileAppShell activeTab="history">
      <ScreenHeader title={t('history')} onBack={() => navigate('/dashboard')} />
      {error && <p className="review-error-message">{error}</p>}
      <RevenueCard summary={summary} variant="history" />
      <HistoryFilters activeFilter={activeFilter} onChange={handleFilterChange} onPickDate={() => setShowDatePicker(true)} />
      <div className="icon-section-title">
        <Tag size={20} fill="currentColor" />
        <h2>{t('productSummary')}</h2>
      </div>
      <ProductSummaryCard totalItems={totalItems} totalQuantity={totalQuantity} />
      <ProductSummaryTable items={productSummary} />
      <section className="invoice-list">
        <div className="section-title-row">
          <h3 className="section-heading">{t('transactions')}</h3>
          <span className="invoice-date">{sales.length} {t('items')}</span>
        </div>
        {!sales.length && <p className="empty-state-copy">{t('noTransactions')}</p>}
        {sales.map((sale) => (
          <HistorySaleCard
            key={sale.saleId}
            sale={sale}
            language={language}
            exchangeRate={APPLICATION_EXCHANGE_RATE}
            onView={() => navigate('/dashboard/transactions', { state: { saleId: sale.saleId } })}
          />
        ))}
      </section>
      {showDatePicker && <DatePickerModal selectedDate={selectedDate} onSelect={handlePickDate} onClose={() => setShowDatePicker(false)} />}
    </MobileAppShell>
  );
}

function HistorySaleCard({ sale, language, exchangeRate, onView }) {
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