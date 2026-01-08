// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  register,
  login,
  logout,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
  getCode,
  getCountdown,
} from "./services";
import { auth } from "./firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css"; // SHIELD theme
import QrScanner from "qr-scanner";
import LoginForm from "./components/LoginForm";
import AddAccountForm from "./components/AddAccountForm";
import AccountList from "./components/AccountList";
import SettingsPage from "./components/SettingsPage";
import ConfirmDialog from "./components/ConfirmDialog";
import VaultPassphraseDialog from "./components/VaultPassphraseDialog";
import { unlockVault, lockVault, getVaultMeta, setupVault, recoverAndResetPassphrase } from "./vault";
import { handleError, checkOnlineStatus } from "./networkUtils";
import { secureSetItem, secureGetItem, secureRemoveItem } from "./secureStorage";

function vaultRememberKeyForEmail(email) {
  return `shield-vault-passphrase:${String(email || "").trim().toLowerCase()}`;
}

function SHIELDAuthenticator() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [codes, setCodes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    secret: "",
  });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState({ login: false, register: false });
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [maskCodes, setMaskCodes] = useState(() => {
    // Load mask codes preference from localStorage
    const saved = localStorage.getItem("shield-mask-codes");
    return saved === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(() => {
    // Load sort preference from localStorage
    return localStorage.getItem("shield-sort-preference") || "name-asc";
  });

  // Save mask codes preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shield-mask-codes", maskCodes);
  }, [maskCodes]);

  // Save sort preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shield-sort-preference", sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (!user) {
      if (formErrors.email) {
        document.getElementById("shield-login-email")?.focus();
      } else if (formErrors.password) {
        document.getElementById("shield-login-password")?.focus();
      // Copyright © 2026 SHIELD Intelligence. All rights reserved.
      //
      // This file is part of SHIELD Authenticator and may not be copied, modified, or distributed
      // without express permission from SHIELD Intelligence.
      }
    }
  }, [formErrors, user]);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [vaultMode, setVaultMode] = useState("unlock"); // 'unlock' | 'setup'
  const [vaultRecoveryConfig, setVaultRecoveryConfig] = useState({ questions: [] });
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultRemember, setVaultRemember] = useState(true);
  const [vaultError, setVaultError] = useState("");
  const [vaultUnlocking, setVaultUnlocking] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  const RECOVERY_QUESTION_BANK = React.useMemo(
    () => [
      { id: "moms-brother", label: "Your Mom's Brother's name" },
      { id: "first-pet", label: "Your First Pet's name" },
      { id: "first-school", label: "Your First School's name" },
      { id: "favorite-teacher", label: "Your Favorite Teacher's name" },
      { id: "birth-city", label: "The City You Were Born In" },
    ],
    []
  );

  // Check for secure context on mount
  useEffect(() => {
    if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
      console.error("App is not running in a secure context. Crypto APIs may not be available.");
      toast.error("⚠️ Please access this app via HTTPS for security features to work properly.", {
        autoClose: 5000,
      });
    }
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("🌐 Back online", { autoClose: 2000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("📡 No internet connection", { autoClose: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Require vault unlock every login/session
        setAccounts([]);
        setVaultError("");
        setVaultUnlocking(true);
        setVaultUnlocked(false);

        getVaultMeta(u)
          .then(async (meta) => {
            if (!meta) {
              setVaultMode("setup");
              setVaultRecoveryConfig({ questions: [] });
              setVaultDialogOpen(true);
              setVaultUnlocking(false);
              return;
            }

            if (meta?.v === 2 && meta?.recovery?.questions?.length) {
              const ids = meta.recovery.questions;
              const questions = RECOVERY_QUESTION_BANK.filter((q) => ids.includes(q.id));
              setVaultRecoveryConfig({ questions });
            } else {
              setVaultRecoveryConfig({ questions: [] });
            }

            setVaultMode("unlock");

            // Try auto-unlock from securely stored passphrase if user opted in previously
            const email = u?.email || "";
            const remembered = email ? await secureGetItem(vaultRememberKeyForEmail(email)) : null;

            if (remembered) {
              unlockVault(u, remembered)
                .then(() => loadAccounts(u))
                .then(() => {
                  setVaultDialogOpen(false);
                  setVaultPassphrase("");
                  setVaultRemember(true);
                  setVaultUnlocked(true);
                })
                .catch(() => {
                  setVaultPassphrase("");
                  setVaultRemember(true);
                  setVaultDialogOpen(true);
                })
                .finally(() => setVaultUnlocking(false));
            } else {
              setVaultPassphrase("");
              setVaultRemember(true);
              setVaultDialogOpen(true);
              setVaultUnlocking(false);
            }
          })
          .catch(() => {
            setVaultMode("setup");
            setVaultRecoveryConfig({ questions: [] });
            setVaultDialogOpen(true);
            setVaultUnlocking(false);
          });
      } else {
        setAccounts([]);
        lockVault();
        setVaultDialogOpen(false);
        setVaultPassphrase("");
        setVaultRemember(true);
        setVaultError("");
      }
      setLoadingAuth(false); // <-- auth check done
    });
    return unsub;
  }, [RECOVERY_QUESTION_BANK]);

  async function loadAccounts(u) {
    if (!u) return;
    setLoadingAccounts(true);
    try {
      const data = await getAccounts(u);
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("❌ Failed to load accounts");
    } finally {
      setLoadingAccounts(false);
    }
  }

  // Filter and sort accounts based on search query and sort preference
  const getFilteredAndSortedAccounts = () => {
    let filtered = accounts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = accounts.filter(acc => 
        acc.name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "time-newest":
          // Newest first (most recent createdAt)
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case "time-oldest":
          // Oldest first
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Update codes & countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const newCodes = {};
      const newCountdowns = {};
      accounts.forEach((acc) => {
        newCodes[acc.id] = getCode(acc.secret);
        newCountdowns[acc.id] = getCountdown();
      });
      setCodes(newCodes);
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [accounts]);

  const saveAccountDirect = async (name, secret) => {
    if (!name || !secret) return toast.error("Fill both fields!");
    if (!vaultUnlocked) {
      toast.error("🔒 Vault is locked. Please unlock to make changes.");
      return;
    }
    try {
      if (editing) {
        await updateAccount(user, editing, { name, secret });
        toast.success("✅ Account updated!");
        setEditing(null);
      } else {
        await addAccount(user, name, secret);
        toast.success("✅ Account added!");
      }
      setForm({ name: "", secret: "" });
      loadAccounts(user);
    } catch (err) {
      const errorMsg = handleError(err, "Failed to save account");
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleSave = async () => saveAccountDirect(form.name, form.secret);

  const handleImportAccounts = async (importedAccounts) => {
    if (!user) {
      toast.error("❌ User not authenticated");
      return;
    }

    if (!vaultUnlocked) {
      toast.error("🔒 Vault is locked. Please unlock to import accounts.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const account of importedAccounts) {
      try {
        await addAccount(user, account.name, account.secret);
        successCount++;
      } catch (err) {
        console.error("Failed to import account:", account.name, err);
        failCount++;
      }
    }

    // Reload accounts after import
    await loadAccounts(user);

    if (failCount > 0) {
      toast.warning(`⚠️ Imported ${successCount} of ${importedAccounts.length} accounts`);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.info("📋 Copied!");
  };

  const handleDelete = async (id) => {
    if (!vaultUnlocked) {
      toast.error("🔒 Vault is locked. Please unlock to make changes.");
      return;
    }
    try {
      await deleteAccount(user, id);
      toast.info("🗑️ Account deleted");
      loadAccounts(user);
      setShowDelete(null);
    } catch (err) {
      const errorMsg = handleError(err, "Failed to delete account");
      toast.error(errorMsg);
    }
  };

  // QR upload handler
  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      const text = typeof result === "string" ? result : result?.data;

      if (!text || !text.startsWith("otpauth://totp/")) {
        toast.error("❌ Invalid QR code format");
        return;
      }

      const url = new URL(text);
      const name = decodeURIComponent(url.pathname.slice(1));
      const secret = url.searchParams.get("secret");

      if (!name || !secret) {
        toast.error("❌ QR missing secret or name");
        return;
      }

      setForm({ name, secret });
      saveAccountDirect(name, secret);
      toast.success(`✅ QR code for ${name} added!`);
    } catch (err) {
      console.error("QR scan error:", err);
      toast.error("❌ Could not read QR code. Make sure the image is clear.");
    }
  };

  useEffect(() => {
    if (!user) {
      if (formErrors.email) {
        document.getElementById("shield-login-email")?.focus();
      } else if (formErrors.password) {
        document.getElementById("shield-login-password")?.focus();
      }
    }
  }, [formErrors, user]);

  // Validation helpers
  function validateEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }
  function validatePassword(password) {
    return password.length >= 8;
  }


  function handleLogin() {
    let errors = { email: "", password: "" };
    setLoginMessage(null);
    if (!validateEmail(form.email)) errors.email = "Please enter a valid email address.";
    if (!validatePassword(form.password)) errors.password = "Password must be at least 8 characters.";
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, login: true }));
    login(form.email, form.password)
      .then((user) => {
        setUser(user);
        setLoginMessage(null);
      })
      .catch((err) => {
        const errorMsg = handleError(err);
        setLoginMessage({ type: 'error', text: errorMsg });
      })
      .finally(() => setLoading(l => ({ ...l, login: false })));
  }

  function handleRegister() {
    let errors = { email: "", password: "" };
    setLoginMessage(null);
    if (!validateEmail(form.email)) errors.email = "Please enter a valid email address.";
    if (!validatePassword(form.password)) errors.password = "Password must be at least 8 characters.";
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, register: true }));
    register(form.email, form.password)
      .then(setUser)
      .catch((err) => {
        const errorMsg = handleError(err);
        setLoginMessage({ type: 'error', text: errorMsg });
      })
      .finally(() => setLoading(l => ({ ...l, register: false })));
  }

  const [showSettings, setShowSettings] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
  const handleSettingsClick = () => setShowSettings(true);
  const handleCloseSidebar = () => setShowSettings(false);
  const handleLogout = () => {
    setShowSettings(false);
    setLoadingLogout(true);
    setVaultUnlocked(false);
    lockVault();

    // Ensure logout clears any remembered vault passphrase
    const email = user?.email || "";
    if (email) {
      secureRemoveItem(vaultRememberKeyForEmail(email));
    }
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      logout().finally(() => {
        setLoadingLogout(false);
      });
    }, 500);
  };

  const handleUnlockVault = async () => {
    if (!user) return;
    if (!checkOnlineStatus()) {
      setVaultError("📡 No internet connection. Please check your network.");
      return;
    }
    setVaultError("");
    if (!vaultPassphrase || vaultPassphrase.length < 8) {
      setVaultError("Passphrase must be at least 8 characters");
      return;
    }
    setVaultUnlocking(true);
    try {
      await unlockVault(user, vaultPassphrase);

      // Persist passphrase securely on device only if user opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, vaultPassphrase);
        else secureRemoveItem(storageKey);
      }

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultUnlocked(true);
      await loadAccounts(user);
    } catch (e) {
      const errorMsg = handleError(e, "Failed to unlock vault");
      setVaultError(errorMsg);
    } finally {
      setVaultUnlocking(false);
    }
  };

  const handleSetupVault = async ({ selectedQuestions, answers }) => {
    if (!user) return;
    setVaultError("");
    if (!vaultPassphrase || vaultPassphrase.length < 8) {
      setVaultError("Passphrase must be at least 8 characters");
      return;
    }

    const questionIds = Array.isArray(selectedQuestions) ? selectedQuestions.filter(Boolean) : [];
    const uniqueIds = Array.from(new Set(questionIds));

    // If questions are selected, validate that all have answers
    if (uniqueIds.length > 0) {
      const recoveryAnswers = uniqueIds.map((id) => String(answers?.[id] || "").toLowerCase());
      if (recoveryAnswers.some((a) => !a.trim())) {
        setVaultError("Provide answers for all selected questions (lowercase)");
        return;
      }
    }

    const recoveryAnswers = uniqueIds.map((id) => String(answers?.[id] || "").toLowerCase());

    setVaultUnlocking(true);
    try {
      await setupVault(user, {
        passphrase: vaultPassphrase,
        recoveryQuestions: uniqueIds,
        recoveryAnswers,
      });

      // Persist passphrase securely on device only if user opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, vaultPassphrase);
        else secureRemoveItem(storageKey);
      }

      const questions = RECOVERY_QUESTION_BANK.filter((q) => uniqueIds.includes(q.id));
      setVaultRecoveryConfig({ questions });

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultMode("unlock");
      setVaultUnlocked(true);
      await loadAccounts(user);
    } catch (e) {
      const errorMsg = handleError(e, "Failed to set up vault");
      setVaultError(errorMsg);
    } finally {
      setVaultUnlocking(false);
    }
  };

  const handleRecoverVault = async ({ answers, newPassphrase }) => {
    if (!user) return;
    setVaultError("");
    setVaultUnlocking(true);
    try {
      await recoverAndResetPassphrase(user, {
        recoveryAnswers: Array.isArray(answers) ? answers.map((a) => String(a || "").toLowerCase()) : [],
        newPassphrase,
      });

      // After recovery, remember the new passphrase securely if opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, newPassphrase);
        else secureRemoveItem(storageKey);
      }

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultUnlocked(true);
      await loadAccounts(user);
    } catch (e) {
      const errorMsg = handleError(e, "Failed to recover vault");
      setVaultError(errorMsg);
    } finally {
      setVaultUnlocking(false);
    }
  };


if (loadingLogout) {
  return (
    <div className="logout-loading-screen">
      <div className="logout-loading-title">
        Logging out...
        <span className="logout-spinner" />
      </div>
    </div>
  );
}

if (loadingAuth) {
  return (
    <div className="shield-loading-screen">
      <div className="shield-loading-title">
        <span className="desktop-text">Loading SHIELD-Authenticator</span>
        <span className="mobile-text">
          Loading<br />SHIELD-Authenticator
        </span>
      </div>
      <span className="shield-spinner" />
    </div>
  );
}



  if (!user) {
    return (
      <LoginForm
        form={form}
        formErrors={formErrors}
        loading={loading}
        setForm={setForm}
        setFormErrors={setFormErrors}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        loginMessage={loginMessage}
      />
    );
  }

  return (
    <div className="page-container">
      {!isOnline && (
        <div className="offline-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>
          </svg>
          📡 You're offline. Some features may not work.
        </div>
      )}
      <VaultPassphraseDialog
        open={vaultDialogOpen}
        userEmail={user?.email}
        mode={vaultMode}
        recoveryQuestions={vaultMode === "setup" ? RECOVERY_QUESTION_BANK : vaultRecoveryConfig.questions}
        passphrase={vaultPassphrase}
        setPassphrase={setVaultPassphrase}
        remember={vaultRemember}
        setRemember={setVaultRemember}
        error={vaultError}
        unlocking={vaultUnlocking}
        onUnlock={handleUnlockVault}
        onSetup={handleSetupVault}
        onRecover={handleRecoverVault}
        onLogout={handleLogout}
        onClearError={() => setVaultError("")}
      />
      {vaultUnlocked && !showSettings ? (
        <>
          <div className="settings-header">
            <h2 style={{ marginBottom: '-45px' }}>SHIELD-Authenticator Dashboard</h2>
          </div>
          <button 
            className="profile-button" 
            style={{ position: 'absolute', top: '10px', right: '10px' }} 
            onClick={handleSettingsClick} 
            title="Profile & Settings"
            aria-label="Profile & Settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile</span>
          </button>
          <AddAccountForm
            form={form}
            setForm={setForm}
            handleSave={handleSave}
            editing={editing}
            setEditing={setEditing}
            handleQRUpload={handleQRUpload}
          />
          
          {/* Search and Sort Controls */}
          {accounts.length > 0 && (
            <div className="search-sort-container">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  id="shield-search-accounts"
                  name="searchAccounts"
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="search-clear" 
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="sort-box">
                <svg className="sort-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
                <select 
                  id="shield-sort-accounts"
                  name="sortAccounts"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="time-newest">Newest First</option>
                  <option value="time-oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}

          <AccountList
            accounts={getFilteredAndSortedAccounts()}
            codes={codes}
            countdowns={countdowns}
            handleCopy={handleCopy}
            maskCodes={maskCodes}
            setEditing={setEditing}
            setForm={setForm}
            setShowDelete={setShowDelete}
            showDelete={showDelete}
            handleDelete={handleDelete}
            openConfirm={openConfirm}
            searchQuery={searchQuery}
            totalAccounts={accounts.length}
            loadingAccounts={loadingAccounts}
          />
        </>
      ) : vaultUnlocked ? (
        <SettingsPage 
          user={user}
          onLogout={handleLogout}
          onBack={handleCloseSidebar}
          openConfirm={openConfirm}
          maskCodes={maskCodes}
          setMaskCodes={setMaskCodes}
          accounts={accounts}
          onImportAccounts={handleImportAccounts}
        />
      ) : null}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          try {
            // call provided confirm handler
            confirmDialog.onConfirm && confirmDialog.onConfirm();
          } finally {
            closeConfirm();
          }
        }}
        onCancel={closeConfirm}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
      />
    </div>
  );
}


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
      © 2026 SHIELD Intelligence. All rights reserved. · {" "}
      <a href="/terms.html" rel="noopener noreferrer">Terms of Use & Privacy</a>
    </footer>
  );
}

function AppWithFooter(props) {
  return (
    <>
      <SHIELDAuthenticator {...props} />
      <CopyrightFooter />
    </>
  );
}

export default AppWithFooter;
