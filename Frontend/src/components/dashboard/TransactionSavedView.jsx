import React from 'react';
import { Receipt, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './TransactionSavedView.css';

export default function TransactionSavedView({ onNewSale, savedSaleId }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isKm = language !== 'en';

  return (
    <div className="saved-screen-container font-kantomruy">
      <div className="saved-card">
        {/* Animated Check Badge */}
        <div className="saved-icon-pulse-wrapper">
          <div className="saved-icon-badge">
            <svg viewBox="0 0 24 24" width="42" height="42" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="saved-title">
          {t('transactionSaved') || (isKm ? 'បានរក្សាទុកការលក់' : 'Transaction Saved')}
        </h1>
        <p className="saved-subtitle">
          {t('saleAdded') || (isKm ? 'ការលក់របស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងចំណូលថ្ងៃនេះដោយជោគជ័យ។' : 'Your sale has been added to today\'s revenue.')}
        </p>

        {/* Action Buttons with Uniform Style */}
        <div className="saved-actions-grid">
          <button
            className="saved-action-btn"
            type="button"
            onClick={() => navigate('/dashboard/transactions', { state: { saleId: savedSaleId } })}
            disabled={!savedSaleId}
          >
            <Receipt size={18} />
            <span>{t('viewSale') || (isKm ? 'មើលវិក្កយបត្រ' : 'View Sale')}</span>
          </button>

          <button 
            className="saved-action-btn" 
            type="button" 
            onClick={onNewSale}
          >
            <PlusCircle size={18} />
            <span>{t('addAnotherSale') || (isKm ? 'បន្ថែមការលក់មួយទៀត' : 'Add Another Sale')}</span>
          </button>

          <button 
            className="saved-action-btn" 
            type="button" 
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>{t('goToDashboard') || (isKm ? 'ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង' : 'Go to Dashboard')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}