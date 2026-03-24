import React from "react";

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  showCancel = true,
  closeOnBackdrop = true,
}) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
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
          {showCancel ? <button className="bw-btn" onClick={onCancel}>{cancelLabel}</button> : null}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
