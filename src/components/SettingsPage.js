// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { 
  exportAccountsToCSV, 
  importAccountsFromCSV, 
  downloadCSV, 
  readCSVFile 
} from "../csvUtils";
import { updateRecoveryQuestions, getVaultMeta, clearRecoveryQuestions, isVaultUnlockedForUser, updateVaultPassphrase } from "../vault";
import { handleError } from "../networkUtils";

const SettingsPage = ({ user, onLogout, onBack, openConfirm, maskCodes, setMaskCodes, accounts, onImportAccounts, onDialogStateChange }) => {
  const [exportPassphrase, setExportPassphrase] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [useExportEncryption, setUseExportEncryption] = useState(true);
  const [useImportDecryption, setUseImportDecryption] = useState(true);
  const [recoveryError, setRecoveryError] = useState("");
  const fileInputRef = useRef(null);

  const RECOVERY_QUESTION_BANK = [
    { id: "moms-brother", label: "your mom's brother's name" },
    { id: "first-pet", label: "your first pet's name" },
    { id: "first-school", label: "your first school's name" },
    { id: "favorite-teacher", label: "your favorite teacher's name" },
    { id: "birth-city", label: "the city you were born in" },
  ];

  const [recoveryQ1, setRecoveryQ1] = useState("");
  const [recoveryQ2, setRecoveryQ2] = useState("");
  const [recoveryQ3, setRecoveryQ3] = useState("");
  const [recoveryA1, setRecoveryA1] = useState("");
  const [recoveryA2, setRecoveryA2] = useState("");
  const [recoveryA3, setRecoveryA3] = useState("");
  const [savingRecovery, setSavingRecovery] = useState(false);

  const [showChangePassphraseDialog, setShowChangePassphraseDialog] = useState(false);
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showCurrentPassphrase, setShowCurrentPassphrase] = useState(false);
  const [showNewPassphrase, setShowNewPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);

  // Notify parent when any dialog opens/closes
  useEffect(() => {
    const hasOpenDialog = showExportDialog || showImportDialog || showRecoveryDialog || showChangePassphraseDialog;
    if (onDialogStateChange) {
      onDialogStateChange(hasOpenDialog);
    }
  }, [showExportDialog, showImportDialog, showRecoveryDialog, showChangePassphraseDialog, onDialogStateChange]);

  // Handle back button in Settings page to close dialogs
  useEffect(() => {
    // Only import Capacitor if we have open dialogs
    if (!showExportDialog && !showImportDialog && !showRecoveryDialog && !showChangePassphraseDialog) {
      return;
    }

    let listenerHandle;
    
    // Dynamically import to avoid issues on web
    import('@capacitor/app').then(({ App: CapacitorApp }) => {
      CapacitorApp.addListener('backButton', () => {
        // Close the most recently opened dialog
        if (showChangePassphraseDialog) {
          handleChangePassphraseCancel();
        } else if (showRecoveryDialog) {
          handleRecoveryCancel();
        } else if (showExportDialog) {
          handleCancelExport();
        } else if (showImportDialog) {
          handleCancelImport();
        }
      }).then(handle => {
        listenerHandle = handle;
      });
    }).catch(() => {
      // Capacitor not available (web), ignore
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [showExportDialog, showImportDialog, showRecoveryDialog, showChangePassphraseDialog]);

  // Load existing recovery questions from vault metadata
  useEffect(() => {
    const loadRecoveryQuestions = async () => {
      if (!user) return;
      try {
        const meta = await getVaultMeta(user);
        if (meta && meta.v === 2 && meta.recovery && meta.recovery.questions) {
          const questionIds = meta.recovery.questions;
          if (questionIds[0]) setRecoveryQ1(questionIds[0]);
          if (questionIds[1]) setRecoveryQ2(questionIds[1]);
          if (questionIds[2]) setRecoveryQ3(questionIds[2]);
        }
      } catch (err) {
        console.error("Failed to load recovery questions:", err);
      }
    };
    loadRecoveryQuestions();
  }, [user]);

  const handleRecoveryQuestionsClick = () => {
    setRecoveryError("");
    setRecoveryA1("");
    setRecoveryA2("");
    setRecoveryA3("");
    setShowRecoveryDialog(true);
  };

  const handleRecoveryCancel = () => {
    setShowRecoveryDialog(false);
    setRecoveryError("");
    setRecoveryA1("");
    setRecoveryA2("");
    setRecoveryA3("");
  };

  const handleChangePassphraseClick = () => {
    if (!isVaultUnlockedForUser(user)) {
      toast.error("🔒 Vault is locked. Please unlock first.");
      return;
    }
    setShowChangePassphraseDialog(true);
  };

  const handleChangePassphraseCancel = () => {
    setShowChangePassphraseDialog(false);
    setCurrentPassphrase('');
    setNewPassphrase('');
    setConfirmPassphrase('');
    setShowCurrentPassphrase(false);
    setShowNewPassphrase(false);
    setShowConfirmPassphrase(false);
  };

  const handleChangePassphraseConfirm = async () => {
    if (!isVaultUnlockedForUser(user)) {
      toast.error("🔒 Vault is locked. Please unlock first.");
      return;
    }

    if (!currentPassphrase) {
      toast.error("Please enter your current passphrase");
      return;
    }

    if (!newPassphrase) {
      toast.error("Please enter a new passphrase");
      return;
    }

    if (newPassphrase.length < 8) {
      toast.error("New passphrase must be at least 8 characters");
      return;
    }

    if (newPassphrase !== confirmPassphrase) {
      toast.error("New passphrase and confirmation do not match");
      return;
    }

    if (newPassphrase === currentPassphrase) {
      toast.error("New passphrase must be different from current passphrase");
      return;
    }

    try {
      await updateVaultPassphrase(user, { currentPassphrase, newPassphrase });
      toast.success("✅ Vault passphrase updated successfully");
      handleChangePassphraseCancel();
    } catch (err) {
      const friendly = handleError(
        err,
        err?.message?.toLowerCase().includes("current passphrase")
          ? "Current passphrase is incorrect. Please try again."
          : "Failed to update vault passphrase"
      );
      toast.error(friendly);
    }
  };

  const handleRecoveryConfirm = async () => {
    setRecoveryError("");
    
    if (!isVaultUnlockedForUser(user)) {
      setRecoveryError("🔒 Vault is locked. Please unlock first.");
      return;
    }
    
    const questionIds = [recoveryQ1, recoveryQ2, recoveryQ3].filter(Boolean);
    const uniqueIds = Array.from(new Set(questionIds));
    const answers = [
      recoveryQ1 ? recoveryA1 : null,
      recoveryQ2 ? recoveryA2 : null,
      recoveryQ3 ? recoveryA3 : null,
    ].filter((a) => a !== null);

    if (uniqueIds.length < 1) {
      setRecoveryError("Select at least one recovery question");
      return;
    }
    if (answers.length !== uniqueIds.length || answers.some((a) => !String(a || "").trim())) {
      setRecoveryError("Provide answers for all selected questions");
      return;
    }

    setSavingRecovery(true);
    try {
      await updateRecoveryQuestions(user, {
        recoveryQuestions: uniqueIds,
        recoveryAnswers: answers.map((a) => String(a || "").toLowerCase()),
      });
      toast.success("✅ Recovery questions updated");
      setShowRecoveryDialog(false);
      setRecoveryA1("");
      setRecoveryA2("");
      setRecoveryA3("");
    } catch (e) {
      const errorMsg = handleError(e, "Failed to update recovery questions");
      setRecoveryError(errorMsg);
    } finally {
      setSavingRecovery(false);
    }
  };

  const handleClearRecovery = async () => {
    if (openConfirm) {
      openConfirm({
        title: 'Clear Recovery Questions',
        message: 'Are you sure you want to remove all recovery questions? You will not be able to recover your vault if you forget your passphrase.',
        onConfirm: async () => {
          setSavingRecovery(true);
          try {
            await clearRecoveryQuestions(user);
            setRecoveryQ1("");
            setRecoveryQ2("");
            setRecoveryQ3("");
            setRecoveryA1("");
            setRecoveryA2("");
            setRecoveryA3("");
            setShowRecoveryDialog(false);
            toast.success("✅ Recovery questions cleared");
          } catch (e) {
            const errorMsg = handleError(e, "Failed to clear recovery questions");
            setRecoveryError(errorMsg);
          } finally {
            setSavingRecovery(false);
          }
        },
      });
    }
  };

  const handleLogoutClick = () => {
    if (openConfirm) {
      openConfirm({
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        onConfirm: onLogout,
      });
    } else {
      onLogout && onLogout();
    }
  };

  const handleExportClick = () => {
    if (!accounts || accounts.length === 0) {
      toast.error("No accounts to export");
      return;
    }
    if (!isVaultUnlockedForUser(user)) {
      toast.error("🔒 Vault is locked. Please unlock first.");
      return;
    }
    setExportPassphrase("");
    setUseExportEncryption(true);
    setShowExportDialog(true);
  };

  const handleExportConfirm = () => {
    try {
      if (useExportEncryption && (!exportPassphrase || exportPassphrase.length < 8)) {
        toast.error("Passphrase must be at least 8 characters");
        return;
      }

      const csvContent = exportAccountsToCSV(accounts, exportPassphrase, useExportEncryption);
      
      // Generate filename with sanitized email username
      const emailUsername = user?.email ? user.email.split('@')[0] : 'user';
      const sanitizedUsername = emailUsername.replace(/[^a-zA-Z0-9]/g, '');
      const filename = `shield-authenticator-accounts-for-${sanitizedUsername}.csv`;
      
      downloadCSV(csvContent, filename);
      
      toast.success(`✅ Exported ${accounts.length} account(s) successfully!`);
      setShowExportDialog(false);
      setExportPassphrase("");
    } catch (err) {
      console.error("Export error:", err);
      const errorMsg = handleError(err, "Export failed");
      toast.error(errorMsg);
    }
  };

  const handleImportClick = () => {
    if (!isVaultUnlockedForUser(user)) {
      toast.error("🔒 Vault is locked. Please unlock first.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read the file first
      const csvContent = await readCSVFile(file);
      
      // Auto-detect encryption based on CSV header
      const header = csvContent.split('\n')[0].toLowerCase();
      const hasEncryption = header.includes('encryptedsecret');
      
      // Show passphrase dialog
      setImportPassphrase("");
      setUseImportDecryption(hasEncryption);
      setShowImportDialog(true);
      
      // Store CSV content temporarily
      window._pendingCSVImport = csvContent;
    } catch (err) {
      console.error("File read error:", err);
      toast.error(`❌ ${err.message}`);
    }
    
    // Reset file input
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    try {
      if (useImportDecryption && (!importPassphrase || importPassphrase.length < 8)) {
        toast.error("Passphrase must be at least 8 characters");
        return;
      }

      const csvContent = window._pendingCSVImport;
      if (!csvContent) {
        toast.error("No file data found");
        return;
      }

      const { accounts: importedAccounts, errors } = importAccountsFromCSV(csvContent, importPassphrase, useImportDecryption);
      
      if (importedAccounts.length === 0) {
        toast.error("No accounts could be imported");
        return;
      }

      // Call the callback to add accounts
      if (onImportAccounts) {
        await onImportAccounts(importedAccounts);
        
        if (errors.length > 0) {
          toast.warning(`⚠️ Imported ${importedAccounts.length} account(s) with ${errors.length} error(s)`);
          console.warn("Import errors:", errors);
        } else {
          toast.success(`✅ Imported ${importedAccounts.length} account(s) successfully!`);
        }
      }
      
      setShowImportDialog(false);
      setImportPassphrase("");
      delete window._pendingCSVImport;
    } catch (err) {
      console.error("Import error:", err);
      const errorMsg = handleError(err, "Import failed");
      toast.error(errorMsg);
    }
  };

  const handleCancelExport = () => {
    setShowExportDialog(false);
    setExportPassphrase("");
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setImportPassphrase("");
    delete window._pendingCSVImport;
  };

  // Handle escape key and mobile back button
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showChangePassphraseDialog) {
          handleChangePassphraseCancel();
        } else if (showRecoveryDialog) {
          handleRecoveryCancel();
        } else if (showExportDialog) {
          handleCancelExport();
        } else if (showImportDialog) {
          handleCancelImport();
        } else {
          onBack();
        }
      }
    };

    const handlePopState = () => {
      // Handle back button for dialogs
      if (showChangePassphraseDialog) {
        handleChangePassphraseCancel();
      } else if (showRecoveryDialog) {
        handleRecoveryCancel();
      } else if (showExportDialog) {
        handleCancelExport();
      } else if (showImportDialog) {
        handleCancelImport();
      } else {
        // If no dialog is open, go back to main page
        onBack();
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('popstate', handlePopState);
    
    // Push a state when a dialog opens to enable back button handling
    const anyDialogOpen = showChangePassphraseDialog || showRecoveryDialog || showExportDialog || showImportDialog;
    if (anyDialogOpen) {
      window.history.pushState({ modal: true }, '');
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack, showExportDialog, showImportDialog, showRecoveryDialog, showChangePassphraseDialog]);

  // Prevent body scroll when any dialog is open
  useEffect(() => {
    const anyDialogOpen = showChangePassphraseDialog || showRecoveryDialog || showExportDialog || showImportDialog;
    const body = document.body;
    if (anyDialogOpen) {
      body.classList.add('shield-modal-open');
    } else {
      body.classList.remove('shield-modal-open');
    }
    return () => body.classList.remove('shield-modal-open');
  }, [showChangePassphraseDialog, showRecoveryDialog, showExportDialog, showImportDialog]);

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button 
          className="back-button" 
          onClick={onBack}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Back
        </button>
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h2>Account</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-label">Email</span>
              <span className="settings-value">{user?.email || 'Not available'}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Display</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-label">Show Codes</span>
              <span className="settings-value">{maskCodes ? 'Hidden' : 'Visible'}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={!maskCodes}
                onChange={(e) => setMaskCodes && setMaskCodes(!e.target.checked)}
                aria-label="Toggle code visibility"
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Backup & Restore</h2>
          <div className="settings-item">
            <button className="settings-action-btn" onClick={handleExportClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
              Export to CSV
            </button>
          </div>
          <div className="settings-item">
            <button className="settings-action-btn" onClick={handleImportClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6-.67l-2.59 2.58L9 12.5l5-5 5 5-1.41 1.41L13 11.33V21h-2z"/>
              </svg>
              Import from CSV
            </button>
          </div>
          <input
            ref={fileInputRef}
            id="shield-import-file"
            name="importFile"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
        </div>

        <div className="settings-section">
          <h2>Security</h2>
          <div className="settings-item">
            <button className="settings-action-btn" onClick={handleRecoveryQuestionsClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              {(recoveryQ1 || recoveryQ2 || recoveryQ3) ? 'Update Recovery Questions' : 'Set Up Recovery Questions'}
            </button>
          </div>
          <div className="settings-item">
            <button className="settings-action-btn" onClick={handleChangePassphraseClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              Change Vault Passphrase
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Actions</h2>
          <button className="settings-logout-btn" onClick={handleLogoutClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && createPortal(
        (
        <div className="dialog-overlay" onClick={handleCancelExport}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-back-button" onClick={handleCancelExport} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h3>Export Accounts</h3>
            <p className="dialog-description">
              Choose whether to encrypt your account secrets with a passphrase.
            </p>
            
            <div className="dialog-toggle-section">
              <div className="dialog-toggle-label">
                <span>Encrypt with passphrase</span>
                <span className="dialog-toggle-hint">{useExportEncryption ? 'Recommended' : 'Not secure'}</span>
              </div>
              <label className="switch">
                <input
                  id="shield-export-encryption-toggle"
                  name="exportEncryptionEnabled"
                  type="checkbox"
                  checked={useExportEncryption}
                  onChange={(e) => setUseExportEncryption(e.target.checked)}
                  aria-label="Toggle encryption"
                />
                <span className="slider"></span>
              </label>
            </div>

            {useExportEncryption && (
              <input
                id="shield-export-passphrase"
                name="exportPassphrase"
                type="password"
                value={exportPassphrase}
                onChange={(e) => setExportPassphrase(e.target.value)}
                placeholder="Enter passphrase (min 8 characters)"
                className="dialog-input"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && exportPassphrase && exportPassphrase.length >= 8) {
                    handleExportConfirm();
                  }
                }}
              />
            )}

            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={handleCancelExport}>
                Cancel
              </button>
              <button 
                className="dialog-btn dialog-btn-confirm" 
                onClick={handleExportConfirm}
                disabled={useExportEncryption && (!exportPassphrase || exportPassphrase.length < 8)}
              >
                Export
              </button>
            </div>
          </div>
        </div>
        ),
        document.body
      )}

      {/* Import Dialog */}
      {showImportDialog && createPortal(
        (
        <div className="dialog-overlay" onClick={handleCancelImport}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-back-button" onClick={handleCancelImport} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h3>Import Accounts</h3>
            <p className="dialog-description">
              {useImportDecryption 
                ? "This file appears to be encrypted. Enter the passphrase to decrypt."
                : "This file appears to be unencrypted."}
            </p>
            
            <div className="dialog-toggle-section">
              <div className="dialog-toggle-label">
                <span>File is encrypted</span>
                <span className="dialog-toggle-hint">{useImportDecryption ? 'Passphrase required' : 'No passphrase'}</span>
              </div>
              <label className="switch">
                <input
                  id="shield-import-decryption-toggle"
                  name="importDecryptionEnabled"
                  type="checkbox"
                  checked={useImportDecryption}
                  onChange={(e) => setUseImportDecryption(e.target.checked)}
                  aria-label="Toggle decryption"
                />
                <span className="slider"></span>
              </label>
            </div>

            {useImportDecryption && (
              <input
                id="shield-import-passphrase"
                name="importPassphrase"
                type="password"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                placeholder="Enter passphrase"
                className="dialog-input"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && importPassphrase && importPassphrase.length >= 8) {
                    handleImportConfirm();
                  }
                }}
              />
            )}

            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={handleCancelImport}>
                Cancel
              </button>
              <button 
                className="dialog-btn dialog-btn-confirm" 
                onClick={handleImportConfirm}
                disabled={useImportDecryption && (!importPassphrase || importPassphrase.length < 8)}
              >
                Import
              </button>
            </div>
          </div>
        </div>
        ),
        document.body
      )}

      {/* Recovery Questions Dialog */}
      {showRecoveryDialog && createPortal(
        (
        <div className="dialog-overlay" onClick={handleRecoveryCancel}>
          <div className="dialog-box recovery-dialog-box" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-back-button" onClick={handleRecoveryCancel} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h3>Recovery Questions</h3>
            <p className="dialog-description">
              Set or update your recovery questions. Answers are never stored for security - you must re-enter them each time.
            </p>

            {recoveryError && (
              <div style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px',
                fontSize: '0.9rem'
              }}>
                {recoveryError}
              </div>
            )}

            <select 
              className="dialog-input" 
              value={recoveryQ1} 
              onChange={(e) => setRecoveryQ1(e.target.value)} 
              disabled={savingRecovery}
              style={{ marginBottom: '10px' }}
            >
              <option value="">Select question 1</option>
              {RECOVERY_QUESTION_BANK.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            {recoveryQ1 ? (
              <input
                className="dialog-input"
                type="text"
                placeholder="Enter/re-enter answer 1 (lowercase)"
                value={recoveryA1}
                onChange={(e) => setRecoveryA1(String(e.target.value || "").toLowerCase())}
                disabled={savingRecovery}
                style={{ marginBottom: '10px' }}
              />
            ) : null}

            <select 
              className="dialog-input" 
              value={recoveryQ2} 
              onChange={(e) => setRecoveryQ2(e.target.value)} 
              disabled={savingRecovery}
              style={{ marginBottom: '10px' }}
            >
              <option value="">Select question 2 (optional)</option>
              {RECOVERY_QUESTION_BANK.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            {recoveryQ2 ? (
              <input
                className="dialog-input"
                type="text"
                placeholder="Enter/re-enter answer 2 (lowercase)"
                value={recoveryA2}
                onChange={(e) => setRecoveryA2(String(e.target.value || "").toLowerCase())}
                disabled={savingRecovery}
                style={{ marginBottom: '10px' }}
              />
            ) : null}

            <select 
              className="dialog-input" 
              value={recoveryQ3} 
              onChange={(e) => setRecoveryQ3(e.target.value)} 
              disabled={savingRecovery}
              style={{ marginBottom: '10px' }}
            >
              <option value="">Select question 3 (optional)</option>
              {RECOVERY_QUESTION_BANK.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            {recoveryQ3 ? (
              <input
                className="dialog-input"
                type="text"
                placeholder="Enter/re-enter answer 3 (lowercase)"
                value={recoveryA3}
                onChange={(e) => setRecoveryA3(String(e.target.value || "").toLowerCase())}
                disabled={savingRecovery}
                style={{ marginBottom: '16px' }}
              />
            ) : null}

            <div className="dialog-actions">
              {(recoveryQ1 || recoveryQ2 || recoveryQ3) && (
                <button 
                  className="dialog-btn" 
                  onClick={handleClearRecovery}
                  disabled={savingRecovery}
                  style={{ 
                    backgroundColor: '#dc3545',
                    marginRight: 'auto'
                  }}
                >
                  Clear All
                </button>
              )}
              <button 
                className="dialog-btn dialog-btn-cancel" 
                onClick={handleRecoveryCancel}
                disabled={savingRecovery}
              >
                Cancel
              </button>
              <button 
                className="dialog-btn dialog-btn-confirm" 
                onClick={handleRecoveryConfirm}
                disabled={savingRecovery}
              >
                {savingRecovery ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        ),
        document.body
      )}

      {/* Change Passphrase Dialog */}
      {showChangePassphraseDialog && createPortal(
        (
        <div className="dialog-overlay" onClick={handleChangePassphraseCancel}>
          <div className="dialog-box recovery-dialog-box" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-back-button" onClick={handleChangePassphraseCancel} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h3>Change Vault Passphrase</h3>
            <p className="dialog-description">
              Change your vault passphrase. You must enter your current passphrase to verify your identity.
            </p>

            <div className="dialog-input-group">
              <label htmlFor="current-passphrase">Current Passphrase</label>
              <div className="password-input-wrapper">
                <input
                  className="dialog-input"
                  id="current-passphrase"
                  type={showCurrentPassphrase ? "text" : "password"}
                  value={currentPassphrase}
                  onChange={(e) => setCurrentPassphrase(e.target.value)}
                  placeholder="Enter current passphrase"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassphrase(!showCurrentPassphrase)}
                  aria-label={showCurrentPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showCurrentPassphrase ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="dialog-input-group">
              <label htmlFor="new-passphrase">New Passphrase</label>
              <div className="password-input-wrapper">
                <input
                  className="dialog-input"
                  id="new-passphrase"
                  type={showNewPassphrase ? "text" : "password"}
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  placeholder="Enter new passphrase (min 8 characters)"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                  aria-label={showNewPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showNewPassphrase ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="dialog-input-group">
              <label htmlFor="confirm-passphrase">Confirm New Passphrase</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-passphrase"
                  className="dialog-input"
                  type={showConfirmPassphrase ? "text" : "password"}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter new passphrase"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                  aria-label={showConfirmPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showConfirmPassphrase ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="dialog-actions">
              <button 
                type="button"
                className="dialog-btn dialog-btn-cancel" 
                onClick={handleChangePassphraseCancel}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="dialog-btn dialog-btn-confirm" 
                onClick={handleChangePassphraseConfirm}
              >
                Update Passphrase
              </button>
            </div>
          </div>
        </div>
        ),
        document.body
      )}
    </div>
  );
};

export default SettingsPage;
