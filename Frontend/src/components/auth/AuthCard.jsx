import React from 'react';
import './AuthCard.css';

export const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Branding Side */}
        <div className="auth-banner">
          <div className="banner-content">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {/* Decorative shapes can be SVG vectors or background patterns */}
        </div>

        {/* Right Form Side */}
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};