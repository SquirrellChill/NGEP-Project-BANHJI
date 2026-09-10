import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthCard({
  title,
  subtitle,
  badge = 'KOTCHOMNOL',
  icon,
  backTo = '/',
  backLabel = 'Back to Home',
  children,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0914',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Back button above card */}
      <div style={{ maxWidth: '960px', width: '100%', marginBottom: '16px' }}>
        <Link
          to={backTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1b1730',
            color: '#c4c1db',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #2d284a',
          }}
        >
          ← {backLabel}
        </Link>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: '960px',
          width: '100%',
          backgroundColor: '#141124',
          borderRadius: '24px',
          border: '1px solid #262143',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
        }}
      >
        {/* Left Side Purple Card */}
        <div
          style={{
            flex: '1 1 320px',
            background: 'linear-gradient(160deg, #44217d 0%, #201547 50%, #150f30 100%)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
              }}
            >
              {icon || (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.12em',
                color: '#b6a6e8',
                textTransform: 'uppercase',
              }}
            >
              {badge}
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 12px', color: '#ffffff' }}>
              {title}
            </h2>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#cec8ea', margin: 0 }}>
              {subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9891be',
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Encrypted & Secure authentication
          </div>
        </div>

        {/* Right Side Form Content */}
        <div
          style={{
            flex: '1 1 440px',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}