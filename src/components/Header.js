// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

function Header({ isMobile, mobileMenuOpen, setMobileMenuOpen, handleLogin, handleRegister }) {
  return (
    <header className="landing-header">
      <div className="landing-header-content">
        <img
          src="/shield-logo.png"
          alt="SHIELD Intelligence"
          className="company-logo"
        />
        <div className="header-text">
          <h1 style={{ textAlign: "left"}}>SHIELD Intelligence</h1>
          <p className="tagline">
            Spies Hub for Intelligence, Elegance, Learning, and Defence
          </p>
        </div>
        <div className="header-actions">
          {!isMobile ? (
            <>
              <button
                className="header-btn-secondary"
                onClick={handleLogin}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  marginLeft: "auto",
                }}
              >
                Login
              </button>
              <button
                className="header-btn-primary"
                onClick={handleRegister}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#3498db",
                  border: "none",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
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
                backgroundColor: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "8px 12px",
                cursor: "pointer",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                marginLeft: "auto",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "white",
                }}
              ></span>
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "white",
                }}
              ></span>
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "white",
                }}
              ></span>
            </button>
          )}
        </div>
      </div>
      {isMobile && mobileMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-item" onClick={handleLogin}>
            Login
          </button>
          <button className="mobile-menu-item" onClick={handleRegister}>
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
