// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";

const SettingsPage = ({ user, onLogout, onBack, openConfirm, maskCodes, setMaskCodes }) => {
  const handleLogoutClick = () => {
    if (openConfirm) {
      openConfirm({
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        onConfirm: onLogout,
      });
    } else {
      onLogout && onLogout();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onBack]);

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button 
          className="back-button" 
          onClick={onBack}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Back
        </button>
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h2>Account</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-label">Email</span>
              <span className="settings-value">{user?.email || 'Not available'}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Display</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-label">Show Codes</span>
              <span className="settings-value">{maskCodes ? 'Hidden' : 'Visible'}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!maskCodes}
                onChange={(e) => setMaskCodes && setMaskCodes(!e.target.checked)}
                aria-label="Toggle code visibility"
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Actions</h2>
          <button className="settings-logout-btn" onClick={handleLogoutClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
