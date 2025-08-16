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

function SHIELDAuthenticator() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [codes, setCodes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [form, setForm] = useState({ email: "", password: "", name: "", secret: "" });
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  // Listen to auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadAccounts(u?.uid);
      else setAccounts([]);
    });
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

  const handleSave = async () => {
    if (!form.name || !form.secret) return alert("Fill both fields");
    try {
      if (editing) {
        await updateAccount(editing, { name: form.name, secret: form.secret });
        toast.success("✅ Account updated!");
        setEditing(null);
      } else {
        await addAccount(user.uid, form.name, form.secret);
        toast.success("✅ Account added!");
      }
      setForm({ name: "", secret: "" });
      loadAccounts(user.uid);
    } catch (err) {
      toast.error("❌ Failed to save account");
      console.error(err);
    }
  };

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

  if (!user) {
    return (
      <div className="shield-login-container">
        <h2>SHIELD-Authenticator Login / Register</h2>
        <input
          className="shield-clean-input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="shield-clean-input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div>
          <button className="bw-btn" onClick={() => login(form.email, form.password).then(setUser).catch(alert)}>
            Login
          </button>
          <button className="bw-btn" onClick={() => register(form.email, form.password).then(setUser).catch(alert)}>
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>SHIELD-Authenticator Dashboard</h2>
      <button className="bw-btn logout-btn" onClick={logout}>Logout</button>

      {/* Add / Edit Account */}
      <div className="addAccount">
        <input
          className="shield-clean-input"
          placeholder="Account Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="shield-clean-input"
          placeholder="Secret (BASE32)"
          value={form.secret}
          onChange={(e) => setForm({ ...form, secret: e.target.value })}
        />
        <button className="bw-btn" onClick={handleSave}>
          {editing ? "Update Account" : "Add Account"}
        </button>
        {editing && (
          <button className="bw-btn danger" onClick={() => { setEditing(null); setForm({ name: "", secret: "" }); }}>
            Cancel
          </button>
        )}
      </div>

      {/* Account List */}
      <div className="accountList">
        {accounts.map((acc) => (
          <div key={acc.id} className="accountItem">
            <span className="accountName">{acc.name}</span>
            <span className={`accountCode ${countdowns[acc.id] < 5 ? "pulse" : ""}`}>
              {codes[acc.id] ?? "000000"}
            </span>

            <div className="accountActions">
              <button className="bw-btn" onClick={() => handleCopy(codes[acc.id] ?? "000000")}>Copy</button>
              <button className="bw-btn" onClick={() => { setEditing(acc.id); setForm({ name: acc.name, secret: acc.secret }); }}>Edit</button>
              {showDelete === acc.id ? (
                <>
                  <button className="bw-btn danger" onClick={() => handleDelete(acc.id)}>Confirm Delete</button>
                  <button className="bw-btn" onClick={() => setShowDelete(null)}>Cancel</button>
                </>
              ) : (
                <button className="bw-btn danger" onClick={() => setShowDelete(acc.id)}>Delete</button>
              )}
            </div>

            <div className="countdown">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((countdowns[acc.id] ?? 0) / 30) * 100}%` }} />
              </div>
              <p>{countdowns[acc.id] ?? 0}s</p>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar />
    </div>
  );
}

export default SHIELDAuthenticator;
