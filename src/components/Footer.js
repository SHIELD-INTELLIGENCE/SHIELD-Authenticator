// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-section">
          <img src="/shield-logo.png" alt="SHIELD" className="footer-logo" />
          <p className="footer-tagline">
            Securing Tomorrow with Strategic Intelligence
          </p>
        </div>
        <div className="footer-section">
          <h4>SHIELD Intelligence</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://shieldintelligence.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                Corporate Website
              </a>
            </li>
            <li>
              <a
                href="https://shieldintelligence.in/request-service"
                target="_blank"
                rel="noopener noreferrer"
              >
                Request a Service
              </a>
            </li>
            <li>
              <a
                href="https://shieldintelligence.in/#contact-section"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="/terms" rel="noopener noreferrer">
                Terms of Use
              </a>
            </li>
            <li>
              <a href="/terms" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 SHIELD Intelligence. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
