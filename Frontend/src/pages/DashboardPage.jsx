import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/dashboard/AppHeader';
import MobileAppShell from '../components/dashboard/MobileAppShell';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import RevenueCard from '../components/dashboard/RevenueCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSales, getSummary } from '../services/transactionService';
import { buildDashboardProfile } from '../utils/profile';
import { normalizeSaleFromApi, summarizeSaleTitle } from '../utils/sales';
import './DashboardPage.css';

const profileFallback = {
  name: 'Seller',
  firstName: 'Seller',
  businessName: 'BANHJI',
  role: 'Owner',
  email: '',
  phone: '',
  address: '',
};

const emptySummary = {
  label: "TODAY'S REVENUE",
  filteredLabel: 'FILTERED REVENUE',
  date: '',
  amountKHR: 0,
  amountUSD: 0,
  totalOrders: 0,
};

const totalForCurrency = (summary, currency) =>
  Number((summary?.totals || []).find((entry) => entry.currency === currency)?.total || 0);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const profile = buildDashboardProfile(user, profileFallback);
  const [summary, setSummary] = useState(emptySummary);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([
      getSummary({ period: 'daily' }),
      getSales({ limit: 5 }),
    ])
      .then(([summaryResponse, salesResponse]) => {
        if (!alive) return;
        const summaryData = summaryResponse.data;
        const normalizedSales = salesResponse.data.map(normalizeSaleFromApi);
        setSummary({
          ...emptySummary,
          label: t('todaysRevenue'),
          filteredLabel: t('filteredRevenue'),
          date: summaryData.start_date,
          amountKHR: totalForCurrency(summaryData, 'KHR'),
          amountUSD: totalForCurrency(summaryData, 'USD'),
          totalOrders: summaryData.sales_count,
        });
        setTransactions(normalizedSales.map((sale) => ({
          id: sale.saleId,
          title: summarizeSaleTitle(sale),
          time: sale.date,
          source: 'sale',
          amountKHR: sale.totalKHR,
          amountUSD: sale.totalUSD,
        })));
      })
      .catch(() => {
        if (alive) setError(t('unableDashboard'));
      });

    return () => {
      alive = false;
    };
  }, [t]);

  return (
    <MobileAppShell activeTab="home">
      <AppHeader profile={profile} />
      <section className="welcome-greeting">
        <h2>{t('welcomeBack', { name: profile.firstName })}</h2>
        <p>{t('businessOverviewToday')}</p>
      </section>
      {error && <p className="review-error-message">{error}</p>}
      <RevenueCard summary={summary} />
      <QuickActionCard onClick={() => navigate('/dashboard/voice')} />
      <RecentTransactions transactions={transactions} />
    </MobileAppShell>
  );
}
