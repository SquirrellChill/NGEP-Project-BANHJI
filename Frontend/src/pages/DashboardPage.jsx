import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  BarChart3,
  Receipt, 
  User, 
  Edit3, 
  Mic, 
  ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { buildDashboardProfile } from '../utils/profile';
import './DashboardPage.css';

const EXCHANGE_RATE = 4050; // 1 USD = 4,050 KHR

const profileFallback = {
  name: 'Seller',
  firstName: 'Seller',
  lastName: '',
  businessName: '',
  role: 'Owner',
  email: '',
  phone: '',
};

// Safe helper to read sales from standard storage keys
function getStoredSales() {
  try {
    const raw = localStorage.getItem('kotchomnol_sales') || localStorage.getItem('sales') || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse sales from storage:', err);
    return [];
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const isKm = language !== 'en';

  // Dynamic user profile
  const profile = buildDashboardProfile(user, profileFallback);
  const firstName = profile.firstName || profile.name?.split(' ')[0] || (isKm ? 'អ្នកលក់' : 'Seller');
  const fullDisplayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Seller';
  const initialLetter = (firstName.charAt(0) || 'U').toUpperCase();

  // Dynamic live date: Updates automatically every day
  const today = new Date();
  const formattedToday = today.toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate Today's Metrics at runtime
  const { todayTotalUSD, todayTotalKHR, todaySalesCount, recentSales } = useMemo(() => {
    const allSales = getStoredSales();

    const todayDateString = today.toDateString();

    // Filter strictly for sales made today
    const todaysSales = allSales.filter(item => {
      const saleDate = item.createdAt ? new Date(item.createdAt) : (item.date ? new Date(item.date) : null);
      return saleDate && saleDate.toDateString() === todayDateString;
    });

    // Sum totals for today
    let totalUSD = 0;
    let totalKHR = 0;

    todaysSales.forEach(sale => {
      if (sale.currency === 'USD') {
        const usd = Number(sale.totalAmount || sale.amount || 0);
        totalUSD += usd;
        totalKHR += usd * EXCHANGE_RATE;
      } else if (sale.currency === 'KHR') {
        const khr = Number(sale.totalAmount || sale.amount || 0);
        totalKHR += khr;
        totalUSD += khr / EXCHANGE_RATE;
      } else {
        // Default fallback if currency field is missing or generic USD
        const val = Number(sale.totalAmount || sale.amount || 0);
        totalUSD += val;
        totalKHR += val * EXCHANGE_RATE;
      }
    });

    // Sort recent sales descending
    const sorted = [...allSales].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    return {
      todayTotalUSD: totalUSD,
      todayTotalKHR: Math.round(totalKHR),
      todaySalesCount: todaysSales.length,
      recentSales: sorted.slice(0, 5) // Show top 5 recent sales
    };
  }, [today]);

  return (
    <div className="dash-container font-kantumruy">
      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <aside className="dash-sidebar">
        <div>
          <div className="dash-sidebar-brand" onClick={() => navigate('/')}>
            <div className="dash-brand-icon">K</div>
            <span className="dash-brand-title">KOTCHOMNOL</span>
          </div>

          <nav className="dash-nav-menu" aria-label="Dashboard Sidebar">
            <Link to="/dashboard" className="dash-nav-link active">
              <Home size={18} />
              <span>{isKm ? 'ទំព័រដើម' : 'Home'}</span>
            </Link>

            <Link to="/dashboard/history" className="dash-nav-link">
              <BarChart3 size={18} />
              <span>{isKm ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard'}</span>
            </Link>

            <Link to="/dashboard/voice" className="dash-nav-link dash-nav-add-sale">
              <span className="add-sale-icon-wrap">
                <Mic size={15} strokeWidth={2.4} />
              </span>
              <span>{isKm ? 'បន្ថែមការលក់' : 'Add Sale'}</span>
            </Link>

            <Link to="/dashboard/transactions" className="dash-nav-link">
              <Receipt size={18} />
              <span>{isKm ? 'កំណត់ត្រាការលក់' : 'Sales Records'}</span>
            </Link>

            <Link to="/dashboard/profile" className="dash-nav-link">
              <User size={18} />
              <span>{isKm ? 'ប្រវត្តិរូប' : 'Profile'}</span>
            </Link>
          </nav>
        </div>

        <div className="dash-sidebar-footer">
          {isKm ? 'គណនី:' : 'Account:'} <span className="dash-user-label">{fullDisplayName}</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dash-main-wrapper">
        <header className="dash-header">
          <div>
            <h1 className="dash-header-title">
              {isKm ? `សូមស្វាគមន៍ ${firstName}!` : `Welcome back, ${firstName}!`}
            </h1>
            <p className="dash-header-sub">
              {isKm ? 'នេះជាសង្ខេបអាជីវកម្មថ្ងៃនេះ។' : 'Here is your business overview today.'}
            </p>
          </div>
          <div className="dash-header-avatar" onClick={() => navigate('/dashboard/profile')}>
            {initialLetter}
          </div>
        </header>

        <main className="dash-content-body">
          <div className="dash-metrics-grid">
            {/* Dynamic Today's Revenue Card */}
            <div className="dash-revenue-card">
              <div>
                <div className="dash-rev-header">
                  <span className="dash-rev-label">
                    {isKm ? 'ចំណូលថ្ងៃនេះ' : "Today's Revenue"}
                  </span>
                  {/* Dynamic Date badge */}
                  <span className="dash-rev-date">{formattedToday}</span>
                </div>

                <div className="dash-rev-amounts">
                  <div>
                    <span className="dash-amt-label">{isKm ? 'សរុប (USD)' : 'Total (USD)'}</span>
                    <span className="dash-usd-val">${todayTotalUSD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="dash-amt-label">{isKm ? 'សរុប (KHR)' : 'Total (KHR)'}</span>
                    <span className="dash-khr-val">{todayTotalKHR.toLocaleString()} KHR</span>
                  </div>
                </div>
              </div>

              <div className="dash-rev-footer">
                <span>{isKm ? `អត្រាប្តូរប្រាក់: 1 USD = ${EXCHANGE_RATE.toLocaleString()} KHR` : `Exchange rate: 1 USD = ${EXCHANGE_RATE.toLocaleString()} KHR`}</span>
                <span className="dash-orders-badge">
                  {isKm ? `ចំនួនការលក់: ${todaySalesCount}` : `Sales count: ${todaySalesCount}`}
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="dash-quick-actions-card">
              <h3 className="dash-section-heading">
                {isKm ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}
              </h3>
              <div className="dash-action-buttons">
                <button 
                  type="button" 
                  className="dash-action-btn manual"
                  onClick={() => navigate('/dashboard/voice?manual=true')}
                >
                  <span className="dash-action-icon"><Edit3 size={18} /></span>
                  <div>
                    <div className="dash-action-btn-title">
                      {isKm ? 'បញ្ចូលដោយដៃ' : 'Manual Entry'}
                    </div>
                    <div className="dash-action-btn-sub">
                      {isKm ? 'បន្ថែមការលក់ដោយវាយទំនិញ' : 'Add sale by typing items'}
                    </div>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="dash-action-btn voice"
                  onClick={() => navigate('/dashboard/voice')}
                >
                  <span className="dash-action-icon"><Mic size={18} /></span>
                  <div>
                    <div className="dash-action-btn-title">
                      {isKm ? 'ថតការលក់' : 'Voice Entry'}
                    </div>
                    <div className="dash-action-btn-sub">
                      {isKm ? 'កំពុងស្តាប់ព័ត៌មានការលក់' : 'Speak to record your sales'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Recent Transactions Section */}
          <div className="dash-transactions-card">
            <div className="dash-tx-header">
              <h3 className="dash-section-heading">
                {isKm ? 'ប្រតិបត្តិការថ្មីៗ' : 'Recent Transactions'}
              </h3>
              <Link to="/dashboard/transactions" className="dash-view-all-link">
                {isKm ? 'មើលទាំងអស់' : 'View all'}
              </Link>
            </div>

            <div className="dash-tx-list">
              {recentSales.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                  {isKm ? 'មិនទាន់មានការលក់នៅឡើយទេ។' : 'No sales recorded yet.'}
                </div>
              ) : (
                recentSales.map((sale, idx) => {
                  const saleUsd = Number(sale.totalAmount || sale.amount || 0);
                  const saleKhr = sale.amountKHR || Math.round(saleUsd * EXCHANGE_RATE);
                  const itemName = sale.items?.[0]?.name || sale.name || (isKm ? 'ការលក់ទូទៅ' : 'General Sale');
                  const itemCount = sale.items?.length > 1 ? ` +${sale.items.length - 1}` : '';

                  return (
                    <div key={sale.id || idx} className="dash-tx-item">
                      <div className="dash-tx-left">
                        <div className="dash-tx-icon">
                          <ShoppingCart size={18} />
                        </div>
                        <div>
                          <div className="dash-tx-name">{itemName}{itemCount}</div>
                          <div className="dash-tx-meta">
                            {new Date(sale.createdAt || sale.date || Date.now()).toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
                              month: 'short',
                              day: 'numeric'
                            })} • {isKm ? 'ការលក់' : 'Sale'}
                          </div>
                        </div>
                      </div>
                      <div className="dash-tx-right">
                        <div className="dash-tx-usd">${saleUsd.toFixed(2)}</div>
                        <div className="dash-tx-khr">{saleKhr.toLocaleString()} KHR</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}