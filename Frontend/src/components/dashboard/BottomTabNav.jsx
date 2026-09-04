import { ClipboardList, History, Home, Mic, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function BottomTabNav({ activeTab }) {
  const navigate = useNavigate();

  return (
    <nav className="bottom-tab-nav" aria-label="Dashboard navigation">
      <NavLink className={`tab-nav-item ${activeTab === 'home' ? 'active' : ''}`} to="/dashboard">
        <Home size={24} fill="currentColor" />
        <span>Home</span>
      </NavLink>
      <NavLink className={`tab-nav-item ${activeTab === 'history' ? 'active' : ''}`} to="/dashboard/history">
        <History size={24} />
        <span>History</span>
      </NavLink>
      <div className="tab-nav-center">
        <button className="bottom-mic-button" type="button" onClick={() => navigate('/dashboard/voice')} aria-label="Voice input">
          <Mic size={25} />
        </button>
      </div>
      <NavLink className={`tab-nav-item ${activeTab === 'transactions' ? 'active' : ''}`} to="/dashboard/transactions">
        <ClipboardList size={24} />
        <span>Transactions</span>
      </NavLink>
      <NavLink className={`tab-nav-item ${activeTab === 'profile' ? 'active' : ''}`} to="/dashboard/profile">
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
