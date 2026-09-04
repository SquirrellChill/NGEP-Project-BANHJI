// src/pages/TermsPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle, Scale, Lock } from 'lucide-react';
import './TermsPolicy.css';

export default function TermsPage() {
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
            <FileText size={24} />
          </div>
          <h1>Terms of Service</h1>
          <p className="effective-date">Last Updated: August 2026</p>
        </div>

        <div className="legal-card-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using KotChomnol ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              KotChomnol provides an AI-powered voice bookkeeping assistant that transcribes spoken store transactions into financial ledgers. 
            </p>
          </section>

          <section className="legal-section">
            <h2>3. AI Processing & Accuracy Disclaimer</h2>
            <p>
              While our AI strives for high accuracy in processing natural language and currency values, audio clarity and accent variations can impact results.
            </p>
            <div className="legal-callout warning">
              <AlertTriangle size={18} />
              <span>
                <strong>User Responsibility:</strong> Users are responsible for reviewing and confirming extracted amounts before saving transactions to their official records.
              </span>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Service Modifications & Termination</h2>
            <p>
              We reserve the right to modify or discontinue any part of the Service at any time with prior notice when possible.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              KotChomnol shall not be liable for financial discrepancies, unconfirmed manual entries, or indirect business losses arising from the use of the platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}