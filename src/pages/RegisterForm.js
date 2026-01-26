// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RegisterForm({ form, formErrors, loading, setForm, setFormErrors, handleRegister, loginMessage }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="login-form-outer" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="shield-login-container" role="form" aria-labelledby="shield-register-title">
        <h2 id="shield-register-title" className="high-contrast-text">Create Your Account</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#95a5a6' }}>
          Join SHIELD Authenticator for military-grade security
        </p>
        {formErrors.email && <div className="form-error" role="alert">{formErrors.email}</div>}
        <form
          onSubmit={onSubmit}
          style={{ width: "100%" }}
          aria-label="Registration form"
        >
          <input
            id="shield-register-email"
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
              id="shield-register-password"
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
          
          <div 
            style={{ 
              marginTop: '12px', 
              padding: '10px', 
              backgroundColor: 'rgba(52, 152, 219, 0.1)', 
              border: '1px solid rgba(52, 152, 219, 0.3)', 
              borderRadius: '6px',
              fontSize: '0.8rem',
              lineHeight: '1.4',
              color: '#3498db'
            }}
          >
            <strong>Password Tips:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Use at least 8 characters</li>
              <li>Mix uppercase and lowercase letters</li>
              <li>Include numbers and symbols</li>
              <li>Make it unique - don't reuse passwords</li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              className="bw-btn touch-target"
              aria-label="Register"
              disabled={loading.register}
              style={{ width: '100%', marginTop: '16px' }}
            >
              {loading.register ? "Creating Account..." : "Create Account"}
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
            <strong>Password Recovery:</strong> If you forget your password, email us at{' '}
            <a 
              href="mailto:queriesshield@gmail.com" 
              style={{ color: '#f1c40f', textDecoration: 'underline' }}
            >
              queriesshield@gmail.com
            </a>
            {' '}with your desired new password. We don't provide on-site password changing for security reasons.
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#95a5a6' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
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
              Login here
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

export default RegisterForm;
