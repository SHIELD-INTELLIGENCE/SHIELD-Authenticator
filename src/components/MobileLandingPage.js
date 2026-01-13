// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';

function MobileLandingPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const pages = [
    {
      title: "Welcome to SHIELD",
      subtitle: "Authenticator",
      description: "Military-grade two-factor authentication for ultimate account security",
      icon: (
        <img 
          src="/icon-192.png" 
          alt="SHIELD Authenticator" 
          style={{ width: '80px', height: '80px', borderRadius: '16px' }}
        />
      )
    },
    {
      title: "Proudly Developed",
      subtitle: "& Maintained by SHIELD",
      description: "Built by the developers at SHIELD Intelligence with dedication to security and excellence",
      icon: (
        <img 
          src="/shield-logo.png" 
          alt="SHIELD Intelligence" 
          style={{ width: '100px', height: '100px', objectFit: 'contain' }}
        />
      ),
      hasButton: true
    },
    {
      title: "Encrypted Vault",
      subtitle: "Your Security, Your Control",
      description: "Store your accounts in an encrypted vault with a passphrase only you know",
      icon: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
        </svg>
      )
    },
    {
      title: "Easy Setup",
      subtitle: "Get Started in Seconds",
      description: "Scan QR codes or manually add accounts. Generate secure codes instantly",
      icon: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 8h2v2h-2v-2zm2 0h2v2h-2v-2zm2 0h2v2h-2v-2z"/>
        </svg>
      )
    },
    {
      title: "Ready to Start?",
      subtitle: "Join SHIELD Today",
      description: "Create your account and secure all your online services",
      icon: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      isLast: true
    }
  ];

  const handleLearnMore = () => {
    window.open('https://shieldintelligence.in', '_blank');
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
    
    if (isRightSwipe && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGetStarted = () => {
    // Mark that user has seen mobile landing
    localStorage.setItem('shield-mobile-landing-seen', 'true');
    navigate("/register");
  };

  const handleSkip = () => {
    // Mark that user has seen mobile landing
    localStorage.setItem('shield-mobile-landing-seen', 'true');
    navigate("/login");
  };

  // Handle Android back button
  useEffect(() => {
    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (currentPage > 0) {
        // Navigate to previous onboarding page
        setCurrentPage(currentPage - 1);
      } else if (!canGoBack) {
        // On first page, exit app or minimize
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handleBackButton.remove();
    };
  }, [currentPage]);

  const currentPageData = pages[currentPage];

  return (
    <div 
      className="mobile-landing-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Skip button - only show on non-last pages */}
      {!currentPageData.isLast && (
        <button className="mobile-skip-button" onClick={handleSkip}>
          Skip
        </button>
      )}

      {/* Main content */}
      <div className="mobile-landing-content">
        {/* Icon */}
        <div className="mobile-landing-icon">
          {currentPageData.icon}
        </div>

        {/* Title and subtitle */}
        <div className="mobile-landing-text">
          <h1 className="mobile-landing-title">{currentPageData.title}</h1>
          <h2 className="mobile-landing-subtitle">{currentPageData.subtitle}</h2>
          <p className="mobile-landing-description">{currentPageData.description}</p>
          
          {/* Learn More button for developer page */}
          {currentPageData.hasButton && (
            <button className="mobile-learn-more-button" onClick={handleLearnMore}>
              Learn More About SHIELD
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '8px' }}>
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Page indicators */}
        <div className="mobile-page-indicators">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`mobile-page-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mobile-landing-navigation">
          {currentPageData.isLast ? (
            <button className="mobile-get-started-button" onClick={handleGetStarted}>
              <span>Get Started</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </button>
          ) : (
            <button className="mobile-next-button" onClick={handleNext}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileLandingPage;
