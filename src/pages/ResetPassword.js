// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyPasswordReset, confirmPasswordResetAction } from "../Utils/services";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const oobCode = params.get("oobCode") || params.get("oobcode");

  const [email, setEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  useEffect(() => {
    if (!oobCode) {
      setError("Missing or invalid code.");
      return;
    }

    verifyPasswordReset(oobCode)
      .then((e) => setEmail(e || ""))
      .catch(() => setEmail(""));
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!oobCode) {
      setError("Missing reset code.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordResetAction(oobCode, newPassword);
      toast.success("Password updated. Please login.");
      navigate('/login', {
        replace: true,
        state: {
          passwordResetSuccess: true,
          passwordResetEmail: email,
        },
      });
    } catch (err) {
      console.error("Password reset confirmation error:", err);
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container">
        <h2 className="high-contrast-text">Set New Password</h2>
        <p style={{ color: '#95a5a6' }}>{email ? `Resetting password for ${email}` : 'Set your new password'}</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            name="newPassword"
            className="shield-clean-input"
            placeholder="New password (min 8 chars)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-label="New password"
            aria-required="true"
          />
          <input
            name="confirmPassword"
            className="shield-clean-input"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label="Confirm password"
            aria-required="true"
            style={{ marginTop: 8 }}
          />
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="bw-btn touch-target" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer' }}>Back to login</button>
        </div>
      </div>
    </div>
  );
}
