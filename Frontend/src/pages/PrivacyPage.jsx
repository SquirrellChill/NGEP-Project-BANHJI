// src/pages/PrivacyPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, UserCheck } from 'lucide-react';
import './TermsPolicy.css';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <header className="legal-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>
      </header>

      <main className="legal-container">
        <div className="legal-hero">
          <div className="legal-icon-badge">
            <ShieldCheck size={24} />
          </div>
          <h1>Privacy Policy</h1>
          <p className="effective-date">Last Updated: August 2026</p>
        </div>

        <div className="legal-card-content">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>To provide accurate bookkeeping, KotChomnol collects the following information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and shop credentials upon registration.</li>
              <li><strong>Voice Data:</strong> Audio inputs recorded during voice-to-sales processing to parse transaction details.</li>
              <li><strong>Financial Ledgers:</strong> Transaction amounts, product names, quantities, and dates recorded in your account.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Data</h2>
            <p>We use your data strictly to operationally provide and improve the platform:</p>
            <ul>
              <li>Transcribing audio clips into structured sales data.</li>
              <li>Generating business analytics and income reports for your dashboard.</li>
              <li>Improving natural language accuracy for Khmer and English terminology.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Voice Data Handling</h2>
            <div className="legal-callout success">
              <Lock size={18} />
              <span>
                Audio processing is encrypted. Voice recordings are parsed in real-time and are never sold or shared with third-party advertisers.
              </span>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Data Storage and Protection</h2>
            <p>
              We implement industry-standard encryption protocols (SSL/TLS) for data in transit and secure database storage for all stored ledger entries.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, edit, export, or permanently delete your stored financial transactions and account details at any time through your dashboard settings.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please reach out to us at <strong>support@kotchomnol.ai</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}