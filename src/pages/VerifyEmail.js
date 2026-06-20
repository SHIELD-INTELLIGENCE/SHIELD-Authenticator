// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../Utils/firebase";
import { sendVerificationEmail, reloadUser } from "../Utils/services";

function VerifyEmail({ onLogout, onVerificationDone }) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const intervalRef = useRef(null);

  const user = auth.currentUser;
  const email = user?.email || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      intervalRef.current = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setStatus(null);
    try {
      await sendVerificationEmail(user);
      setResendCooldown(60);
      setStatus({ type: "success", text: "Verification email sent. Please check your inbox." });
    } catch (err) {
      console.error("Resend verification error:", err);
      setStatus({ type: "error", text: "Failed to send verification email. Please try again." });
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    setStatus(null);
    try {
      await reloadUser(user);
      if (user.emailVerified) {
        setStatus({ type: "success", text: "Email verified! Loading your account..." });
        onVerificationDone?.();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus({ type: "error", text: "Email not verified yet. Please check your inbox and click the verification link." });
      }
    } catch (err) {
      console.error("Check verification error:", err);
      setStatus({ type: "error", text: "Failed to check verification status. Please try again." });
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
  };

  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container" role="form" aria-labelledby="shield-verify-title">
        <h2 id="shield-verify-title" className="high-contrast-text">Verify Your Email</h2>
        <p style={{ textAlign: 'center', marginBottom: '16px', color: '#95a5a6' }}>
          We sent a verification link to
        </p>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#f0f0f0', fontWeight: 600, fontSize: '1.1rem' }}>
          {email}
        </p>

        <div style={{ background: "#13151a", border: "1px solid #1f2230", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ color: "#a6a6a6", margin: 0, fontSize: ".9rem", lineHeight: 1.5 }}>
            Please check your inbox and click the verification link to activate your account. 
            If you don't see the email, check your spam or junk folder.
          </p>
        </div>

        {status && (
          <div
            className={status.type === 'error' ? 'form-error' : 'form-success'}
            role="alert"
            aria-live="assertive"
          >
            {status.text}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <button
            className="bw-btn"
            onClick={handleCheckVerification}
            disabled={checking}
            style={{ width: '100%' }}
          >
            {checking ? "Checking..." : "I've verified — continue"}
          </button>

          <button
            className="bw-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            style={{ width: '100%', opacity: resendCooldown > 0 ? 0.6 : 1 }}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend verification email"}
          </button>

          <button
            className="bw-btn danger"
            onClick={handleSignOut}
            style={{ width: '100%', marginTop: 8 }}
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
