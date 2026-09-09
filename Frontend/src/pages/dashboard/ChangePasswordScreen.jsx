import React from 'react';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import { useLanguage } from '../../context/LanguageContext';
import './ChangePasswordScreen.css';

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isKm = language !== 'en';

  return (
    <MobileAppShell activeTab="profile" showBottomNav={false}>
      <div className="pwd-split-wrapper font-kantumruy">
        {/* Top Floating Back Bar */}
        <div className="pwd-top-nav">
          <button 
            type="button" 
            className="pwd-back-btn" 
            onClick={() => navigate('/dashboard/profile')}
          >
            <ArrowLeft size={16} />
            <span>{isKm ? 'ត្រឡប់ទៅប្រវត្តិរូប' : 'Back to Profile'}</span>
          </button>
        </div>

        {/* Master Dual-Pane Card */}
        <div className="pwd-auth-card">
          {/* Left Gradient Brand Banner */}
          <div className="pwd-card-banner">
            <div>
              <div className="pwd-icon-badge">
                <KeyRound size={22} />
              </div>
              <span className="pwd-brand-text">KOTCHOMNOL</span>
              <h2 className="pwd-banner-title">
                {isKm ? 'ផ្លាស់ប្តូរលេខសម្ងាត់' : 'Change Password'}
              </h2>
              <p className="pwd-banner-desc">
                {isKm 
                  ? 'បង្កើតលេខសម្ងាត់ដែលមានសុវត្ថិភាពខ្ពស់ ដើម្បីការពារគណនី និងទិន្នន័យហាងរបស់អ្នក។' 
                  : 'Update your password regularly to keep your business records and sales safe.'}
              </p>
            </div>

            <div className="pwd-banner-footer">
              <ShieldCheck size={16} />
              <span>{isKm ? 'ការការពារគណនីមានសុវត្ថិភាព 256-bit' : 'Encrypted & Secure authentication'}</span>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="pwd-card-body">
            <div className="pwd-form-header">
              <h3>{isKm ? 'កំណត់លេខសម្ងាត់ថ្មី' : 'Create a New Password'}</h3>
              <p>{isKm ? 'សូមបញ្ចូលលេខសម្ងាត់បច្ចុប្បន្ន និងលេខសម្ងាត់ថ្មី' : 'Please enter your current and new credentials below.'}</p>
            </div>

            <div className="pwd-form-embed">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </MobileAppShell>
  );
}