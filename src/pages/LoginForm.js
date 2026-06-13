// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TERMS_ACCEPTANCE_KEY_PREFIX = "shield-terms-accepted:v1:";

function isTermsAccepted(email) {
  if (!email) return false;
  try {
    return localStorage.getItem(TERMS_ACCEPTANCE_KEY_PREFIX + email.trim().toLowerCase()) === "true";
  } catch {
    return false;
  }
}

function markTermsAccepted(email) {
  if (!email) return;
  try {
    localStorage.setItem(TERMS_ACCEPTANCE_KEY_PREFIX + email.trim().toLowerCase(), "true");
  } catch {
    // best-effort storage
  }
}

function LoginForm({ form, formErrors, loading, setForm, setFormErrors, handleLogin, loginMessage }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showResetSuccess, setShowResetSuccess] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state?.passwordResetSuccess) {
      setShowResetSuccess(true);
      const timer = setTimeout(() => setShowResetSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
    setShowResetSuccess(false);
    return undefined;
  }, [location.state]);

  useEffect(() => {
    setAgreedToTerms(isTermsAccepted(form.email));
  }, [form.email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    markTermsAccepted(form.email);
    handleLogin();
  };

  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container" role="form" aria-labelledby="shield-login-title">
        <h2 id="shield-login-title" className="high-contrast-text">Welcome Back</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#95a5a6' }}>
          Login to access your totp codes and secure your accounts
        </p>
        {showResetSuccess ? (
          <div className="form-success" role="status" aria-live="polite" style={{ marginBottom: 12 }}>
            Password reset successful. You can log in with your new password now.
          </div>
        ) : null}
        {formErrors.email && <div className="form-error" role="alert">{formErrors.email}</div>}
        <form
          onSubmit={handleSubmit}
          style={{ width: "100%" }}
          aria-label="Login form"
        >
          <input
            id="shield-login-email"
            name="email"
            className="shield-clean-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setFormErrors({ ...formErrors, email: "" });
            }}
            aria-label="Email"
            aria-invalid={!!formErrors.email}
            aria-required="true"
          />
          {/* Honeypot field - invisible to humans, visible to bots */}
          <input
            type="text"
            name="website"
            value={form.website || ''}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />
          {formErrors.password && <div className="form-error" role="alert">{formErrors.password}</div>}
          <div className="password-container">
            <input
              id="shield-login-password"
              name="password"
              className="shield-clean-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setFormErrors({ ...formErrors, password: "" });
              }}
              aria-label="Password"
              aria-invalid={!!formErrors.password}
              aria-required="true"
            />
            <button
              type="button"
              className="password-toggle touch-target"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="terms-checkbox-wrapper" style={{ marginTop: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input
              id="shield-terms-agree"
              name="termsAgreed"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: 3, cursor: "pointer", flexShrink: 0 }}
            />
            <label htmlFor="shield-terms-agree" style={{ color: "#aaa", fontSize: "0.85rem", cursor: "pointer", lineHeight: 1.4 }}>
              I have read and agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#bfa24f", textDecoration: "underline" }}
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Use
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#bfa24f", textDecoration: "underline" }}
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="submit"
              className="bw-btn touch-target"
              aria-label="Login"
              disabled={loading.login || !agreedToTerms}
              style={{ width: '100%', opacity: agreedToTerms ? 1 : 0.6 }}
            >
              {loading.login ? "Logging in..." : "Login"}
            </button>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f1c40f',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Forgot your password? Reset it here
            </button>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#95a5a6' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit',
                padding: '0'
              }}
            >
              Create one here
            </button>
          </div>
        </form>
        {loginMessage && (
          <div 
            className={loginMessage.type === 'error' ? 'form-error' : 'form-success'} 
            role="alert"
            aria-live="assertive"
          >
            {loginMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
