import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Mic, Receipt, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './BottomTabNav.css';

export default function BottomTabNav({ activeTab }) {
  const { language } = useLanguage();
  const isKm = language !== 'en';

  return (
    <nav className="global-bottom-bar" aria-label="Bottom Navigation">
      {/* 1. Home */}
      <NavLink 
        to="/dashboard" 
        end
        className={({ isActive }) => `global-tab-link ${isActive || activeTab === 'home' ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>{isKm ? 'ទំព័រដើម' : 'Home'}</span>
      </NavLink>

      {/* 2. Dashboard */}
      <NavLink 
        to="/dashboard/history" 
        className={({ isActive }) => `global-tab-link ${isActive || activeTab === 'history' || activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <BarChart3 size={20} />
        <span>{isKm ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard'}</span>
      </NavLink>

      {/* 3. Add Sale (Centered Featured Action) */}
      <NavLink 
        to="/dashboard/voice" 
        className={({ isActive }) => `global-tab-link featured-tab ${isActive || activeTab === 'add' ? 'active' : ''}`}
      >
        <span className="global-mic-badge">
          <Mic size={16} strokeWidth={2.4} />
        </span>
        <span>{isKm ? 'បន្ថែមការលក់' : 'Add Sale'}</span>
      </NavLink>

      {/* 4. Sales Records */}
      <NavLink 
        to="/dashboard/transactions" 
        className={({ isActive }) => `global-tab-link ${isActive || activeTab === 'transactions' ? 'active' : ''}`}
      >
        <Receipt size={20} />
        <span>{isKm ? 'កំណត់ត្រាការលក់' : 'Sales Records'}</span>
      </NavLink>

      {/* 5. Profile */}
      <NavLink 
        to="/dashboard/profile" 
        className={({ isActive }) => `global-tab-link ${isActive || activeTab === 'profile' ? 'active' : ''}`}
      >
        <User size={20} />
        <span>{isKm ? 'ប្រវត្តិរូប' : 'Profile'}</span>
      </NavLink>
    </nav>
  );
}