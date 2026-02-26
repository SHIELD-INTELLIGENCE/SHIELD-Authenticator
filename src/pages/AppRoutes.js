// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
import MobileLandingPage from "./MobileLandingPage";
import SettingsPage from "./SettingsPage";
import NotFound404 from "./NotFound404";
import TermsPage from "./TermsPage";
import ConfirmDialog from "../components/ConfirmDialog";
import VaultPassphraseDialog from "../components/VaultPassphraseDialog";

function AppRoutes({
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
  setSettingsHasOpenDialog,
  setMaskCodes,
  confirmDialog,
  secureStorageDialog,
  secureStorageErrorMessage,
  vaultDialogOpen,
  vaultMode,
  vaultRecoveryConfig,
  recoveryQuestionBank,
  vaultPassphrase,
  setVaultPassphrase,
  vaultRemember,
  setVaultRemember,
  vaultError,
  setVaultError,
  vaultUnlocking,
  vaultUnlocked,
  offlineReady,
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
  closeConfirm,
  closeSecureStorageDialog,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = React.useRef(true);
  const previousOnlineRef = React.useRef(isOnline);
  const [showBackOnlineBanner, setShowBackOnlineBanner] = React.useState(false);

  const androidAuthEntryRoute = React.useMemo(() => {
    if (!isAndroid) return "/login";

    try {
      const saved = localStorage.getItem("shield-auth-entry-route");
      return saved === "/register" || saved === "/login" ? saved : "/login";
    } catch {
      return "/login";
    }
  }, [isAndroid]);

  useEffect(() => {
    if (!user && (location.pathname === "/dashboard" || location.pathname === "/settings")) {
      navigate("/login", { replace: true });
    } else if (user && (location.pathname === "/login" || location.pathname === "/register")) {
      navigate("/dashboard", { replace: true });
    } else if (user && location.pathname === "/" && isInitialLoad.current) {
      navigate("/dashboard", { replace: true });
    }

    isInitialLoad.current = false;
  }, [user, vaultUnlocked, location.pathname, navigate]);

  useEffect(() => {
    let timer = null;

    if (!previousOnlineRef.current && isOnline) {
      setShowBackOnlineBanner(true);
      timer = setTimeout(() => setShowBackOnlineBanner(false), 2200);
    }

    if (!isOnline) {
      setShowBackOnlineBanner(false);
    }

    previousOnlineRef.current = isOnline;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline]);

  const shouldShowConnectivityBanner = !isOnline || showBackOnlineBanner;

  const offlineBanner = shouldShowConnectivityBanner ? (
    <div className={`offline-banner ${isOnline ? "online" : "offline"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px" }}>
        {isOnline ? (
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        ) : (
          <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
        )}
      </svg>
      {isOnline ? "Back online." : offlineReady ? "You're offline, but ready." : "You're offline. Some features may not work."}
    </div>
  ) : null;

  if (!user) {
    return (
      <>
        {offlineBanner}
        <Routes>
          <Route
            path="/"
            element={
              isAndroid ? (
                showMobileLanding ? (
                  <MobileLandingPage />
                ) : (
                  <Navigate to={androidAuthEntryRoute} replace />
                )
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/mobile-start" element={<MobileLandingPage />} />
          <Route
            path="/login"
            element={
              <LoginForm
                form={form}
                formErrors={formErrors}
                loading={loading}
                setForm={setForm}
                setFormErrors={setFormErrors}
                handleLogin={handleLogin}
                loginMessage={loginMessage}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm
                form={form}
                formErrors={formErrors}
                loading={loading}
                setForm={setForm}
                setFormErrors={setFormErrors}
                handleRegister={handleRegister}
                loginMessage={loginMessage}
              />
            }
          />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="/settings" element={<Navigate to="/login" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      {offlineBanner}

      <VaultPassphraseDialog
        open={vaultDialogOpen}
        userEmail={user?.email}
        mode={vaultMode}
        recoveryQuestions={vaultMode === "setup" ? recoveryQuestionBank : vaultRecoveryConfig.questions}
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
        <Route path="/" element={isAndroid ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/mobile-start" element={<MobileLandingPage />} />
        <Route
          path="/dashboard"
          element={
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
              vaultUnlocked={vaultUnlocked}
            />
          }
        />
        <Route
          path="/settings"
          element={
            vaultUnlocked ? (
              <SettingsPage
                user={user}
                onLogout={handleLogout}
                onBack={() => {
                  if (window.history.length > 1) navigate(-1);
                  else navigate("/dashboard", { replace: true });
                }}
                openConfirm={openConfirm}
                maskCodes={maskCodes}
                setMaskCodes={setMaskCodes}
                accounts={accounts}
                onImportAccounts={handleImportAccounts}
                onDialogStateChange={setSettingsHasOpenDialog}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          try {
            confirmDialog.onConfirm && confirmDialog.onConfirm();
          } finally {
            closeConfirm();
          }
        }}
        onCancel={closeConfirm}
      />
      <ConfirmDialog
        open={secureStorageDialog.open}
        title="Secure Storage"
        message={secureStorageDialog.message || `${secureStorageErrorMessage}.`}
        onConfirm={closeSecureStorageDialog}
        onCancel={closeSecureStorageDialog}
        confirmLabel="OK"
        cancelLabel="Close"
      />
      <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar />
    </>
  );
}

export default AppRoutes;
