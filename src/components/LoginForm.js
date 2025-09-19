// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import React from "react";

function CopyrightFooter() {
  return (
    <footer style={{
      textAlign: "center",
      padding: "1rem 0",
      color: "#888",
      fontSize: "0.95rem",
      background: "transparent",
      marginTop: "2rem"
    }}>
      © 2025 SHIELD Intelligence. All rights reserved.
    </footer>
  );
}

function LoginForm({ form, formErrors, loading, setForm, setFormErrors, handleLogin, handleRegister, loginMessage }) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <a href="#shield-login-title" className="skip-link">Skip to login form</a>
      <div className="shield-login-container" role="form" aria-labelledby="shield-login-title">
        <h2 id="shield-login-title" className="high-contrast-text">SHIELD-Authenticator Login / Register</h2>
        {formErrors.email && <div className="form-error" role="alert">{formErrors.email}</div>}
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
          aria-required="true"
        />
        {formErrors.password && <div className="form-error" role="alert">{formErrors.password}</div>}
        <div className="password-container">
          <input
            id="shield-login-password"
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
        <div>
          <button
            className="bw-btn touch-target"
            onClick={handleLogin}
            aria-label="Login"
            disabled={loading.login || loading.register}
          >
            {loading.login ? "Logging in..." : "Login"}
          </button>
          <button
            className="bw-btn touch-target"
            onClick={handleRegister}
            aria-label="Register"
            disabled={loading.login || loading.register}
          >
            {loading.register ? "Registering..." : "Register"}
          </button>
        </div>
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
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <CopyrightFooter />
      </div>
    </div>
  );
}

export default LoginForm;
