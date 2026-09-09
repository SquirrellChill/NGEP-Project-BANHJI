import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  PieChart, 
  Package, 
  Calendar, 
  ShoppingCart, 
  Eye 
} from 'lucide-react';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { buildDashboardProfile } from '../../utils/profile';
import { APPLICATION_EXCHANGE_RATE } from '../../utils/currency';
import { summarizeSaleTitle } from '../../utils/sales';
import './HistoryScreen.css';

const EXCHANGE_RATE = APPLICATION_EXCHANGE_RATE || 4050;

function getStoredSales() {
  try {
    const raw = localStorage.getItem('kotchomnol_sales') || localStorage.getItem('sales') || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse sales:', err);
    return [];
  }
}

export default function HistoryScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isKm = language !== 'en';

  const profile = buildDashboardProfile(user, { firstName: 'Seller', name: 'Seller' });
  const firstName = profile.firstName || profile.name?.split(' ')[0] || (isKm ? 'អ្នកលក់' : 'Seller');

  const [period, setPeriod] = useState('today'); // 'today' | 'week' | 'month'

  const today = new Date();
  const formattedToday = today.toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate live filtered analytics from stored sales
  const { filteredSales, totalUSD, totalKHR, salesCount, productBreakdown, weeklyBars } = useMemo(() => {
    const sales = getStoredSales();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = sales.filter((item) => {
      const d = new Date(item.date || item.createdAt || Date.now());
      if (period === 'today') return d >= startOfToday;
      if (period === 'week') return d >= startOfWeek;
      if (period === 'month') return d >= startOfMonth;
      return true;
    });

    let sumUSD = 0;
    let sumKHR = 0;
    const itemMap = {};

    filtered.forEach((sale) => {
      const usd = Number(sale.totalUSD || sale.totalAmount || sale.amount || 0);
      const khr = Number(sale.totalKHR || (usd ? usd * EXCHANGE_RATE : 0));
      sumUSD += usd;
      sumKHR += khr;

      if (Array.isArray(sale.items)) {
        sale.items.forEach((it) => {
          const name = it.product || it.description || (isKm ? 'ទំនិញទូទៅ' : 'General Item');
          const qty = Number(it.quantity || 1);
          const itTotal = Number(it.amount || (qty * (it.unitPrice || 0)) || 0);
          if (!itemMap[name]) itemMap[name] = { name, qty: 0, totalUSD: 0 };
          itemMap[name].qty += qty;
          itemMap[name].totalUSD += itTotal;
        });
      }
    });

    // 7-day weekly bar generation
    const days = [
      isKm ? 'ច័ន្ទ' : 'Mon',
      isKm ? 'អង្គារ' : 'Tue',
      isKm ? 'ពុធ' : 'Wed',
      isKm ? 'ព្រហ' : 'Thu',
      isKm ? 'សុក្រ' : 'Fri',
      isKm ? 'សៅរ៍' : 'Sat',
      isKm ? 'អាទិត្យ' : 'Sun'
    ];
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    sales.forEach((s) => {
      const d = new Date(s.date || s.createdAt || Date.now());
      const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
      weeklyData[dayIndex] += Number(s.totalUSD || s.totalAmount || 0);
    });

    const maxVal = Math.max(...weeklyData, 10);
    const bars = days.map((day, idx) => ({
      label: day,
      value: weeklyData[idx],
      percent: Math.min(100, Math.round((weeklyData[idx] / maxVal) * 100))
    }));

    const products = Object.values(itemMap).sort((a, b) => b.totalUSD - a.totalUSD);

    return {
      filteredSales: filtered,
      totalUSD: sumUSD,
      totalKHR: Math.round(sumKHR),
      salesCount: filtered.length,
      productBreakdown: products,
      weeklyBars: bars
    };
  }, [period, isKm]);

  return (
    <MobileAppShell activeTab="history">
      <div className="analytics-page-wrapper font-kantumruy">
        {/* Header Title */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">
              {isKm ? 'ផ្ទាំងគ្រប់គ្រង & ការវិភាគ' : 'Dashboard & Analytics'}
            </h1>
            <p className="analytics-sub">
              {isKm ? 'នេះជាសង្ខេបអាជីវកម្ម និងក្រាហ្វវិភាគទិន្នន័យរបស់អ្នក' : 'Here is your real-time business performance and sales analytics.'}
            </p>
          </div>
        </div>

        {/* Filter Period Pills */}
        <div className="analytics-filter-bar">
          <button 
            type="button" 
            className={`filter-pill ${period === 'today' ? 'active' : ''}`}
            onClick={() => setPeriod('today')}
          >
            {isKm ? 'ថ្ងៃនេះ' : 'Today'}
          </button>
          <button 
            type="button" 
            className={`filter-pill ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            {isKm ? 'សប្តាហ៍នេះ' : 'This Week'}
          </button>
          <button 
            type="button" 
            className={`filter-pill ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            {isKm ? 'ខែនេះ' : 'This Month'}
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="analytics-metrics-grid">
          {/* Revenue Card */}
          <div className="analytics-revenue-card">
            <div className="rev-header">
              <span className="rev-header-label">
                {isKm ? 'ចំណូលសរុបតាមការជ្រើសរើស' : 'Filtered Revenue'}
              </span>
              <span className="rev-badge">{formattedToday}</span>
            </div>

            <div className="rev-amount-block">
              <div>
                <span className="amt-sub">USD</span>
                <div className="amt-usd">${totalUSD.toFixed(2)}</div>
              </div>
              <div>
                <span className="amt-sub">KHR</span>
                <div className="amt-khr">{totalKHR.toLocaleString()} KHR</div>
              </div>
            </div>

            <div className="rev-footer-note">
              <span>{isKm ? `អត្រាប្តូរប្រាក់: 1 USD = ${EXCHANGE_RATE.toLocaleString()} KHR` : `Exchange Rate: 1 USD = ${EXCHANGE_RATE.toLocaleString()} KHR`}</span>
              <span className="rev-count-chip">
                {isKm ? `ចំនួនលក់: ${salesCount}` : `Sales count: ${salesCount}`}
              </span>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="analytics-stat-stack">
            <div className="stat-tile">
              <div className="stat-icon-wrap violet">
                <Package size={22} />
              </div>
              <div>
                <span className="stat-tile-label">{isKm ? 'មុខទំនិញលក់បាន' : 'Products Sold'}</span>
                <h3 className="stat-tile-val">{productBreakdown.reduce((acc, it) => acc + it.qty, 0)} {isKm ? 'ឯកតា' : 'items'}</h3>
              </div>
            </div>

            <div className="stat-tile">
              <div className="stat-icon-wrap indigo">
                <ShoppingCart size={22} />
              </div>
              <div>
                <span className="stat-tile-label">{isKm ? 'ចំនួនប្រតិបត្តិការ' : 'Transactions'}</span>
                <h3 className="stat-tile-val">{salesCount} {isKm ? 'លើក' : 'records'}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts & Summaries */}
        <div className="analytics-sections-grid">
          {/* Revenue Bar Visualizer */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-header-left">
                <TrendingUp size={18} className="chart-header-icon" />
                <h3>{isKm ? 'និន្នាការចំណូលប្រចាំសប្តាហ៍ ($)' : 'Weekly Revenue Trend ($)'}</h3>
              </div>
              <span className="chart-badge">{isKm ? 'សប្តាហ៍នេះ' : 'This Week'}</span>
            </div>

            <div className="bar-chart-container">
              {weeklyBars.map((bar, idx) => (
                <div key={idx} className="bar-column">
                  <span className="bar-value-tooltip">${bar.value.toFixed(0)}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${bar.percent}%` }} />
                  </div>
                  <span className="bar-label">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Breakdown Card */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-header-left">
                <PieChart size={18} className="chart-header-icon" />
                <h3>{isKm ? 'សង្ខេបផលិតផល' : 'Product Share'}</h3>
              </div>
              <span className="chart-badge">{productBreakdown.length} {isKm ? 'មុខ' : 'items'}</span>
            </div>

            <div className="products-summary-list">
              {productBreakdown.length === 0 ? (
                <div className="empty-chart-text">
                  {isKm ? 'គ្មានទិន្នន័យទំនិញក្នុងកំឡុងពេលនេះទេ។' : 'No product sales recorded for this period.'}
                </div>
              ) : (
                productBreakdown.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="product-summary-row">
                    <div className="prod-left">
                      <span className="prod-rank">{idx + 1}</span>
                      <div>
                        <div className="prod-name">{p.name}</div>
                        <span className="prod-qty">{p.qty} {isKm ? 'ចំនួនលក់' : 'sold'}</span>
                      </div>
                    </div>
                    <div className="prod-right">
                      <span className="prod-usd">${p.totalUSD.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="analytics-transactions-card">
          <div className="chart-card-header">
            <h3>{isKm ? 'ប្រតិបត្តិការថ្មីៗ' : 'Recent Transactions'}</h3>
            <Link to="/dashboard/transactions" className="analytics-view-all">
              {isKm ? 'មើលទាំងអស់' : 'View all'}
            </Link>
          </div>

          <div className="recent-tx-list">
            {filteredSales.length === 0 ? (
              <div className="empty-chart-text">
                {isKm ? 'មិនមានការលក់ថ្មីៗទេ។' : 'No recent transactions recorded.'}
              </div>
            ) : (
              filteredSales.slice(0, 4).map((sale, idx) => {
                const saleUsd = Number(sale.totalUSD || sale.totalAmount || 0);
                const saleKhr = Number(sale.totalKHR || saleUsd * EXCHANGE_RATE);
                return (
                  <div key={sale.saleId || idx} className="recent-tx-row" onClick={() => navigate('/dashboard/transactions')}>
                    <div className="tx-col-left">
                      <div className="tx-badge-icon">
                        <ShoppingCart size={18} />
                      </div>
                      <div>
                        <div className="tx-title">{summarizeSaleTitle(sale)}</div>
                        <div className="tx-time">
                          {new Date(sale.date || sale.createdAt || Date.now()).toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="tx-col-right">
                      <div className="tx-usd-text">${saleUsd.toFixed(2)}</div>
                      <div className="tx-khr-text">{Math.round(saleKhr).toLocaleString()} KHR</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}