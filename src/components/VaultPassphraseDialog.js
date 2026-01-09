// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";

function VaultPassphraseDialog({
  open,
  userEmail,
  mode,
  recoveryQuestions,
  passphrase,
  setPassphrase,
  remember,
  setRemember,
  error,
  unlocking,
  onUnlock,
  onSetup,
  onRecover,
  onLogout,
  onClearError,
}) {
  const [show, setShow] = React.useState(false);
  const [showRecovery, setShowRecovery] = React.useState(false);
  const [selectedQuestions, setSelectedQuestions] = React.useState([]);
  const [answers, setAnswers] = React.useState({});
  const [newPassphrase, setNewPassphrase] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setShow(false);
      setShowRecovery(false);
      setSelectedQuestions([]);
      setAnswers({});
      setNewPassphrase("");
      setPassphrase && setPassphrase("");
    }
  }, [open, setPassphrase]);

  // Handle mobile back button for recovery mode
  React.useEffect(() => {
    if (!open) return;

    const handlePopState = () => {
      if (showRecovery) {
        // Close recovery mode and return to main unlock screen
        setShowRecovery(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push a state when recovery mode opens
    if (showRecovery) {
      window.history.pushState({ recovery: true }, '');
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, showRecovery]);

  if (!open) return null;

  const hasRecoveryQuestions = (recoveryQuestions || []).length > 0;
  const showingRecoveryError = showRecovery && !hasRecoveryQuestions;

  return (
    <div
      className="confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-title"
    >
      <div className="confirm-dialog vault-dialog">
        {showRecovery && (
          <button 
            className="dialog-back-button" 
            onClick={() => setShowRecovery(false)}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
        )}
        <h3 id="vault-title" style={{ marginBottom: 16 }}>
          {mode === "setup"
            ? "Set Up Vault"
            : showRecovery
            ? "Recover Vault"
            : "Unlock Vault"}
        </h3>
        <p style={{ marginBottom: 20, fontSize: "0.95rem", lineHeight: 1.5 }}>
          {mode === "setup"
            ? `Create a vault passphrase and choose recovery questions for${
                userEmail ? ` ${userEmail}` : " your account"
              }.`
            : showRecovery
            ? `Answer your recovery questions to reset your vault passphrase for${
                userEmail ? ` ${userEmail}` : " your account"
              }.`
            : `Enter your vault passphrase to decrypt your authenticator secrets for${
                userEmail ? ` ${userEmail}` : " your account"
              }.`}
        </p>

        {mode !== "setup" && !showRecovery ? (
          <div className="vault-info-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>
              If you forget your passphrase, you can recover access using your
              recovery questions (if configured).
            </span>
          </div>
        ) : null}

        {showRecovery ? (
          <>
            {(recoveryQuestions || []).length > 0 ? (
              <>
                {recoveryQuestions.map((q) => (
                  <div
                    key={q.id || q.label}
                    style={{ marginBottom: 10, textAlign: "left" }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#ddd",
                      }}
                    >
                      {q.label}
                    </label>
                    <input
                      className="shield-clean-input"
                      type="text"
                      placeholder="answer (lowercase)"
                      value={(answers[q.id] || "").toLowerCase()}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: String(e.target.value || "").toLowerCase(),
                        }))
                      }
                      disabled={unlocking}
                    />
                  </div>
                ))}

                <div style={{ position: "relative", width: "100%", marginTop: 10 }}>
                  <input
                    id="shield-vault-new-passphrase"
                    name="vaultNewPassphrase"
                    className="shield-clean-input"
                    type={show ? "text" : "password"}
                    placeholder="New vault passphrase (min 8 chars)"
                    value={newPassphrase}
                    onChange={(e) => setNewPassphrase(e.target.value)}
                    disabled={unlocking}
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShow((v) => !v)}
                    disabled={unlocking}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      {show ? (
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      ) : (
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      )}
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="vault-warning-box">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="#f39c12"
                  style={{ marginBottom: 12 }}
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#f39c12",
                  }}
                >
                  Recovery questions are not configured for this vault
                </div>
                <div style={{ fontSize: "0.9rem", color: "#aaa" }}>
                  You cannot recover your vault without recovery questions.
                  Please use your vault passphrase to unlock, or contact
                  support.
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="shield-vault-passphrase"
              name="vaultPassphrase"
              className="shield-clean-input"
              type={show ? "text" : "password"}
              placeholder="Vault passphrase (min 8 chars)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (mode === "setup")
                    onSetup && onSetup({ selectedQuestions, answers });
                  else onUnlock && onUnlock();
                }
              }}
              aria-label="Vault passphrase"
              aria-required="true"
              disabled={unlocking}
              style={{ paddingRight: "45px" }}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShow((v) => !v)}
              disabled={unlocking}
              aria-label={show ? "Hide password" : "Show password"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {show ? (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                ) : (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                )}
              </svg>
            </button>
          </div>
        )}

        {mode === "setup" ? (
          <div style={{ marginTop: 20, textAlign: "left" }}>
            <div
              style={{
                color: "#ddd",
                marginBottom: 12,
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              Recovery Questions
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 400,
                  color: "#f39c12",
                  marginLeft: 8,
                }}
              >
                (optional but recommended)
              </span>
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: 10,
                lineHeight: 1.4,
              }}
            >
              Recovery questions allow you to reset your passphrase if forgotten. Without them, you cannot recover your vault.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <select
                className="shield-clean-input"
                value={selectedQuestions[0] || ""}
                onChange={(e) =>
                  setSelectedQuestions(
                    [
                      e.target.value,
                      selectedQuestions[1],
                      selectedQuestions[2],
                    ].filter(Boolean)
                  )
                }
                disabled={unlocking}
              >
                <option value="">Select question 1</option>
                {(recoveryQuestions || []).map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label}
                  </option>
                ))}
              </select>
              {selectedQuestions[0] ? (
                <input
                  className="shield-clean-input"
                  type="text"
                  placeholder="answer 1 (lowercase)"
                  value={(answers[selectedQuestions[0]] || "").toLowerCase()}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [selectedQuestions[0]]: String(
                        e.target.value || ""
                      ).toLowerCase(),
                    }))
                  }
                  disabled={unlocking}
                />
              ) : null}

              <select
                className="shield-clean-input"
                value={selectedQuestions[1] || ""}
                onChange={(e) =>
                  setSelectedQuestions(
                    [
                      selectedQuestions[0],
                      e.target.value,
                      selectedQuestions[2],
                    ].filter(Boolean)
                  )
                }
                disabled={unlocking}
              >
                <option value="">Select question 2</option>
                {(recoveryQuestions || []).map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label}
                  </option>
                ))}
              </select>
              {selectedQuestions[1] ? (
                <input
                  className="shield-clean-input"
                  type="text"
                  placeholder="answer 2 (lowercase)"
                  value={(answers[selectedQuestions[1]] || "").toLowerCase()}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [selectedQuestions[1]]: String(
                        e.target.value || ""
                      ).toLowerCase(),
                    }))
                  }
                  disabled={unlocking}
                />
              ) : null}

              <select
                className="shield-clean-input"
                value={selectedQuestions[2] || ""}
                onChange={(e) =>
                  setSelectedQuestions(
                    [
                      selectedQuestions[0],
                      selectedQuestions[1],
                      e.target.value,
                    ].filter(Boolean)
                  )
                }
                disabled={unlocking}
              >
                <option value="">Select question 3</option>
                {(recoveryQuestions || []).map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label}
                  </option>
                ))}
              </select>
              {selectedQuestions[2] ? (
                <input
                  className="shield-clean-input"
                  type="text"
                  placeholder="answer 3 (lowercase)"
                  value={(answers[selectedQuestions[2]] || "").toLowerCase()}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [selectedQuestions[2]]: String(
                        e.target.value || ""
                      ).toLowerCase(),
                    }))
                  }
                  disabled={unlocking}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {!showingRecoveryError && (
          <>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <label
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  id="shield-vault-remember"
                  name="vaultRemember"
                  type="checkbox"
                  checked={!!remember}
                  onChange={(e) => setRemember && setRemember(e.target.checked)}
                  disabled={unlocking}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ color: "#ddd", fontSize: "0.9rem" }}>
                  Remember on this device
                </span>
              </label>

              {mode !== "setup" && !showRecovery && (
                <button
                  type="button"
                  className="bw-btn-small"
                  onClick={() => {
                    setShowRecovery((v) => !v);
                    onClearError && onClearError();
                  }}
                  disabled={unlocking}
                  style={{ padding: "6px 16px", fontSize: "0.85rem" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginRight: 4 }}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Recover Vault
                </button>
              )}
            </div>
          </>
        )}

        {error ? (
          <div className="vault-error-box" role="alert">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <div
          className="vault-actions"
          style={{ marginTop: showingRecoveryError ? 20 : 0 }}
        >
          {mode === "setup" ? (
            <button
              className="bw-btn"
              onClick={() => onSetup && onSetup({ selectedQuestions, answers })}
              disabled={unlocking}
            >
              {unlocking ? "Setting up..." : "Set Up"}
            </button>
          ) : showRecovery ? (
            <>
              {!showingRecoveryError && (
                <button
                  className="bw-btn"
                  onClick={() =>
                    onRecover &&
                    onRecover({
                      answers: (recoveryQuestions || []).map(
                        (q) => answers[q.id] || ""
                      ),
                      newPassphrase,
                    })
                  }
                  disabled={unlocking}
                >
                  {unlocking ? "Recovering..." : "Recover"}
                </button>
              )}
              {showingRecoveryError && (
                <button
                  className="bw-btn"
                  onClick={() => setShowRecovery(false)}
                  disabled={unlocking}
                >
                  Back
                </button>
              )}
            </>
          ) : (
            <button className="bw-btn" onClick={onUnlock} disabled={unlocking}>
              {unlocking ? "Unlocking..." : "Unlock"}
            </button>
          )}

          <button
            className="bw-btn danger vault-btn-danger"
            onClick={onLogout}
            disabled={unlocking}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default VaultPassphraseDialog;
