// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";

function EditAccountDialog({ editing, setEditing, form, setForm, handleSave }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setEditing(null);
        setForm({ name: "", secret: "" });
      }
    };
    if (editing) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [editing, setEditing, setForm]);

  if (!editing) return null;

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: "", secret: "" });
  };

  const handleSaveAndClose = async () => {
    await handleSave();
  };

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="edit-dialog-header">
          <h3>Edit Account</h3>
          <button className="edit-dialog-close" onClick={handleCancel} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        <div className="edit-dialog-body">
          <input
            id="shield-edit-name"
            name="editName"
            className="shield-clean-input"
            placeholder="Account Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            id="shield-edit-secret"
            name="editSecret"
            className="shield-clean-input"
            placeholder="Secret (BASE32)"
            value={form.secret}
            onChange={(e) => setForm({ ...form, secret: e.target.value.replace(/\s/g, '') })}
          />
        </div>
        <div className="edit-dialog-footer">
          <button className="bw-btn" onClick={handleSaveAndClose}>
            Save Changes
          </button>
          <button className="bw-btn danger" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAccountDialog;
