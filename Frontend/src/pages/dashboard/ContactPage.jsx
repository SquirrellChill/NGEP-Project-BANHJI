import React from 'react';
import { Mail, PhoneCall } from 'lucide-react';
import StitchLegalLayout from '../../components/stitch/StitchLegalLayout';
import { useLanguage } from '../../context/LanguageContext';
import './ContactPage.css';

const FacebookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.946z" />
  </svg>
);

export default function ContactPage() {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const visitText = isKhmer ? 'ចូលមើល' : 'Visit Us';

  return (
    <StitchLegalLayout 
      icon={<PhoneCall size={25} />} 
      title={isKhmer ? 'ទំនាក់ទំនងយើងខ្ញុំ' : 'Contact & Socials'} 
      updated={isKhmer ? 'ឆ្លើយតបរៀងរាល់ថ្ងៃចន្ទ ដល់ សុក្រ' : 'Support available Mon - Fri'}
    >
      <section className="contact-intro">
        <p>
          {isKhmer
            ? 'តើអ្នកមានចម្ងល់ មានមតិកែលម្អ ឬចង់សហការជាមួយពួកយើងមែនទេ? សូមទាក់ទងមកកាន់ពួកយើងតាមរយៈបណ្តាញសង្គមផ្លូវការ ឬអ៊ីមែលខាងក្រោម៖'
            : 'Have questions, feedback, or partnership inquiries? Reach out to the KotChomnol team through any of our official channels below:'}
        </p>
      </section>

      <div className="contact-channels-grid">
        {/* Email Support */}
        <div className="contact-card email-static-card">
          <div 
            className="contact-card-icon" 
            style={{ backgroundColor: 'rgba(126, 34, 206, 0.12)', color: '#7e22ce' }}
          >
            <Mail size={22} />
          </div>
          <div className="contact-card-body">
            <h3 className="contact-card-title">{isKhmer ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Support'}</h3>
            <p className="contact-card-handle selectable-email">kotchomnol@gmail.com</p>
          </div>
        </div>

        {/* Facebook Page */}
        <a
          href="https://www.facebook.com/share/1EbvXG9cbQ/?mibextid=wwXIfr"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <div 
            className="contact-card-icon" 
            style={{ backgroundColor: 'rgba(24, 119, 242, 0.12)', color: '#1877f2' }}
          >
            <FacebookIcon />
          </div>
          <div className="contact-card-body">
            <h3 className="contact-card-title">Facebook Page</h3>
            <p className="contact-card-handle">KotChomnol - កត់ចំណូល</p>
          </div>
          <span className="contact-action-badge">{visitText} →</span>
        </a>

        {/* TikTok */}
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <div 
            className="contact-card-icon" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)', color: '#000000' }}
          >
            <TikTokIcon />
          </div>
          <div className="contact-card-body">
            <h3 className="contact-card-title">TikTok</h3>
            <p className="contact-card-handle">@kotchomnol</p>
          </div>
          <span className="contact-action-badge">{visitText} →</span>
        </a>

        {/* Telegram */}
        <a
          href="https://telegram.org"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card"
        >
          <div 
            className="contact-card-icon" 
            style={{ backgroundColor: 'rgba(34, 158, 217, 0.12)', color: '#229ed9' }}
          >
            <TelegramIcon />
          </div>
          <div className="contact-card-body">
            <h3 className="contact-card-title">Telegram</h3>
            <p className="contact-card-handle">KotChomnol Support</p>
          </div>
          <span className="contact-action-badge">{visitText} →</span>
        </a>
      </div>
    </StitchLegalLayout>
  );
}