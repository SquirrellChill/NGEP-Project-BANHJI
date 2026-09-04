import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Mic, BarChart3, Cloud, ArrowDown, Lock, Plus, Minus, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // STRICT USER CHECK: Validates if the user object/token actually exists and contains real data
  const checkIsLoggedIn = () => {
    // 1. Check AuthContext user object properties
    if (user && typeof user === 'object' && Object.keys(user).length > 0) {
      if (user.token || user.email || user.id || user._id) return true;
    }
    if (typeof user === 'string' && user !== 'null' && user !== 'undefined' && user.trim() !== '') {
      return true;
    }

    // 2. Check localStorage key values safely
    const token = localStorage.getItem('kc_token');
    const storedUser = localStorage.getItem('kc_user');

    const isValidValue = (val) => val && val !== 'null' && val !== 'undefined' && val !== '{}' && val !== '""';

    return isValidValue(token) || isValidValue(storedUser);
  };

  const isLoggedIn = checkIsLoggedIn();

  const [activeTab, setActiveTab] = useState('voice');
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // const handleLogout = () => {
  //   if (logout) {
  //     logout();
  //   }
  //   localStorage.removeItem('kc_token');
  //   localStorage.removeItem('kc_user');
  //   navigate('/');
  // };

  return (
    <div className="landing-wrapper">
      {/* Background Ambient Spheres */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>

      {/* 1. Header / Navbar */}
      <header className="navbar-container">
        <nav className="navbar">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <div className="logo-icon-wrapper">
              <Sparkles className="logo-spark" size={18} />
            </div>
            <span className="brand-name">KotChomnol</span>
          </div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </div>

          {/* DYNAMIC HEADER BUTTONS */}
          <div className="nav-actions">
            {isLoggedIn ? (
              /* LANDING 2: Logged In -> Dashboard & Logout */
              <>
                {/* <button className="btn-secondary-sm" onClick={handleLogout}>
                  <LogOut size={14} style={{ marginRight: '6px' }} />
                  Log Out
                </button> */}
                <button className="btn-violet-sm" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard size={16} style={{ marginRight: '6px' }} />
                  Dashboard
                </button>
              </>
            ) : (
              /* LANDING 1: Logged Out -> Log In & Get Started */
              <>
                <button className="btn-secondary-sm" onClick={() => navigate('/login')}>
                  Log In
                </button>
                <button className="btn-violet-sm" onClick={() => navigate('/register')}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge reveal reveal-up">
          <span className="badge-pulse"></span> Next-Gen Voice Bookkeeping AI
        </div>

        <h1 className="hero-heading reveal reveal-up delay-1">
          Talk to Your Ledger. <br />
          <span className="text-violet-glow">Track Sales Effortlessly.</span>
        </h1>

        <p className="hero-subtext reveal reveal-up delay-2">
          KotChomnol turns spoken shop orders into structured financial statements instantly. Eliminate manual record-keeping with real-time Khmer & English voice recognition.
        </p>

        {/* DYNAMIC HERO CTA BUTTON */}
        <div className="hero-cta-group reveal reveal-up delay-3">
          {isLoggedIn ? (
            /* LANDING 2 HERO BUTTON */
            <button className="btn-violet-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard →
            </button>
          ) : (
            /* LANDING 1 HERO BUTTON */
            <button className="btn-violet-lg" onClick={() => navigate('/register')}>
              Start Free 14-Day Trial →
            </button>
          )}
        </div>

        <p className="hero-micro-copy reveal reveal-up delay-4">
          <Zap size={13} /> Setup takes under 60 seconds • No credit card needed
        </p>

        {/* Hero Mockup Frame */}
        <div className="hero-mockup-wrapper reveal reveal-scale delay-2">
          <div className="mockup-glass-card">
            <div className="mockup-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
              <span className="mockup-title">kotchomnol.ai/live-dashboard</span>
            </div>

            <div className="mockup-body">
              <div className="stat-card-row">
                <div className="stat-box">
                  <span className="label">Today's Revenue</span>
                  <span className="value">$142.50</span>
                  <span className="trend positive">+18.4% today</span>
                </div>
                <div className="stat-box">
                  <span className="label">Total Transactions</span>
                  <span className="value">48</span>
                  <span className="trend">Voice Logs: 94%</span>
                </div>
              </div>

              <div className="live-speech-box">
                <div className="mic-circle"><Mic size={18} /></div>
                <div className="speech-text">
                  "Sold 2 iced lattes for $4.00 and 1 croissant for $2.50"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics Section */}
      <section className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-item reveal reveal-up">
            <h2>99.2%</h2>
            <p>Voice Precision Rate</p>
          </div>
          <div className="metric-item reveal reveal-up delay-1">
            <h2>3 Sec</h2>
            <p>Average Log Duration</p>
          </div>
          <div className="metric-item reveal reveal-up delay-2">
            <h2>100%</h2>
            <p>Automated Financial Ledger</p>
          </div>
        </div>
      </section>

      {/* 4. Features Tabs Section */}
      <section id="features" className="features-tab-section">
        <div className="section-header reveal reveal-up">
          <span className="tag-violet">Powerful Capabilities</span>
          <h2>Designed for Speed & Convenience</h2>
        </div>

        <div className="tab-navigation reveal reveal-up delay-1">
          <button
            className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            <Mic size={16} /> Voice Engine
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} /> Instant Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
          >
            <Cloud size={16} /> Cloud Security
          </button>
        </div>

        <div className="tab-content-display reveal reveal-scale delay-2">
          {activeTab === 'voice' && (
            <div className="tab-pane">
              <div className="pane-text">
                <h3>Khmer & English Natural Speech Parsing</h3>
                <p>Speak naturally in full sentences or quick fragments. KotChomnol extracts product names, item quantities, and amounts in real time.</p>
              </div>
              <div className="pane-card-graphic">
                <div className="graphic-badge">"2 Coffee, $3.00 Total"</div>
                <div className="graphic-arrow"><ArrowDown size={20} /></div>
                <div className="graphic-pill">Extracted: [Qty: 2] [Item: Coffee] [Sum: $3.00]</div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-pane">
              <div className="pane-text">
                <h3>Automated Income & Revenue Visualization</h3>
                <p>Never worry about balancing your books at night. Daily and weekly revenue charts update automatically after every voice command.</p>
              </div>
              <div className="pane-card-graphic">
                <div className="fake-chart">
                  <div className="bar b1" style={{ height: '40%' }}></div>
                  <div className="bar b2" style={{ height: '70%' }}></div>
                  <div className="bar b3" style={{ height: '55%' }}></div>
                  <div className="bar b4" style={{ height: '90%' }}></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="tab-pane">
              <div className="pane-text">
                <h3>Sync Across Desktop and Mobile Devices</h3>
                <p>Your shop data is protected with end-to-end cloud backup. Log in from any laptop or mobile web browser to inspect your ledger.</p>
              </div>
              <div className="pane-card-graphic">
                <div className="graphic-pill success"><Lock size={14} /> Encrypted Cloud Vault Connected</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-header reveal reveal-up">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {[
            {
              q: "Does KotChomnol support both Khmer and English?",
              a: "Yes! The system is optimized to process speech in Khmer, English, or mixed daily shop terminology seamlessly."
            },
            {
              q: "What if a sales entry is recorded incorrectly?",
              a: "You can click on any logged item in your live stream to edit the price, quantity, or description instantly."
            },
            {
              q: "Can I use KotChomnol on both desktop and mobile?",
              a: "Yes. KotChomnol is fully responsive and synced across web browser devices."
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`faq-item reveal reveal-up delay-${index % 3} ${openFaq === index ? 'active' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <h4>{item.q}</h4>
                <span className="faq-toggle">{openFaq === index ? <Minus size={16} /> : <Plus size={16} />}</span>
              </div>
              {openFaq === index && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer CTA Section */}
      <footer className="footer-cta-section">
        <div className="footer-cta-content reveal reveal-up">
          <h2 className="text-violet-glow">Transform Your Business Bookkeeping Today</h2>
          <p>Join store owners saving hours on manual record keeping using KotChomnol.</p>
          
          {/* DYNAMIC FOOTER BUTTON */}
          {isLoggedIn ? (
            <button className="btn-violet-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard →
            </button>
          ) : (
            <button className="btn-violet-lg" onClick={() => navigate('/register')}>
              Get Started For Free →
            </button>
          )}
        </div>

        <div className="footer-bottom">
          <p>© 2026 KotChomnol AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}