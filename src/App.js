// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";
import AppRoutes from "./pages/AppRoutes";
import { AuthLoadingScreen, LogoutLoadingScreen } from "./components/LoadingScreens";
import { getFilteredAndSortedAccounts } from "./Utils/accountFilters";
import { RECOVERY_QUESTION_BANK } from "./Utils/recoveryQuestions";
import { SECURE_STORAGE_GET_KEY_ERROR } from "./Utils/secureStorage";
import { useAppPreferences } from "./hooks/useAppPreferences";
import { useSecurityAndConnectivity } from "./hooks/useSecurityAndConnectivity";
import { useCodesTicker } from "./hooks/useCodesTicker";
import { useAuthVaultLifecycle } from "./hooks/useAuthVaultLifecycle";
import { useAndroidBackButton } from "./hooks/useAndroidBackButton";
import { createAuthHandlers } from "./modules/appHandlers/authHandlers";
import { createAccountHandlers } from "./modules/appHandlers/accountHandlers";
import { createVaultHandlers } from "./modules/appHandlers/vaultHandlers";

function SHIELDAuthenticator() {
  const {
    isAndroid,
    showMobileLanding,
    maskCodes,
    setMaskCodes,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useAppPreferences();

  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [codes, setCodes] = useState({});
  const [countdowns, setCountdowns] = useState({});

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    secret: "",
    website: "",
  });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState({ login: false, register: false });
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [vaultMode, setVaultMode] = useState("unlock");
  const [vaultRecoveryConfig, setVaultRecoveryConfig] = useState({ questions: [] });
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultRemember, setVaultRemember] = useState(true);
  const [vaultError, setVaultError] = useState("");
  const [vaultUnlocking, setVaultUnlocking] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsHasOpenDialog, setSettingsHasOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [secureStorageDialog, setSecureStorageDialog] = useState({ open: false, message: "" });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!user) {
      if (formErrors.email) document.getElementById("shield-login-email")?.focus();
      else if (formErrors.password) document.getElementById("shield-login-password")?.focus();
    }
  }, [formErrors, user]);

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
  const closeSecureStorageDialog = () => setSecureStorageDialog({ open: false, message: "" });

  useSecurityAndConnectivity(setIsOnline);

  const { loadAccounts } = useAuthVaultLifecycle({
    setUser,
    setAccounts,
    setLoadingAuth,
    setLoadingAccounts,
    setOfflineReady,
    setVaultError,
    setVaultUnlocking,
    setVaultUnlocked,
    setVaultMode,
    setVaultRecoveryConfig,
    setVaultDialogOpen,
    setVaultPassphrase,
    setVaultRemember,
    setSecureStorageDialog,
  });

  useCodesTicker(accounts, setCodes, setCountdowns);

  const { handleLogin, handleRegister } = createAuthHandlers({
    form,
    setLoading,
    setLoginMessage,
    setFormErrors,
    setUser,
  });

  const { handleSave, handleImportAccounts, handleCopy, handleDelete, handleQRUpload } = createAccountHandlers({
    user,
    editing,
    setEditing,
    form,
    setForm,
    vaultUnlocked,
    setShowDelete,
    loadAccounts,
  });

  const { handleLogout, handleUnlockVault, handleSetupVault, handleRecoverVault } = createVaultHandlers({
    user,
    setShowSettings,
    setLoadingLogout,
    setVaultUnlocked,
    vaultPassphrase,
    vaultRemember,
    setVaultError,
    setVaultUnlocking,
    setVaultDialogOpen,
    setVaultPassphrase,
    setVaultMode,
    setVaultRecoveryConfig,
    loadAccounts,
  });

  useAndroidBackButton({
    confirmDialogOpen: confirmDialog.open,
    secureStorageDialogOpen: secureStorageDialog.open,
    settingsHasOpenDialog,
    showDelete,
    editing,
    showSettings,
    vaultDialogOpen,
    vaultUnlocked,
    user,
    closeConfirm,
    closeSecureStorageDialog,
    setShowDelete,
    setEditing,
    setForm,
    setShowSettings,
  });

  const getFilteredAndSortedAccountsData = () => getFilteredAndSortedAccounts(accounts, searchQuery, sortBy);

  if (loadingLogout) return <LogoutLoadingScreen />;
  if (loadingAuth) return <AuthLoadingScreen />;

  return (
    <Router>
      <AppRoutes
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
        getFilteredAndSortedAccounts={getFilteredAndSortedAccountsData}
        editing={editing}
        setEditing={setEditing}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        setSettingsHasOpenDialog={setSettingsHasOpenDialog}
        setMaskCodes={setMaskCodes}
        confirmDialog={confirmDialog}
        secureStorageDialog={secureStorageDialog}
        secureStorageErrorMessage={SECURE_STORAGE_GET_KEY_ERROR}
        vaultDialogOpen={vaultDialogOpen}
        vaultMode={vaultMode}
        vaultRecoveryConfig={vaultRecoveryConfig}
        recoveryQuestionBank={RECOVERY_QUESTION_BANK}
        vaultPassphrase={vaultPassphrase}
        setVaultPassphrase={setVaultPassphrase}
        vaultRemember={vaultRemember}
        setVaultRemember={setVaultRemember}
        vaultError={vaultError}
        setVaultError={setVaultError}
        vaultUnlocking={vaultUnlocking}
        vaultUnlocked={vaultUnlocked}
        offlineReady={offlineReady}
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
        closeSecureStorageDialog={closeSecureStorageDialog}
      />
    </Router>
  );
}

export default SHIELDAuthenticator;
