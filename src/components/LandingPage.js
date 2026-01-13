// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    window.scrollTo(0, 0);
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    window.scrollTo(0, 0);
    navigate("/register");
    setMobileMenuOpen(false);
  };

  return (
    <div className="landing-page">
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
            {!isMobile ? (
              <>
                <button 
                  className="header-btn-secondary" 
                  onClick={handleLogin}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    marginLeft: 'auto'
                  }}
                >
                  Login
                </button>
                <button 
                  className="header-btn-primary" 
                  onClick={handleRegister}
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
                  Sign Up
                </button>
              </>
            ) : null}
            {isMobile && (
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginLeft: 'auto'
                }}
              >
                <span style={{ width: '20px', height: '2px', backgroundColor: 'white' }}></span>
                <span style={{ width: '20px', height: '2px', backgroundColor: 'white' }}></span>
                <span style={{ width: '20px', height: '2px', backgroundColor: 'white' }}></span>
              </button>
            )}
          </div>
        </div>
        {isMobile && mobileMenuOpen && (
          <div className="mobile-menu">
            <button className="mobile-menu-item" onClick={handleLogin}>Login</button>
            <button className="mobile-menu-item" onClick={handleRegister}>Sign Up</button>
          </div>
        )}
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="app-icon-container">
            <img 
              src="/icon-192.png" 
              alt="SHIELD Authenticator" 
              className="app-icon-large"
            />
          </div>
          <h1 className="hero-title">SHIELD Authenticator</h1>
          <p className="hero-subtitle">
            Military-grade two-factor authentication for ultimate account security
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="cta-button" onClick={handleRegister}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Get Started Free
            </button>
            <button 
              className="cta-button-secondary" 
              onClick={handleLogin}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              Login
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose SHIELD Authenticator?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <h3>Military-Grade Security</h3>
            <p>Bank-level encryption with secure vault technology protects your authentication codes with zero knowledge architecture.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
              </svg>
            </div>
            <h3>Encrypted Vault</h3>
            <p>Your accounts are stored in an encrypted vault with a passphrase only you know. Complete privacy and control.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
            </div>
            <h3>Cross-Platform</h3>
            <p>Access your codes anywhere - web browser or mobile app. Your encrypted data syncs securely across all devices.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
              </svg>
            </div>
            <h3>Time-Based Codes</h3>
            <p>Generate secure TOTP codes that refresh every 30 seconds, ensuring maximum security for your accounts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 8h2v2h-2v-2zm2 0h2v2h-2v-2zm2 0h2v2h-2v-2z"/>
              </svg>
            </div>
            <h3>QR Code Support</h3>
            <p>Easily add accounts by scanning QR codes or manually entering secret keys. Simple setup in seconds.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3>Offline Access</h3>
            <p>Generate codes even without internet connection. Your vault works anywhere, anytime.</p>
          </div>
        </div>
      </section>

      <section className="how-to-section">
        <h2 className="section-title">How to Use SHIELD Authenticator</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Account</h3>
              <p>Sign up with your email and create a secure password. Your account is protected by SHIELD's advanced security protocols.</p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Use a unique, strong password you don't use anywhere else. Consider using a password manager.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Setup Your Vault</h3>
              <p>Choose a strong passphrase for your encrypted vault. Set up recovery questions to ensure you can regain access if needed.</p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Always set up recovery questions! They're your safety net if you forget your vault passphrase. Choose answers only you would know.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Add Your Accounts</h3>
              <p>Scan a QR code or manually enter the secret key from services like Google, GitHub, Facebook, or any service supporting TOTP authentication.</p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Export a backup of your accounts regularly. Store the encrypted backup in a secure location for disaster recovery.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Generate Secure Codes</h3>
              <p>View your time-based codes that refresh every 30 seconds. Copy and paste them when logging into your accounts for that extra layer of security.</p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Use the search feature to quickly find accounts. Enable code masking for added privacy when using the app in public.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2 className="section-title">About SHIELD Intelligence</h2>
          <div className="about-grid">
            <div className="about-text">
              <p className="about-intro">
                <strong>SHIELD</strong> — Spies Hub for Intelligence, Elegance, Learning, and Defence — is a technology company 
                dedicated to building the world's most secure and user-friendly digital products. We believe that security and 
                privacy should never come at the cost of usability.
              </p>
              
              <p>
                Founded with a vision to democratize military-grade security for everyone, we create innovative software solutions 
                that protect what matters most to you. Our flagship authentication platform, along with our suite of secure productivity 
                tools, are designed with zero-knowledge architecture—meaning your data is encrypted in ways that even we cannot access.
              </p>

              <p>
                Every product we build follows the same philosophy: uncompromising security, elegant design, and intuitive user experience. 
                We're not just building apps; we're crafting digital fortresses that are as beautiful as they are secure.
              </p>
            </div>

            <div className="services-box">
              <h3>What We Build</h3>
              <ul className="services-list">
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Secure authentication systems
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Encrypted productivity tools
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Privacy-first mobile applications
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Zero-knowledge data solutions
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Cross-platform security software
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Enterprise-grade encryption tools
                </li>
              </ul>
            </div>
          </div>

          <div className="values-section">
            <h3>Our Core Values</h3>
            <div className="values-grid">
              <div className="value-item">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <h4>Security First</h4>
                <p>Every decision starts with security. No compromises, no shortcuts, no exceptions.</p>
              </div>
              <div className="value-item">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
                </svg>
                <h4>Privacy by Design</h4>
                <p>Zero-knowledge architecture means your data belongs to you alone</p>
              </div>
              <div className="value-item">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h4>User-Centric Design</h4>
                <p>Powerful security that's simple and elegant to use for everyone</p>
              </div>
              <div className="value-item">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm0-4h2v2h-2v-2zm-4-4h2v2h-2V6zM6 6h2v2H6V6zm4 4h4v2h-4v-2z"/>
                </svg>
                <h4>Transparency</h4>
                <p>Open about our methods, honest about our limitations</p>
              </div>
              <div className="value-item">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/>
                </svg>
                <h4>Continuous Innovation</h4>
                <p>Constantly evolving to stay ahead of emerging threats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Digital Life?</h2>
          <p>Join thousands of users protecting their accounts with SHIELD Authenticator</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
            <button className="cta-button-large" onClick={handleRegister}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '10px' }}>
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create Free Account
            </button>
            <button 
              className="cta-button-large-secondary" 
              onClick={handleLogin}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '700',
                backgroundColor: 'transparent',
                border: '2px solid #3498db',
                color: '#3498db',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Login to Your Account
            </button>
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

export default LandingPage;
