// Copyright © 2025 SHIELD Intelligence. All rights reserved.
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
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      if (formErrors.email) {
        document.getElementById("shield-login-email")?.focus();
      } else if (formErrors.password) {
        document.getElementById("shield-login-password")?.focus();
      // Copyright © 2025 SHIELD Intelligence. All rights reserved.
      //
      // This file is part of SHIELD Authenticator and may not be copied, modified, or distributed
      // without express permission from SHIELD Intelligence.
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
        let msg = "Login failed. Please try again.";
        if (err && err.code) {
          if (err.code === "auth/user-not-found") msg = "No account found with this email.";
          else if (err.code === "auth/wrong-password") msg = "Incorrect password. Please try again.";
          else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
          else if (err.code === "auth/too-many-requests") msg = "Too many attempts. Please wait and try again.";
        }
        setLoginMessage({ type: 'error', text: msg });
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
        let msg = "Registration failed. Please try again.";
        if (err && err.code) {
          if (err.code === "auth/email-already-in-use") msg = "This email is already registered.";
          else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
          else if (err.code === "auth/weak-password") msg = "Password is too weak. Please use at least 8 characters.";
        }
        setLoginMessage({ type: 'error', text: msg });
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
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      logout().finally(() => {
        setLoadingLogout(false);
      });
    }, 500);
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
      {!showSettings ? (
        <>
          <div className="settings-header">
            <h2 style={{ marginBottom: '-35px' }}>SHIELD-Authenticator Dashboard</h2>
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
            openConfirm={openConfirm}
          />
        </>
      ) : (
        <SettingsPage 
          user={user}
          onLogout={handleLogout}
          onBack={handleCloseSidebar}
          openConfirm={openConfirm}
        />
      )}
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
      © 2025 SHIELD Intelligence. All rights reserved. · {" "}
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
