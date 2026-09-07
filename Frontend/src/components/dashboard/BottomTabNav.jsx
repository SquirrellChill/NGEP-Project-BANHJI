import { ClipboardList, History, Home, PlusCircle, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomTabNav({ activeTab }) {
  const { t } = useLanguage();

  return (
    <nav className="bottom-tab-nav" aria-label={t('dashboardNavigation')}>
      <NavItem active={activeTab === 'home'} to="/dashboard" icon={<Home size={22} />} label={t('dashboard')} />
      <NavItem active={activeTab === 'history'} to="/dashboard/history" icon={<History size={22} />} label={t('history')} />
      <NavItem active={activeTab === 'add'} to="/dashboard/voice" icon={<PlusCircle size={24} />} label={t('addSale')} featured />
      <NavItem active={activeTab === 'transactions'} to="/dashboard/transactions" icon={<ClipboardList size={22} />} label={t('transactions')} />
      <NavItem active={activeTab === 'profile'} to="/dashboard/profile" icon={<User size={22} />} label={t('profile')} />
    </nav>
  );
}

function NavItem({ active, to, icon, label, featured = false }) {
  return (
    <NavLink className={`tab-nav-item ${featured ? 'featured' : ''} ${active ? 'active' : ''}`} to={to}>
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}