// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { 
  exportAccountsToCSV, 
  importAccountsFromCSV, 
  downloadCSV, 
  readCSVFile 
} from "../csvUtils";

const SettingsPage = ({ user, onLogout, onBack, openConfirm, maskCodes, setMaskCodes, accounts, onImportAccounts }) => {
  const [exportPassphrase, setExportPassphrase] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [useExportEncryption, setUseExportEncryption] = useState(true);
  const [useImportDecryption, setUseImportDecryption] = useState(true);
  const fileInputRef = useRef(null);

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
      toast.error(`❌ Export failed: ${err.message}`);
    }
  };

  const handleImportClick = () => {
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
      toast.error(`❌ Import failed: ${err.message}`);
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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showExportDialog) {
          handleCancelExport();
        } else if (showImportDialog) {
          handleCancelImport();
        } else {
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onBack, showExportDialog, showImportDialog]);

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
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
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
      {showExportDialog && (
        <div className="dialog-overlay" onClick={handleCancelExport}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
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
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="dialog-overlay" onClick={handleCancelImport}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
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
      )}
    </div>
  );
};

export default SettingsPage;
