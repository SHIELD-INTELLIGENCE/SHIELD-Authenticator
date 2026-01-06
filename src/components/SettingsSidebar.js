// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

const SettingsSidebar = ({ show, onLogout, onClose, openConfirm }) => {
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

  return (
    <div className={`settings-sidebar${show ? " open" : ""}`}> 
      <button className="close-sidebar" onClick={onClose} title="Close">&times;</button>
      <button className="bw-btn logout-btn" onClick={handleLogoutClick}>Logout</button>
    </div>
  );
};

export default SettingsSidebar;
