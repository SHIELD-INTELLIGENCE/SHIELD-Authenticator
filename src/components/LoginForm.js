// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import React from "react";

function LoginForm({ form, formErrors, loading, setForm, setFormErrors, handleLogin, handleRegister }) {
  return (
    <div className="login-form-outer">
      <div className="shield-login-container" role="form" aria-labelledby="shield-login-title">
        <h2 id="shield-login-title">SHIELD-Authenticator Login / Register</h2>
        <input
          id="shield-login-email"
          className="shield-clean-input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            setFormErrors({ ...formErrors, email: "" });
          }}
          aria-label="Email"
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? "shield-login-email-error" : undefined}
        />
        {formErrors.email && (
          <div className="form-error" id="shield-login-email-error" role="alert">{formErrors.email}</div>
        )}
        <input
          id="shield-login-password"
          className="shield-clean-input"
          type="password"
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            setFormErrors({ ...formErrors, password: "" });
          }}
          aria-label="Password"
          aria-invalid={!!formErrors.password}
          aria-describedby={formErrors.password ? "shield-login-password-error" : "shield-login-password-hint"}
        />
        {formErrors.password ? (
          <div className="form-error" id="shield-login-password-error" role="alert">{formErrors.password}</div>
        ) : (
          <div className="form-hint" id="shield-login-password-hint">Password must be at least 8 characters.</div>
        )}
        <div>
          <button
            className="bw-btn"
            onClick={handleLogin}
            aria-label="Login"
            disabled={loading.login || loading.register}
          >
            {loading.login ? "Logging in..." : "Login"}
          </button>
          <button
            className="bw-btn"
            onClick={handleRegister}
            aria-label="Register"
            disabled={loading.login || loading.register}
          >
            {loading.register ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
