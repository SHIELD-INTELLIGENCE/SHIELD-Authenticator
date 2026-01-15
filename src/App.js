// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
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
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import MobileLandingPage from "./components/MobileLandingPage";
import SettingsPage from "./components/SettingsPage";
import NotFound404 from "./components/NotFound404";
import ConfirmDialog from "./components/ConfirmDialog";
import VaultPassphraseDialog from "./components/VaultPassphraseDialog";
import { unlockVault, lockVault, getVaultMeta, setupVault, recoverAndResetPassphrase } from "./vault";
import { handleError, checkOnlineStatus } from "./networkUtils";
import { secureSetItem, secureGetItem, secureRemoveItem } from "./secureStorage";

function vaultRememberKeyForEmail(email) {
  return `shield-vault-passphrase:${String(email || "").trim().toLowerCase()}`;
}

function SHIELDAuthenticator() {
  // Detect platform synchronously at initialization
  const platformName = Capacitor.getPlatform();
  const isAndroidDevice = platformName === 'android';
  const hasSeenLanding = isAndroidDevice ? localStorage.getItem('shield-mobile-landing-seen') : 'true';
  
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [codes, setCodes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [isAndroid] = useState(isAndroidDevice);
  const [showMobileLanding] = useState(isAndroidDevice && !hasSeenLanding);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    secret: "",
    website: "", // honeypot field
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
      toast.error("Please access this app via HTTPS for security features to work properly.", {
        autoClose: 5000,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        ),
      });
    }
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online", { 
        autoClose: 2000,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ),
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection", { 
        autoClose: false,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>
          </svg>
        ),
      });
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
      toast.error("Failed to load accounts");
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
    // Trim inputs
    const trimmedName = (name || "").trim();
    const trimmedSecret = (secret || "").trim();
    
    // Validate inputs
    if (!trimmedName && !trimmedSecret) {
      return toast.error("Please enter account name and secret");
    }
    if (!trimmedName) {
      return toast.error("Please enter account name");
    }
    if (!trimmedSecret) {
      return toast.error("Please enter secret");
    }
    
    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to make changes.");
      return;
    }
    try {
      if (editing) {
        await updateAccount(user, editing, { name: trimmedName, secret: trimmedSecret });
        toast.success("Account updated!");
        setEditing(null);
      } else {
        await addAccount(user, trimmedName, trimmedSecret);
        toast.success("Account added!");
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
      toast.error("User not authenticated");
      return;
    }

    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to import accounts.");
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
      toast.warning(`Imported ${successCount} of ${importedAccounts.length} accounts`);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.info("Copied!");
  };

  const handleDelete = async (id) => {
    if (!vaultUnlocked) {
      toast.error("Vault is locked. Please unlock to make changes.");
      return;
    }
    try {
      await deleteAccount(user, id);
      toast.info("Account deleted");
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
        toast.error("Invalid QR code format");
        return;
      }

      const url = new URL(text);
      const name = decodeURIComponent(url.pathname.slice(1));
      const secret = url.searchParams.get("secret");

      if (!name || !secret) {
        toast.error("QR missing secret or name");
        return;
      }

      setForm({ name, secret });
      saveAccountDirect(name, secret);
      toast.success(`QR code for ${name} added!`);
    } catch (err) {
      console.error("QR scan error:", err);
      toast.error("Could not read QR code. Make sure the image is clear.");
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
    // Honeypot bot detection
    if (form.website) {
      // Silently reject bot submissions
      setLoading(l => ({ ...l, login: true }));
      setTimeout(() => {
        setLoading(l => ({ ...l, login: false }));
        setLoginMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      }, 2000);
      return;
    }
    
    let errors = { email: "", password: "" };
    setLoginMessage(null);
    
    // Trim and validate email
    const trimmedEmail = (form.email || "").trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!validateEmail(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Trim and validate password
    const trimmedPassword = (form.password || "").trim();
    if (!trimmedPassword) {
      errors.password = "Please enter your password";
    } else if (!validatePassword(trimmedPassword)) {
      errors.password = "Password must be at least 8 characters";
    }
    
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, login: true }));
    login(trimmedEmail, trimmedPassword)
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
    // Honeypot bot detection
    if (form.website) {
      // Silently reject bot submissions
      setLoading(l => ({ ...l, register: true }));
      setTimeout(() => {
        setLoading(l => ({ ...l, register: false }));
        setLoginMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      }, 2000);
      return;
    }
    
    let errors = { email: "", password: "" };
    setLoginMessage(null);
    
    // Trim and validate email
    const trimmedEmail = (form.email || "").trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!validateEmail(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Trim and validate password
    const trimmedPassword = (form.password || "").trim();
    if (!trimmedPassword) {
      errors.password = "Please enter your password";
    } else if (!validatePassword(trimmedPassword)) {
      errors.password = "Password must be at least 8 characters";
    }
    
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, register: true }));
    register(trimmedEmail, trimmedPassword)
      .then(setUser)
      .catch((err) => {
        const errorMsg = handleError(err);
        setLoginMessage({ type: 'error', text: errorMsg });
      })
      .finally(() => setLoading(l => ({ ...l, register: false })));
  }

  const [showSettings, setShowSettings] = useState(false);
  const [settingsHasOpenDialog, setSettingsHasOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
  
  // Handle Android hardware back button using Capacitor App plugin
  useEffect(() => {
    let listenerHandle;
    
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const currentPath = window.location?.pathname || '';
      // Priority order: ConfirmDialog > SettingsDialogs > Editing Form > Settings > Vault Dialog > ShowDelete > Dashboard (minimize)
      if (confirmDialog.open) {
        closeConfirm();
      } else if (settingsHasOpenDialog) {
        // Settings page has its own dialogs open, let it handle them
        // Don't navigate away, just trigger a signal (the dialogs will close themselves)
        return;
      } else if (currentPath === '/settings') {
        // Always return to dashboard from Settings on mobile back
        if (canGoBack) {
          window.history.back();
        } else {
          // No history entry (e.g. deep link). Navigate without reload.
          window.history.replaceState({}, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else if (showDelete) {
        setShowDelete(null);
      } else if (editing) {
        setEditing(null);
        setForm({ email: "", password: "", name: "", secret: "", website: "" });
      } else if (showSettings) {
        // Reset scroll position when going back to dashboard
        setShowSettings(false);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      } else if (vaultDialogOpen) {
        // Don't close vault dialog - user needs to unlock or logout
        // Do nothing, keep them on vault screen
      } else if (vaultUnlocked && user && (currentPath === '/dashboard' || currentPath === '/')) {
        // Only minimize when on the dashboard
        CapacitorApp.minimizeApp().catch(() => {
          // Fallback for web or if minimize fails
          console.log('Minimize not available');
        });
      } else if (canGoBack) {
        // Only allow navigation back if there's history
        window.history.back();
      }
    }).then(handle => {
      listenerHandle = handle;
    });
    
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [confirmDialog.open, settingsHasOpenDialog, showDelete, editing, showSettings, vaultDialogOpen, vaultUnlocked, user]);
  
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
      setVaultError("No internet connection. Please check your network.");
      return;
    }
    setVaultError("");
    
    const trimmedPassphrase = (vaultPassphrase || "").trim();
    if (!trimmedPassphrase) {
      setVaultError("Please enter vault passphrase");
      return;
    }
    if (trimmedPassphrase.length < 8) {
      setVaultError("Passphrase must be at least 8 characters");
      return;
    }
    
    setVaultUnlocking(true);
    try {
      await unlockVault(user, trimmedPassphrase);

      // Persist passphrase securely on device only if user opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, trimmedPassphrase);
        else secureRemoveItem(storageKey);
      }

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultUnlocked(true);
      await loadAccounts(user);
    } catch (e) {
      // Show the actual error message from vault.js, not a generic one
      setVaultError(e.message || "Failed to unlock vault");
    } finally {
      setVaultUnlocking(false);
    }
  };

  const handleSetupVault = async ({ selectedQuestions, answers }) => {
    if (!user) return;
    setVaultError("");
    
    const trimmedPassphrase = (vaultPassphrase || "").trim();
    if (!trimmedPassphrase) {
      setVaultError("Please enter vault passphrase");
      return;
    }
    if (trimmedPassphrase.length < 8) {
      setVaultError("Passphrase must be at least 8 characters");
      return;
    }

    const questionIds = Array.isArray(selectedQuestions) ? selectedQuestions.filter(Boolean) : [];
    const uniqueIds = Array.from(new Set(questionIds));

    // If questions are selected, validate that all have answers
    if (uniqueIds.length > 0) {
      const recoveryAnswers = uniqueIds.map((id) => String(answers?.[id] || "").toLowerCase().trim());
      if (recoveryAnswers.some((a) => !a)) {
        setVaultError("Please provide answers for all selected recovery questions");
        return;
      }
    }

    const recoveryAnswers = uniqueIds.map((id) => String(answers?.[id] || "").toLowerCase().trim());

    setVaultUnlocking(true);
    try {
      await setupVault(user, {
        passphrase: trimmedPassphrase,
        recoveryQuestions: uniqueIds,
        recoveryAnswers,
      });

      // Persist passphrase securely on device only if user opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, trimmedPassphrase);
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
    
    // Validate recovery answers
    const trimmedAnswers = Array.isArray(answers) ? answers.map((a) => String(a || "").toLowerCase().trim()) : [];
    if (trimmedAnswers.some((a) => !a)) {
      setVaultError("Please provide answers for all recovery questions");
      return;
    }
    
    // Validate new passphrase
    const trimmedNewPassphrase = (newPassphrase || "").trim();
    if (!trimmedNewPassphrase) {
      setVaultError("Please enter a new vault passphrase");
      return;
    }
    if (trimmedNewPassphrase.length < 8) {
      setVaultError("New passphrase must be at least 8 characters");
      return;
    }
    
    setVaultUnlocking(true);
    try {
      await recoverAndResetPassphrase(user, {
        recoveryAnswers: trimmedAnswers,
        newPassphrase: trimmedNewPassphrase,
      });

      // After recovery, remember the new passphrase securely if opted in
      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, trimmedNewPassphrase);
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

  return (
    <Router>
      <SHIELDAuthenticatorContent
        user={user}
        accounts={accounts}
        codes={codes}
        countdowns={countdowns}
        isAndroid={isAndroid}
        showMobileLanding={showMobileLanding}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        loading={loading}
        loginMessage={loginMessage}
        maskCodes={maskCodes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        getFilteredAndSortedAccounts={getFilteredAndSortedAccounts}
        editing={editing}
        setEditing={setEditing}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settingsHasOpenDialog={settingsHasOpenDialog}
        setSettingsHasOpenDialog={setSettingsHasOpenDialog}
        setMaskCodes={setMaskCodes}
        confirmDialog={confirmDialog}
        vaultDialogOpen={vaultDialogOpen}
        vaultMode={vaultMode}
        vaultRecoveryConfig={vaultRecoveryConfig}
        RECOVERY_QUESTION_BANK={RECOVERY_QUESTION_BANK}
        vaultPassphrase={vaultPassphrase}
        setVaultPassphrase={setVaultPassphrase}
        vaultRemember={vaultRemember}
        setVaultRemember={setVaultRemember}
        vaultError={vaultError}
        setVaultError={setVaultError}
        vaultUnlocking={vaultUnlocking}
        vaultUnlocked={vaultUnlocked}
        isOnline={isOnline}
        loadingAccounts={loadingAccounts}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleSave={handleSave}
        handleCopy={handleCopy}
        handleDelete={handleDelete}
        handleQRUpload={handleQRUpload}
        handleLogout={handleLogout}
        handleUnlockVault={handleUnlockVault}
        handleSetupVault={handleSetupVault}
        handleRecoverVault={handleRecoverVault}
        handleImportAccounts={handleImportAccounts}
        openConfirm={openConfirm}
        closeConfirm={closeConfirm}
      />
    </Router>
  );
}

function SHIELDAuthenticatorContent({
  user,
  accounts,
  codes,
  countdowns,
  isAndroid,
  showMobileLanding,
  form,
  setForm,
  formErrors,
  setFormErrors,
  loading,
  loginMessage,
  maskCodes,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  getFilteredAndSortedAccounts,
  editing,
  setEditing,
  showDelete,
  setShowDelete,
  showSettings,
  setShowSettings,
  settingsHasOpenDialog,
  setSettingsHasOpenDialog,
  setMaskCodes,
  confirmDialog,
  vaultDialogOpen,
  vaultMode,
  vaultRecoveryConfig,
  RECOVERY_QUESTION_BANK,
  vaultPassphrase,
  setVaultPassphrase,
  vaultRemember,
  setVaultRemember,
  vaultError,
  setVaultError,
  vaultUnlocking,
  vaultUnlocked,
  isOnline,
  loadingAccounts,
  handleLogin,
  handleRegister,
  handleSave,
  handleCopy,
  handleDelete,
  handleQRUpload,
  handleLogout,
  handleUnlockVault,
  handleSetupVault,
  handleRecoverVault,
  handleImportAccounts,
  openConfirm,
  closeConfirm
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = React.useRef(true);

  // On Android APK, after onboarding we should land on auth (login/register), not the desktop landing page.
  const androidAuthEntryRoute = React.useMemo(() => {
    if (!isAndroid) return "/login";
    try {
      const saved = localStorage.getItem('shield-auth-entry-route');
      return saved === '/register' || saved === '/login' ? saved : '/login';
    } catch {
      return '/login';
    }
  }, [isAndroid]);

  // Redirect logic: non-logged users trying to access protected routes go to /login
  // Logged-in users default to /dashboard on initial load only
  useEffect(() => {
    if (!user && (location.pathname === '/dashboard' || location.pathname === '/settings')) {
      navigate('/login', { replace: true });
    } else if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      // Redirect logged-in users from login/register to dashboard (vault dialog will show if locked)
      navigate('/dashboard', { replace: true });
    } else if (user && location.pathname === '/' && isInitialLoad.current) {
      // Only redirect to dashboard on true initial load, not when user intentionally navigates to home
      navigate('/dashboard', { replace: true });
    }
    
    // After first effect run, mark as no longer initial load
    isInitialLoad.current = false;
  }, [user, vaultUnlocked, location.pathname, navigate]);


  if (!user) {
    return (
      <Routes>
        <Route path="/" element={
          isAndroid ? (
            showMobileLanding ? (
              <MobileLandingPage />
            ) : (
              <Navigate to={androidAuthEntryRoute} replace />
            )
          ) : (
            <LandingPage />
          )
        } />
        <Route path="/mobile-start" element={<MobileLandingPage />} />
        <Route path="/login" element={
          <LoginForm
            form={form}
            formErrors={formErrors}
            loading={loading}
            setForm={setForm}
            setFormErrors={setFormErrors}
            handleLogin={handleLogin}
            loginMessage={loginMessage}
          />
        } />
        <Route path="/register" element={
          <RegisterForm
            form={form}
            formErrors={formErrors}
            loading={loading}
            setForm={setForm}
            setFormErrors={setFormErrors}
            handleRegister={handleRegister}
            loginMessage={loginMessage}
          />
        } />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="/settings" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    );
  }

  return (
    <>
      {!isOnline && (
        <div className="offline-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>
          </svg>
          You're offline. Some features may not work.
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
      
      <Routes>
        <Route
          path="/"
          element={isAndroid ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route path="/mobile-start" element={<MobileLandingPage />} />
        <Route path="/dashboard" element={
          <Dashboard
            user={user}
            isAndroid={isAndroid}
            accounts={accounts}
            codes={codes}
            countdowns={countdowns}
            form={form}
            setForm={setForm}
            handleSave={handleSave}
            editing={editing}
            setEditing={setEditing}
            handleQRUpload={handleQRUpload}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            getFilteredAndSortedAccounts={getFilteredAndSortedAccounts}
            handleCopy={handleCopy}
            maskCodes={maskCodes}
            setMaskCodes={setMaskCodes}
            setShowDelete={setShowDelete}
            showDelete={showDelete}
            handleDelete={handleDelete}
            openConfirm={openConfirm}
            loadingAccounts={loadingAccounts}
            isOnline={isOnline}
            vaultUnlocked={vaultUnlocked}
          />
        } />
        <Route path="/settings" element={
          vaultUnlocked ? (
            <SettingsPage
              user={user}
              onLogout={handleLogout}
              onBack={() => {
                // Prefer real back if available, otherwise force dashboard
                if (window.history.length > 1) navigate(-1);
                else navigate('/dashboard', { replace: true });
              }}
              openConfirm={openConfirm}
              maskCodes={maskCodes}
              setMaskCodes={setMaskCodes}
              accounts={accounts}
              onImportAccounts={handleImportAccounts}
              onDialogStateChange={setSettingsHasOpenDialog}
            />
          ) : <Navigate to="/dashboard" replace />
        } />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      
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
    </>
  );
}


export default SHIELDAuthenticator;
