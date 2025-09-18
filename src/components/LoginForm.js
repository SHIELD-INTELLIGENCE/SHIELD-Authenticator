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
        />
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
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
            style={{ flex: 1, minWidth: 0, marginRight: 0 }}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(v => !v)}
            style={{
              marginLeft: -60,
              zIndex: 2,
              background: '#222',
              border: '1px solid #caa94c',
              color: '#caa94c',
              cursor: 'pointer',
              fontSize: 13,
              padding: '2px 10px',
              borderRadius: 6,
              height: 28,
              lineHeight: '24px',
              minWidth: 54,
              boxSizing: 'border-box',
              position: 'relative',
              right: 0
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
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
        {loginMessage && (
          <div style={{ marginTop: 18, color: loginMessage.type === 'error' ? '#ff6b6b' : '#caa94c', fontWeight: 500, textAlign: 'center' }}>
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
