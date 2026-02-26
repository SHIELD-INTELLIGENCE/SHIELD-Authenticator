import React from "react";

export function LogoutLoadingScreen() {
  return (
    <div className="logout-loading-screen">
      <div className="logout-loading-title">
        Logging out...
        <span className="logout-spinner" />
      </div>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="shield-loading-screen">
      <div className="shield-loading-title">
        <span className="desktop-text">Loading SHIELD-Authenticator</span>
        <span className="mobile-text">
          Loading
          <br />
          SHIELD-Authenticator
        </span>
      </div>
      <span className="shield-spinner" />
    </div>
  );
}
