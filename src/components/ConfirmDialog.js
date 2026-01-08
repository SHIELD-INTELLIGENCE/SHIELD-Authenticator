import React from "react";

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={handleBackdropClick}>
      <div className="confirm-dialog">
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="bw-btn danger" onClick={onConfirm}>{confirmLabel}</button>
          <button className="bw-btn" onClick={onCancel}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
