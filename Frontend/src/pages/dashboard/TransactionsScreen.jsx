import { useState } from 'react';
import EditItemModal from '../../components/dashboard/EditItemModal';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ReviewSalePanel from '../../components/dashboard/ReviewSalePanel';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import TransactionSavedView from '../../components/dashboard/TransactionSavedView';
import { extractedSaleItems } from '../../data/dashboardMockData';
import '../DashboardPage.css';

export default function TransactionsScreen() {
  const [editingItem, setEditingItem] = useState(null);
  const [deletedId, setDeletedId] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleDelete = (id) => {
    setDeletedId(id);
    setEditingItem(null);
  };

  return (
    <MobileAppShell activeTab="transactions" showBottomNav={!saved}>
      {saved ? (
        <TransactionSavedView onNewSale={() => setSaved(false)} />
      ) : (
        <>
          <ScreenHeader title="Review & Confirm Sale" onBack={() => window.history.back()} />
          <ReviewSalePanel
            items={extractedSaleItems}
            deletedId={deletedId}
            onEdit={setEditingItem}
            onConfirm={() => setSaved(true)}
          />
          <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onDelete={handleDelete} />
        </>
      )}
    </MobileAppShell>
  );
}
