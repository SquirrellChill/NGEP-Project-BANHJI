import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

// Make sure these images exist in your assets folder
import onboarding1 from '../assets/image 1.png';
import onboarding2 from '../assets/image 2.png';
import onboarding3 from '../assets/image 3.png';

const slides = [
  {
    title: "Welcome!\nManage your sales easily",
    description: "Record your daily sales in just a few seconds. Simple, fast and accurate.",
    image: onboarding1,
    alt: "Voice Recording Character"
  },
  {
    title: "Track Your revenues",
    description: "Automatically calculate your sales and view your revenue by day, week, or month.",
    image: onboarding2,
    alt: "Revenue Tracking Illustration"
  },
  {
    title: "All in One Place",
    description: "Keep your sales records organized and easily accessible whenever you need them.",
    image: onboarding3,
    alt: "Shop Illustration"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="onboarding-wrapper">
      {/* Show Skip button only on slides 1 and 2 */}
      <header className="onboarding-header">
        {currentSlide < 2 ? (
          <button onClick={() => navigate('/login')} className="skip-btn">Skip</button>
        ) : (
          <div className="header-spacer" />
        )}
      </header>

      {/* Ambient Sparkles */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-shape shape-4"></div>

      <div className="onboarding-container">
        <div className="illustration-section">
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].alt} 
            className="illustration-img" 
          />
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

          {/* Action buttons visible on Slide 3 */}
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
              <button className="btn-google" onClick={() => alert('Google auth clicked')}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                Login with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}