import React from "react";

const SettingsSidebar = ({ show, onLogout, onClose }) => {
  return (
    <div className={`settings-sidebar${show ? " open" : ""}`}> 
      <button className="close-sidebar" onClick={onClose} title="Close">&times;</button>
      <button className="bw-btn logout-btn" onClick={onLogout}>Logout</button>
    </div>
  );
};

export default SettingsSidebar;
