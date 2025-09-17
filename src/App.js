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
import SettingsSidebar from "./components/SettingsSidebar";

// Set worker path dynamically (works with Netlify)
QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

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
  const [loadingAuth, setLoadingAuth] = useState(true); // <-- new

  useEffect(() => {
    if (!user) {
      if (formErrors.email) {
        document.getElementById("shield-login-email")?.focus();
      } else if (formErrors.password) {
        document.getElementById("shield-login-password")?.focus();
      }
    }
  }, [formErrors, user]);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadAccounts(u.uid);
      else setAccounts([]);
      setLoadingAuth(false); // <-- auth check done
    });
    return unsub;
  }, []);

  async function loadAccounts(uid) {
    if (!uid) return;
    const data = await getAccounts(uid);
    setAccounts(data);
  }

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
    try {
      if (editing) {
        await updateAccount(editing, { name, secret });
        toast.success("✅ Account updated!");
        setEditing(null);
      } else {
        await addAccount(user.uid, name, secret);
        toast.success("✅ Account added!");
      }
      setForm({ name: "", secret: "" });
      loadAccounts(user.uid);
    } catch (err) {
      toast.error("❌ Failed to save account");
      console.error(err);
    }
  };

  const handleSave = async () => saveAccountDirect(form.name, form.secret);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.info("📋 Copied!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      toast.info("🗑️ Account deleted");
      loadAccounts(user.uid);
      setShowDelete(null);
    } catch (err) {
      toast.error("❌ Failed to delete");
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
    if (!validateEmail(form.email)) errors.email = "Invalid email format";
    if (!validatePassword(form.password)) errors.password = "Password must be at least 8 characters";
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, login: true }));
    login(form.email, form.password)
      .then(setUser)
      .catch((err) => {
        toast.error("❌ " + (err?.message || "Login failed"));
      })
      .finally(() => setLoading(l => ({ ...l, login: false })));
  }

  function handleRegister() {
    let errors = { email: "", password: "" };
    if (!validateEmail(form.email)) errors.email = "Invalid email format";
    if (!validatePassword(form.password)) errors.password = "Password must be at least 8 characters";
    setFormErrors(errors);
    if (errors.email || errors.password) return;
    setLoading(l => ({ ...l, register: true }));
    register(form.email, form.password)
      .then(setUser)
      .catch((err) => {
        toast.error("❌ " + (err?.message || "Registration failed"));
      })
      .finally(() => setLoading(l => ({ ...l, register: false })));
  }

  const [showSettings, setShowSettings] = useState(false);
  const handleSettingsClick = () => setShowSettings(true);
  const handleCloseSidebar = () => setShowSettings(false);
  const handleLogout = () => {
    setShowSettings(false);
    logout();
  };


if (loadingAuth) {
  return (
    <div className="shield-loading-screen">
      <div className="shield-loading-title">SHIELD-Authenticator</div>
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
      />
    );
  }

  return (
    <div className="page-container">
      <div className="settings-header">
        <h2>SHIELD-Authenticator Dashboard</h2>
        <div className="settings-icon" onClick={handleSettingsClick} tabIndex={0} title="Settings">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.39 1.25 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.66 0 1.25.39 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.25.39-1.51 1z"/></svg>
        </div>
      </div>
      {showSettings && (
        <>
          <SettingsSidebar show={showSettings} onLogout={handleLogout} onClose={handleCloseSidebar} />
          <div className="sidebar-backdrop" onClick={handleCloseSidebar} />
        </>
      )}
      <AddAccountForm
        form={form}
        setForm={setForm}
        handleSave={handleSave}
        editing={editing}
        setEditing={setEditing}
        handleQRUpload={handleQRUpload}
      />
      <AccountList
        accounts={accounts}
        codes={codes}
        countdowns={countdowns}
        handleCopy={handleCopy}
        setEditing={setEditing}
        setForm={setForm}
        setShowDelete={setShowDelete}
        showDelete={showDelete}
        handleDelete={handleDelete}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
      />
  {/* sidebar-backdrop now rendered above with sidebar */}
    </div>
  );
}

export default SHIELDAuthenticator;
