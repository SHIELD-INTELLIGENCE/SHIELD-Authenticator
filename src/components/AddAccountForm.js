// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

function AddAccountForm({ form, setForm, handleSave, handleQRUpload }) {
  return (
    <div className="addAccount">
      <input
        id="shield-account-name"
        name="accountName"
        className="shield-clean-input"
        placeholder="Account Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        id="shield-account-secret"
        name="accountSecret"
        className="shield-clean-input"
        placeholder="Secret (BASE32)"
        value={form.secret}
        onChange={(e) => setForm({ ...form, secret: e.target.value.replace(/\s/g, '') })}
      />
      <button className="bw-btn" onClick={handleSave}>
        Add Account
      </button>
      <label className="bw-btn">
        Upload QR
        <input
          id="shield-qr-upload"
          name="qrUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleQRUpload}
        />
      </label>
    </div>
  );
}

export default AddAccountForm;
