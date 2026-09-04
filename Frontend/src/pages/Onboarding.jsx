import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchAssistantAvatar from '../components/stitch/StitchAssistantAvatar';
import './Onboarding.css';

const slides = [
  {
    title: "Welcome!\nManage your sales easily",
    description: "Record daily sales in a few seconds with the same voice-first flow used in the dashboard.",
  },
  {
    title: "Track Your revenues",
    description: "View revenue by day, week, or month with simple cards and summary tables.",
  },
  {
    title: "All in One Place",
    description: "Keep your profile, history, transactions, and voice tools in one protected workspace.",
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="onboarding-wrapper">
      <header className="onboarding-header">
        {currentSlide < 2 ? (
          <button onClick={() => navigate('/login')} className="skip-btn">Skip</button>
        ) : (
          <div className="header-spacer" />
        )}
      </header>

      <div className="onboarding-container">
        <div className="illustration-section">
          <StitchAssistantAvatar size="lg" />
        </div>

        <div className="content-section">
          <h1 className="headline">
            {slides[currentSlide].title.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx === 0 && slides[currentSlide].title.includes('\n') && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="description">
            {slides[currentSlide].description}
          </p>

          <div className="pagination">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {currentSlide === 2 && (
            <div className="slide3-actions">
              <div className="auth-btn-row">
                <button className="btn-outline" onClick={() => navigate('/register')}>
                  Register
                </button>
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
