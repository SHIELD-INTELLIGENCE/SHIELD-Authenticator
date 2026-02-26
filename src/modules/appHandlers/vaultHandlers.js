import { logout } from "../../Utils/services";
import { setupVault, unlockVault, recoverAndResetPassphrase, lockVault } from "../../Utils/vault";
import { handleError, checkOnlineStatus } from "../../Utils/networkUtils";
import { secureSetItem, secureRemoveItem } from "../../Utils/secureStorage";
import { RECOVERY_QUESTION_BANK } from "../../Utils/recoveryQuestions";
import { vaultRememberKeyForEmail, markVaultKnownForEmail } from "../../Utils/vaultLocalState";

export function createVaultHandlers({
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
}) {
  const handleLogout = () => {
    setShowSettings(false);
    setLoadingLogout(true);
    setVaultUnlocked(false);
    lockVault();

    const email = user?.email || "";
    if (email) {
      secureRemoveItem(vaultRememberKeyForEmail(email));
    }

    setTimeout(() => {
      logout().finally(() => {
        setLoadingLogout(false);
      });
    }, 500);
  };

  const handleUnlockVault = async () => {
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

    setVaultUnlocking(true);
    try {
      await unlockVault(user, trimmedPassphrase);

      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, trimmedPassphrase);
        else secureRemoveItem(storageKey);
      }

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultUnlocked(true);
      markVaultKnownForEmail(user?.email || "");
      await loadAccounts(user);
    } catch (e) {
      if (!checkOnlineStatus() && String(e?.message || "").toLowerCase().includes("not set up")) {
        setVaultError("Vault metadata is not available offline on this device yet. Connect once online, then retry.");
      } else {
        setVaultError(e.message || "Failed to unlock vault");
      }
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
      markVaultKnownForEmail(user?.email || "");
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

    const trimmedAnswers = Array.isArray(answers) ? answers.map((a) => String(a || "").toLowerCase().trim()) : [];
    if (trimmedAnswers.some((a) => !a)) {
      setVaultError("Please provide answers for all recovery questions");
      return;
    }

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

      const email = user?.email || "";
      if (email) {
        const storageKey = vaultRememberKeyForEmail(email);
        if (vaultRemember) await secureSetItem(storageKey, trimmedNewPassphrase);
        else secureRemoveItem(storageKey);
      }

      setVaultDialogOpen(false);
      setVaultPassphrase("");
      setVaultUnlocked(true);
      markVaultKnownForEmail(user?.email || "");
      await loadAccounts(user);
    } catch (e) {
      const errorMsg = handleError(e, "Failed to recover vault");
      setVaultError(errorMsg);
    } finally {
      setVaultUnlocking(false);
    }
  };

  return {
    handleLogout,
    handleUnlockVault,
    handleSetupVault,
    handleRecoverVault,
  };
}
