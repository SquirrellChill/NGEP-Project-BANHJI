import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/dashboard/AppHeader';
import MobileAppShell from '../components/dashboard/MobileAppShell';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import RevenueCard from '../components/dashboard/RevenueCard';
import { useAuth } from '../context/AuthContext';
import { currentUserProfile, recentTransactions, revenueSummary } from '../data/dashboardMockData';
import { buildDashboardProfile } from '../utils/profile';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = buildDashboardProfile(user, currentUserProfile);

  return (
    <MobileAppShell activeTab="home">
      <AppHeader profile={profile} />
      <section className="welcome-greeting">
        <h2>Welcome back, {profile.firstName}!</h2>
        <p>Here is your business overview today.</p>
      </section>
      <RevenueCard summary={revenueSummary} />
      <QuickActionCard onClick={() => navigate('/dashboard/voice')} />
      <RecentTransactions transactions={recentTransactions} />
    </MobileAppShell>
  );
}
