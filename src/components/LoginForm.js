// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

function LoginForm({ form, formErrors, loading, setForm, setFormErrors, handleLogin, handleRegister, loginMessage }) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container" role="form" aria-labelledby="shield-login-title">
        <h2 id="shield-login-title" className="high-contrast-text">SHIELD-Authenticator Login / Register</h2>
        {formErrors.email && <div className="form-error" role="alert">{formErrors.email}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
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
          <div>
            <button
              type="submit"
              className="bw-btn touch-target"
              aria-label="Login"
              disabled={loading.login || loading.register}
            >
              {loading.login ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              className="bw-btn touch-target"
              onClick={handleRegister}
              aria-label="Register"
              disabled={loading.login || loading.register}
            >
              {loading.register ? "Registering..." : "Register"}
            </button>
          </div>
          <div 
            style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: 'rgba(241, 196, 15, 0.1)', 
              border: '1px solid rgba(241, 196, 15, 0.3)', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              color: '#f1c40f'
            }}
          >
            <strong>⚠️ Password Recovery:</strong> If you forget your password, email us at{' '}
            <a 
              href="mailto:queriesshield@gmail.com" 
              style={{ color: '#f1c40f', textDecoration: 'underline' }}
            >
              queriesshield@gmail.com
            </a>
            {' '}with your desired new password. We don't provide on-site password changing for security reasons.
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
