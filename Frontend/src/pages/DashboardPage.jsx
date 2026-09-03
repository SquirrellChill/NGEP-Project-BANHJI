import React, { useState } from 'react';
import './DashboardPage.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [historyFilter, setHistoryFilter] = useState('today');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Item Form State
  const [productName, setProductName] = useState('Green tea');
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState('KHR'); // 'KHR' or 'USD'
  const [unitPrice, setUnitPrice] = useState(8000);
  const exchangeRate = 4104;

  const calculatedTotalKHR = currency === 'KHR' ? quantity * unitPrice : quantity * unitPrice * exchangeRate;
  const calculatedTotalUSD = (calculatedTotalKHR / exchangeRate).toFixed(2);

  return (
    <div className="app-viewport">
      {/* Top Web Navigation Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">✦</div>
          <span className="brand-title">KotChomnol</span>
        </div>
        
        <div className="header-user-profile">
          <div className="avatar-circle">
            <span className="avatar-initials">SB</span>
          </div>
          <div className="user-details">
            <span className="user-name">Sok Bora</span>
            <span className="shop-name">Boran Coffee shop</span>
          </div>
          <button className="notification-btn">🔔</button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="app-body">
        {activeTab === 'home' && (
          <div className="dashboard-grid">
            {/* Revenue Summary Banner */}
            <div className="revenue-card-blue">
              <div className="card-top-row">
                <span className="card-subtitle">📈 TODAY'S REVENUE</span>
                <span className="date-badge">📅 15-Mar-2026</span>
              </div>
              <div className="primary-revenue">42,000 KHR</div>
              <div className="secondary-revenue">Equivalent: $10.25 <small>(1$ = 4,100៛)</small></div>
              <div className="card-divider"></div>
              <div className="order-stats">
                <span>Total Orders</span>
                <strong>4</strong>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="quick-action-card">
              <div className="mic-icon-blue">🎙️</div>
              <div className="action-info">
                <h3>Voice-to-sales</h3>
                <p>Speak transaction, AI does the match</p>
              </div>
              <span className="arrow-launch">↗</span>
            </div>

            {/* Recent Transactions List */}
            <div className="transactions-container">
              <div className="section-title-bar">
                <h3>Recent Transactions</h3>
                <button className="text-btn">View all</button>
              </div>
              <div className="transaction-list">
                <div className="transaction-row">
                  <div>
                    <div className="item-title">Iced coffee x2</div>
                    <div className="item-meta">10:42 am • voice</div>
                  </div>
                  <div className="item-price">4,000 KHR ›</div>
                </div>
                <div className="transaction-row">
                  <div>
                    <div className="item-title">Croissant x1</div>
                    <div className="item-meta">10:15 am • manual</div>
                  </div>
                  <div className="item-price">6,000 KHR ›</div>
                </div>
                <div className="transaction-row">
                  <div>
                    <div className="item-title">Iced tea x3</div>
                    <div className="item-meta">9:50 am • voice</div>
                  </div>
                  <div className="item-price">12,000 KHR ›</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-view-container">
            <div className="revenue-card-blue">
              <span className="card-subtitle">FILTERED REVENUE</span>
              <div className="primary-revenue">42,000 KHR <small>($10.25)</small></div>
            </div>

            {/* Date Filter Tabs */}
            <div className="filter-tab-bar">
              <button className={historyFilter === 'today' ? 'active' : ''} onClick={() => setHistoryFilter('today')}>Today</button>
              <button className={historyFilter === 'week' ? 'active' : ''} onClick={() => setHistoryFilter('week')}>This Week</button>
              <button className={historyFilter === 'month' ? 'active' : ''} onClick={() => setHistoryFilter('month')}>This Month</button>
              <button className="calendar-filter-btn">📅 ▾</button>
            </div>

            {/* Product Summary Grid */}
            <div className="summary-metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Total Items</span>
                <span className="metric-num">2</span>
                <span className="metric-sub">types of products</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Total Quantity</span>
                <span className="metric-num">10</span>
                <span className="metric-sub">items</span>
              </div>
            </div>

            {/* Table Breakdown */}
            <table className="web-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Milk tea</td>
                  <td>2</td>
                  <td>4,000៛</td>
                  <td>8,000៛</td>
                </tr>
                <tr>
                  <td>Greentea</td>
                  <td>2</td>
                  <td>3,000៛</td>
                  <td>6,000៛</td>
                </tr>
                <tr>
                  <td>Honey tea</td>
                  <td>2</td>
                  <td>8,000៛</td>
                  <td>4,000៛</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Review & Edit Screen Mock */}
        {activeTab === 'review' && (
          <div className="review-view-container">
            <div className="alert-banner-success">
              <span className="check-icon">✓</span>
              <div>
                <strong>AI Extraction Complete!</strong>
                <p>We've captured the details. Please review quantities & prices below.</p>
              </div>
              <button className="link-btn">Re-record</button>
            </div>

            <table className="web-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Milk tea</td>
                  <td>2</td>
                  <td>$1.00</td>
                  <td>$2.00</td>
                  <td><button className="text-btn" onClick={() => setShowEditModal(true)}>Edit</button></td>
                </tr>
                <tr>
                  <td>Greentea</td>
                  <td>2</td>
                  <td>$1.50</td>
                  <td>$3.00</td>
                  <td><button className="text-btn" onClick={() => setShowEditModal(true)}>Edit</button></td>
                </tr>
              </tbody>
            </table>

            <div className="review-footer-bar">
              <div className="review-totals">
                <div>Total Items: <strong>2</strong></div>
                <div>Total amount: <strong className="highlight-price">$10.00</strong></div>
              </div>
              <div className="action-buttons-group">
                <button className="btn-outline" onClick={() => setShowEditModal(true)}>✏ Edit Items</button>
                <button className="btn-primary-blue">Confirm & Save Sale</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Voice Input FAB */}
      <button className="floating-mic-fab" onClick={() => setActiveTab('review')}>
        🎙️
      </button>

      {/* Bottom Web Dashboard Navigation Bar */}
      <nav className="bottom-app-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          🏠 <span>Home</span>
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          🕒 <span>History</span>
        </button>
        <button className={`nav-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          📋 <span>Transactions</span>
        </button>
        <button className="nav-item">
          👤 <span>Profile</span>
        </button>
      </nav>

      {/* Item Edit Modal Overlay */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Edit Items</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>🏷 Product Name</label>
              <div className="input-with-action">
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
                <button className="badge-edit-btn">✏ Edit</button>
              </div>
            </div>

            <div className="form-row-dual">
              <div className="form-group">
                <label>Quantity</label>
                <div className="quantity-stepper">
                  <button onClick={() => setQuantity(Math.max(0, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <div className="currency-toggle">
                  <button className={currency === 'KHR' ? 'active' : ''} onClick={() => setCurrency('KHR')}>៛ KHR</button>
                  <button className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>$ USD</button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Unit Price</label>
              <div className="input-currency-addon">
                <input 
                  type="number" 
                  value={unitPrice} 
                  onChange={(e) => setUnitPrice(Number(e.target.value))} 
                />
                <span className="currency-label">{currency}</span>
              </div>
            </div>

            <div className="price-summary-banner">
              <div className="calc-title">TOTAL PRICE <small>(Auto Calculated)</small></div>
              <div className="calculated-main-price">{calculatedTotalKHR.toLocaleString()} KHR</div>
              <div className="calculated-sub-price">(~${calculatedTotalUSD})</div>
              <div className="exchange-rate-footnote">Exchange rate: 1 USD = 4,104 KHR</div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-danger" onClick={() => setShowEditModal(false)}>Delete</button>
              <button className="btn-primary-blue" onClick={() => setShowEditModal(false)}>Confirm & Save Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}