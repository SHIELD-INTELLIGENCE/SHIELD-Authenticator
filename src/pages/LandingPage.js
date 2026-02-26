// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <div className="landing-page" style={{ textAlign: "center" }}>
      <Header
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />

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
            Military-grade two-factor authentication for ultimate account
            security and End-to-End Encryption
          </p>
          <div
            className="trust-badges"
            aria-label="Security and transparency highlights"
          >
            <span className="trust-badge">Zero-Trust Architecture</span>
            <span className="trust-badge">
              Source-Available (No Redistribution)
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="cta-button" onClick={handleRegister}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Get Started Free
            </button>
            <button className="cta-button-secondary" onClick={handleLogin}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              Login
            </button>
          </div>
          <div className="hero-downloads" aria-label="Download options">
            <a
              className="store-badge archive-badge"
              href="https://download.shieldintelligence.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download SHIELD Authenticator from the SHIELD Archive"
            >
              <span className="store-badge-icon" aria-hidden="true">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1zM5 19h14v2H5v-2z" />
                </svg>
              </span>
              <span className="store-badge-text">
                <span className="store-badge-top"> Download From</span>
                <span className="store-badge-bottom">SHIELD App Archive</span>
              </span>
            </a>
            <a
              className="store-badge github-badge"
              href="https://github.com/SHIELD-INTELLIGENCE/SHIELD-Authenticator/releases"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get SHIELD Authenticator on GitHub releases"
            >
              <span className="store-badge-icon" aria-hidden="true">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .5a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.84 2.84 1.31 3.53 1 .11-.78.43-1.31.78-1.61-2.66-.31-5.46-1.34-5.46-5.96 0-1.32.47-2.4 1.24-3.25-.12-.31-.54-1.57.12-3.27 0 0 1.01-.32 3.3 1.24a11.43 11.43 0 016 0c2.29-1.56 3.29-1.24 3.29-1.24.66 1.7.24 2.96.12 3.27.77.85 1.24 1.93 1.24 3.25 0 4.63-2.8 5.65-5.48 5.95.44.38.83 1.13.83 2.29v3.39c0 .32.22.69.82.58A12 12 0 0012 .5z" />
                </svg>
              </span>
              <span className="store-badge-text">
                <span className="store-badge-top">GET IT ON</span>
                <span className="store-badge-bottom">GitHub</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose SHIELD Authenticator?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <h3>Military-Grade Security with End-to-End Encryption</h3>
            <p>
              End-to-end encryption with secure vault technology protects your
              authentication codes with a zero-trust, zero-knowledge approach.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
              </svg>
            </div>
            <h3>Encrypted Vault</h3>
            <p>
              Your accounts are stored in an encrypted vault with a passphrase
              only you know. Complete privacy and control.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
              </svg>
            </div>
            <h3>Cross-Platform</h3>
            <p>
              Access your codes anywhere - web browser or mobile app. Your
              encrypted data syncs securely across all devices after your first
              successful cloud sync.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </div>
            <h3>Time-Based Codes</h3>
            <p>
              Generate secure TOTP codes that refresh every 30 seconds, ensuring
              maximum security for your accounts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 8h2v2h-2v-2zm2 0h2v2h-2v-2zm2 0h2v2h-2v-2z" />
              </svg>
            </div>
            <h3>QR Code Support</h3>
            <p>
              Easily add accounts by scanning QR codes or manually entering
              secret keys. Simple setup in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <h3>Offline Access</h3>
            <p>
              Generate codes without internet after one successful online sync
              on this device. Status shows as "offline, but ready" when cached.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" />
              </svg>
            </div>
            <h3>Encrypted CSV Backup</h3>
            <p>
              Export and import your accounts via CSV with optional encryption,
              so you can keep secure backups and migrate safely.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 7h2v-1.07c1.14-.24 2-.95 2-1.93 0-1.28-1.07-1.93-2.5-2.3-1.22-.32-1.5-.6-1.5-1.02 0-.49.45-.83 1.2-.83.82 0 1.13.39 1.2.95h1.78c-.09-.86-.56-1.68-1.68-2.02V9h-2v.74c-1.14.24-2 .98-2 2.02 0 1.25.98 1.9 2.5 2.26 1.27.3 1.5.68 1.5 1.07 0 .3-.22.78-1.2.78-.92 0-1.28-.41-1.33-.95H9.7c.06 1.1.88 1.72 2.3 1.98V18z" />
              </svg>
            </div>
            <h3>Account Recovery Options</h3>
            <p>
              Set recovery questions for your vault to help you regain access if
              you ever forget your vault passphrase.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6zm0 9c1.93 0 3.5-1.57 3.5-3.5S13.93 8 12 8s-3.5 1.57-3.5 3.5S10.07 15 12 15zm0-2c-.83 0-1.5-.67-1.5-1.5S11.17 10 12 10s1.5.67 1.5 1.5S12.83 13 12 13z" />
              </svg>
            </div>
            <h3>Privacy Controls</h3>
            <p>
              Mask your codes when needed and copy instantly—designed for safe
              use in public spaces and on shared screens.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h-2V7h2v6zm0 4h-2v-2h2v2z" />
              </svg>
            </div>
            <h3>Secure Device Convenience</h3>
            <p>
              Optionally remember your vault passphrase on trusted devices to
              unlock faster—without weakening your vault protection.
            </p>
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
              <p>
                Sign up with your email and create a secure password. Your
                account is protected by SHIELD's advanced security protocols.
              </p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Use a unique, strong password you
                don't use anywhere else. Consider using a password manager.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Setup Your Vault</h3>
              <p>
                Choose a strong passphrase for your encrypted vault. Set up
                recovery questions to ensure you can regain access if needed.
              </p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Always set up recovery questions!
                They're your safety net if you forget your vault passphrase.
                Choose answers only you would know.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Add Your Accounts</h3>
              <p>
                Scan a QR code or manually enter the secret key from services
                like Google, GitHub, Facebook, or any service supporting TOTP
                authentication.
              </p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Export a backup of your accounts
                regularly. Store the encrypted backup in a secure location for
                disaster recovery.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Generate Secure Codes</h3>
              <p>
                View your time-based codes that refresh every 30 seconds. Copy
                and paste them when logging into your accounts for that extra
                layer of security.
              </p>
              <div className="pro-tip">
                <strong>Pro Tip:</strong> Use the search feature to quickly find
                accounts. Enable code masking for added privacy when using the
                app in public.
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
                <strong>SHIELD</strong> — Spies Hub for Intelligence, Elegance,
                Learning, and Defence — is a technology company dedicated to
                building the world's most secure and user-friendly digital
                products. We believe that security and privacy should never come
                at the cost of usability.
              </p>

              <p>
                Founded with a vision to democratize military-grade security for
                everyone, we create innovative software solutions that protect
                what matters most to you. Our flagship authentication platform,
                along with our suite of secure productivity tools, are designed
                with zero-knowledge architecture—meaning your data is encrypted
                in ways that even we cannot access.
              </p>

              <p>
                Every product we build follows the same philosophy:
                uncompromising security, elegant design, and intuitive user
                experience. We're not just building apps; we're crafting digital
                fortresses that are as beautiful as they are secure.
              </p>
            </div>

            <div className="services-box">
              <h3>What We Build</h3>
              <ul className="services-list">
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Secure authentication systems
                </li>
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Encrypted productivity tools
                </li>
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Privacy-first mobile applications
                </li>
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Zero-knowledge data solutions
                </li>
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Cross-platform security software
                </li>
                <li>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                <h4>Security First</h4>
                <p>
                  Every decision starts with security. No compromises, no
                  shortcuts, no exceptions.
                </p>
              </div>
              <div className="value-item">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
                </svg>
                <h4>Privacy by Design</h4>
                <p>
                  Zero-knowledge architecture means your data belongs to you
                  alone
                </p>
              </div>
              <div className="value-item">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h4>User-Centric Design</h4>
                <p>
                  Powerful security that's simple and elegant to use for
                  everyone
                </p>
              </div>
              <div className="value-item">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm0-4h2v2h-2v-2zm-4-4h2v2h-2V6zM6 6h2v2H6V6zm4 4h4v2h-4v-2z" />
                </svg>
                <h4>Transparency</h4>
                <p>Open about our methods, honest about our limitations</p>
              </div>
              <div className="value-item">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z" />
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
          <p>
            Join thousands of users protecting their accounts with SHIELD
            Authenticator
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "30px",
            }}
          >
            <button className="cta-button-large" onClick={handleRegister}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: "10px" }}
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Create Free Account
            </button>
            <button
              className="cta-button-large-secondary"
              onClick={handleLogin}
            >
              Login to Your Account
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
