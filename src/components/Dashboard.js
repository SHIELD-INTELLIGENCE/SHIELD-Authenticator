// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React from "react";
import { useNavigate } from "react-router-dom";
import AddAccountForm from "./AddAccountForm";
import AccountList from "./AccountList";
import { ToastContainer } from "react-toastify";

function Dashboard({
  user,
  isAndroid,
  accounts,
  codes,
  countdowns,
  form,
  setForm,
  handleSave,
  editing,
  setEditing,
  handleQRUpload,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  getFilteredAndSortedAccounts,
  handleCopy,
  maskCodes,
  setMaskCodes,
  setShowDelete,
  showDelete,
  handleDelete,
  openConfirm,
  loadingAccounts,
  isOnline,
  vaultUnlocked
}) {
  const navigate = useNavigate();
  const handleSettingsClick = () => navigate('/settings');

  return (
    <div className="page-container">
      {!isOnline && (
        <div className="offline-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>
          </svg>
          No internet connection. Some features may not work.
        </div>
      )}
      
      {vaultUnlocked ? (
        <>
          <div className="settings-header">
            <h2>SHIELD-Authenticator Dashboard</h2>
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
      ) : null}
      
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
      />
      
      {/* Dashboard Footer with optional home link */}
      {vaultUnlocked && (
        <footer style={{
          textAlign: "center",
          padding: "30px 20px 20px 20px",
          marginTop: "40px",
          borderTop: "1px solid rgba(202, 169, 76, 0.2)",
          color: "#888",
          fontSize: "0.9rem"
        }}>
          <button
            onClick={() => navigate(isAndroid ? '/mobile-start' : '/')}
            style={{
              background: "transparent",
              border: "1px solid rgba(202, 169, 76, 0.3)",
              color: "var(--shield-accent)",
              padding: "8px 20px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              marginBottom: "15px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(202, 169, 76, 0.1)";
              e.currentTarget.style.borderColor = "var(--shield-accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(202, 169, 76, 0.3)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Home
          </button>
          <div>
            © 2026 SHIELD Intelligence. All rights reserved. · {" "}
            <a 
              href="/terms.html" 
              rel="noopener noreferrer"
              style={{
                color: "var(--shield-accent)",
                textDecoration: "none"
              }}
            >
              Terms of Use & Privacy
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Dashboard;
