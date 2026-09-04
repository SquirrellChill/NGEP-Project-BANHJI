import { Tag } from 'lucide-react';
import { useState } from 'react';
import DatePickerModal from '../../components/dashboard/DatePickerModal';
import HistoryFilters from '../../components/dashboard/HistoryFilters';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ProductSummaryCard from '../../components/dashboard/ProductSummaryCard';
import ProductSummaryTable from '../../components/dashboard/ProductSummaryTable';
import RevenueCard from '../../components/dashboard/RevenueCard';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import { productSummary, revenueSummary } from '../../data/dashboardMockData';
import '../DashboardPage.css';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const totalQuantity = productSummary.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = new Set(productSummary.map((item) => item.product)).size;

  return (
    <MobileAppShell activeTab="history">
      <ScreenHeader title="History" onBack={() => window.history.back()} />
      <RevenueCard summary={revenueSummary} variant="history" />
      <HistoryFilters activeFilter={activeFilter} onChange={setActiveFilter} onPickDate={() => setShowDatePicker(true)} />
      <div className="icon-section-title">
        <Tag size={20} fill="currentColor" />
        <h2>Product Summary</h2>
      </div>
      <ProductSummaryCard totalItems={totalItems} totalQuantity={totalQuantity} />
      <ProductSummaryTable items={productSummary} />
      {showDatePicker && <DatePickerModal onClose={() => setShowDatePicker(false)} />}
    </MobileAppShell>
  );
}
