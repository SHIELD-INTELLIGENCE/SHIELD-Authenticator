// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordReset } from "../Utils/services";
import ConfirmDialog from "../components/ConfirmDialog";

const RATE_LIMIT_KEY = "shield-password-reset-rate-limit:v1";
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const BACKOFF_THRESHOLD_MS = 5 * 60 * 1000;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function safeReadRateState() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { requests: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.requests)) return { requests: [] };
    return { requests: parsed.requests.filter((item) => item && typeof item.ts === "number" && typeof item.email === "string") };
  } catch {
    return { requests: [] };
  }
}

function safeWriteRateState(state) {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
  } catch {
    // If storage is blocked, fall back to in-memory only by doing nothing.
  }
}

function getRateLimitSnapshot(email) {
  const now = Date.now();
  const normalized = normalizeEmail(email);
  const state = safeReadRateState();
  const recent = state.requests.filter((item) => now - item.ts <= RATE_WINDOW_MS);
  const emailRecent = recent.filter((item) => item.email === normalized);
  const lastAttempt = recent.length ? Math.max(...recent.map((item) => item.ts)) : 0;
  const retryAt = recent.length >= MAX_REQUESTS_PER_WINDOW ? Math.max(lastAttempt + BACKOFF_THRESHOLD_MS, recent[0].ts + RATE_WINDOW_MS) : 0;

  return {
    state: { requests: recent },
    emailRecentCount: emailRecent.length,
    totalRecentCount: recent.length,
    retryAt,
  };
}

function recordRateLimitAttempt(email) {
  const now = Date.now();
  const normalized = normalizeEmail(email);
  const state = safeReadRateState();
  const recent = state.requests.filter((item) => now - item.ts <= RATE_WINDOW_MS);
  recent.push({ email: normalized, ts: now });
  safeWriteRateState({ requests: recent.slice(-20) });
}

function formatCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [cooldownUntil, setCooldownUntil] = React.useState(0);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const snapshot = getRateLimitSnapshot(email);
    setCooldownUntil(snapshot.retryAt);
  }, [email]);

  React.useEffect(() => {
    if (!cooldownUntil) return undefined;
    const timer = setInterval(() => {
      const snapshot = getRateLimitSnapshot(email);
      setCooldownUntil(snapshot.retryAt);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = String(email || "").trim();
    if (!trimmed) {
      setError("Please enter your email address");
      return;
    }

    const snapshot = getRateLimitSnapshot(trimmed);
    if (snapshot.totalRecentCount >= MAX_REQUESTS_PER_WINDOW || snapshot.emailRecentCount >= MAX_REQUESTS_PER_WINDOW) {
      const waitMs = Math.max(snapshot.retryAt - Date.now(), 0);
      setCooldownUntil(snapshot.retryAt);
      setError(`Too many reset attempts. Please wait ${formatCooldown(waitMs)} and try again.`);
      return;
    }

    setLoading(true);
    try {
      // actionCodeSettings optional; on web we simply send the link that points
      // back to app's /reset-password route. If you need mobile deep links, configure in Firebase console.
      const actionCodeSettings = {
        url: window.location.origin + "/reset-password",
        handleCodeInApp: false,
      };
      await sendPasswordReset(trimmed, actionCodeSettings);
      recordRateLimitAttempt(trimmed);
      setCooldownUntil(getRateLimitSnapshot(trimmed).retryAt);
      // Show a neutral popup so we do not reveal whether the email exists.
      setSuccessDialogOpen(true);
    } catch (err) {
      recordRateLimitAttempt(trimmed);
      setCooldownUntil(getRateLimitSnapshot(trimmed).retryAt);
      // Keep the same neutral popup even if the underlying request fails.
      setSuccessDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container">
        <h2 className="high-contrast-text">Reset Password</h2>
        <p style={{ color: '#95a5a6' }}>Enter your account email and we'll send a password reset link.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        {cooldownUntil > Date.now() ? (
          <div className="form-error" role="status" aria-live="polite">
            Reset requests are temporarily limited. Try again in {formatCooldown(cooldownUntil - Date.now())}.
          </div>
        ) : null}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            name="email"
            className="shield-clean-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            aria-required="true"
          />
          <div style={{ marginTop: 12 }}>
            <button
              type="submit"
              className="bw-btn touch-target"
              disabled={loading || cooldownUntil > Date.now()}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : cooldownUntil > Date.now() ? `Wait ${formatCooldown(cooldownUntil - Date.now())}` : 'Send reset link'}
            </button>
          </div>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer' }}>Back to login</button>
        </div>
      </div>

      <ConfirmDialog
        open={successDialogOpen}
        title="Check your email"
        message="If that email exists, a reset link has been sent. Use the link to set a new password, then return here to log in."
        onConfirm={() => {
          setSuccessDialogOpen(false);
          navigate('/login', { replace: true });
        }}
        onCancel={() => {
          setSuccessDialogOpen(false);
          navigate('/login', { replace: true });
        }}
        confirmLabel="OK"
        showCancel={false}
        closeOnBackdrop={false}
      />
    </div>
  );
}
