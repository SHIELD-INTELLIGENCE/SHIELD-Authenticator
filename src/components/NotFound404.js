// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound404() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleGoHome = () => {
    window.scrollTo(0, 0);
    navigate("/");
  };

  const handleGoLogin = () => {
    window.scrollTo(0, 0);
    navigate("/login");
  };

  return (
    <div className="not-found-404-page">
      <header className="landing-header">
        <div className="landing-header-content">
          <img 
            src="/shield-logo.png" 
            alt="SHIELD Intelligence" 
            className="company-logo"
          />
          <div className="header-text">
            <h1>SHIELD Intelligence</h1>
            <p className="tagline">Spies Hub for Intelligence, Elegance, Learning, and Defence</p>
          </div>
          <div className="header-actions">
            <button 
              className="header-btn-secondary" 
              onClick={handleGoHome}
              style={{
                padding: '8px 20px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Home
            </button>
            <button 
              className="header-btn-primary" 
              onClick={handleGoLogin}
              style={{
                padding: '8px 20px',
                backgroundColor: '#3498db',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <section className="not-found-hero">
        <div className="not-found-content">
          <div className="error-code-container">
            <h1 className="error-code">404</h1>
            <div className="error-icon">
            </div>
          </div>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-description">
            Oops! The page you're looking for seems to have vanished into the digital void. 
            It might have been moved, deleted, or never existed in the first place.
          </p>

          <div className="error-suggestions">
            <h3>What can you do?</h3>
            <ul>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Go back to the<strong>home page</strong>and start fresh
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <strong>Login or register</strong>to access your dashboard
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Check the URL and make sure it's<strong>correct</strong>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Visit our <strong><a href="https://shieldintelligence.in" target="_blank" rel="noopener noreferrer">corporate website</a></strong> for more information
              </li>
            </ul>
          </div>

          <div className="error-actions">
            <button className="cta-button" onClick={handleGoHome}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/>
              </svg>
              Back to Home
            </button>
            <button 
              className="cta-button-secondary" 
              onClick={handleGoLogin}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: 'transparent',
                border: '2px solid #3498db',
                color: '#3498db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              Sign In
            </button>
          </div>

          <div className="error-code-visual">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="95" stroke="rgba(202, 169, 76, 0.2)" strokeWidth="2" />
              <path d="M 60 70 L 140 130" stroke="rgba(202, 169, 76, 0.3)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 140 70 L 60 130" stroke="rgba(202, 169, 76, 0.3)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/shield-logo.png" alt="SHIELD" className="footer-logo" />
            <p className="footer-tagline">Securing Tomorrow with Strategic Intelligence</p>
          </div>
          <div className="footer-section">
            <h4>SHIELD Intelligence</h4>
            <ul className="footer-links">
              <li><a href="https://shieldintelligence.in" target="_blank" rel="noopener noreferrer">Corporate Website</a></li>
              <li><a href="https://shieldintelligence.in/request-service" target="_blank" rel="noopener noreferrer">Request a Service</a></li>
              <li><a href="https://shieldintelligence.in/#contact-section" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="/terms.html" rel="noopener noreferrer">Terms of Use</a></li>
              <li><a href="/terms.html" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SHIELD Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default NotFound404;
