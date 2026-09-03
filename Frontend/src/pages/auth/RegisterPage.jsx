import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { register, getErrorMessage } from '../../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* Keyframe Animations & Crisp CSS Overrides */}
      <style>{`
        /* Floating entrance animation: glides smoothly to center without blur */
        @keyframes floatInCenter {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dark-pill-input:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.25) !important;
          background-color: #1a1f2c !important;
        }

        .dark-pill-input::placeholder {
          color: #64748b;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -4px rgba(147, 51, 234, 0.5) !important;
        }

        .primary-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Main Animated Card Wrapper */}
      <div style={styles.cardContainer}>
        
        {/* Left Panel: Hero Banner with Big Brand Header */}
        <div style={styles.leftPanel}>
          {/* SVG Topographic Accents */}
          <svg style={styles.topoTopLeft} viewBox="0 0 200 200" fill="none">
            <path d="M10 80 Q 50 20 100 60 T 190 20" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <path d="M10 100 Q 60 40 120 80 T 190 50" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="2" />
          </svg>

          <svg style={styles.topoBottomRight} viewBox="0 0 200 200" fill="none">
            <path d="M20 180 Q 80 120 140 160 T 190 100" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <path d="M40 190 Q 90 140 150 170 T 190 120" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="2" />
          </svg>

          {/* Decorative Dot Pattern */}
          <div style={styles.dotGrid}>
            {[...Array(12)].map((_, i) => (
              <span key={i} style={styles.dot}></span>
            ))}
          </div>

          <div style={styles.heroContent}>
            {/* Prominent KotChomnol Branding */}
            <div style={styles.brandContainer}>
              <span style={styles.brandLogoIcon}><Zap size={18} /></span>
              <span style={styles.brandName}>KotChomnol</span>
            </div>

            <h1 style={styles.heroTitle}>Create Account</h1>
            <p style={styles.heroSubtitle}>
              Join KotChomnol today to manage real-time voice recognition, dashboard analytics, and logs effortlessly.
            </p>
          </div>
        </div>

        {/* Right Panel: Dark Mode Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeaderContainer}>
            <h2 style={styles.formHeader}>Sign Up</h2>
            <p style={styles.formSubheader}>Enter your details to create your workspace.</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* First & Last Name */}
            <div style={styles.row}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="dark-pill-input"
                style={styles.pillInput}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="dark-pill-input"
                style={styles.pillInput}
              />
            </div>

            {/* Phone Number */}
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="dark-pill-input"
              style={styles.pillInput}
            />

            {/* Email Address */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="dark-pill-input"
              style={styles.pillInput}
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="dark-pill-input"
              style={styles.pillInput}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Footer Link */}
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  // Dark background directly matching your landing page (#0B0E14)
  pageBackground: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0b0e14',
    backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(126, 34, 206, 0.18) 0%, rgba(11, 14, 20, 1) 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  // Main Card Frame (Dark Glass aesthetic with subtle violet border highlight)
  cardContainer: {
    width: '100%',
    maxWidth: '920px',
    minHeight: '530px',
    backgroundColor: '#121622',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(147, 51, 234, 0.15)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    overflow: 'hidden',
    // Smooth floating entrance animation without motion blur
    animation: 'floatInCenter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  // Left Hero Banner: Dark Violet Gradient
  leftPanel: {
    background: 'linear-gradient(145deg, #2e1065 0%, #1e1b4b 100%)',
    position: 'relative',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: '#ffffff',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  brandLogoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    color: '#c084fc',
    fontSize: '1.2rem',
  },
  brandName: {
    fontSize: '1.6rem', // Significantly bigger KotChomnol text
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#f3e8ff',
  },
  heroSubtitle: {
    fontSize: '0.875rem',
    color: '#c084fc',
    lineHeight: '1.6',
    maxWidth: '300px',
  },
  topoTopLeft: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: '200px',
    height: '200px',
    pointerEvents: 'none',
  },
  topoBottomRight: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: '220px',
    height: '220px',
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    top: '36px',
    right: '36px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 6px)',
    gap: '8px',
    opacity: 0.3,
  },
  dot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#c084fc',
    borderRadius: '50%',
  },
  // Right Form Panel: Slate Dark
  rightPanel: {
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#121622',
  },
  formHeaderContainer: {
    marginBottom: '22px',
  },
  formHeader: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  formSubheader: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  pillInput: {
    width: '100%',
    padding: '12px 18px',
    borderRadius: '30px',
    border: '1px solid #2a324b',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#f1f5f9',
    backgroundColor: '#181d2a',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    marginTop: '6px',
    width: '100%',
    padding: '13px',
    borderRadius: '30px',
    border: 'none',
    background: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 100%)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 8px 20px -4px rgba(147, 51, 234, 0.4)',
    transition: 'all 0.2s ease',
  },
  errorBox: {
    color: '#fca5a5',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginBottom: '12px',
  },
  footerText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.825rem',
    color: '#94a3b8',
  },
  link: {
    color: '#c084fc',
    fontWeight: '700',
    textDecoration: 'none',
  },
};