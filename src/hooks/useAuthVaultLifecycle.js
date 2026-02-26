import { useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../Utils/firebase";
import { getAccounts } from "../Utils/services";
import { lockVault, getVaultMeta, unlockVault } from "../Utils/vault";
import { checkOnlineStatus } from "../Utils/networkUtils";
import { secureSetItem, secureGetItemWithStatus, secureRemoveItem, SECURE_STORAGE_GET_KEY_ERROR } from "../Utils/secureStorage";
import { RECOVERY_QUESTION_BANK } from "../Utils/recoveryQuestions";
import {
  vaultRememberKeyForEmail,
  markVaultKnownForEmail,
  isVaultLikelyKnownForEmail,
  markOfflineReadyForEmail,
  isOfflineReadyForEmail,
} from "../Utils/vaultLocalState";

export function useAuthVaultLifecycle({
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
}) {
  const loadAccounts = useCallback(async (u) => {
    if (!u) return;
    setLoadingAccounts(true);
    try {
      const data = await getAccounts(u);
      setAccounts(data);
      const email = u?.email || "";

      if (checkOnlineStatus()) {
        markOfflineReadyForEmail(email);
        setOfflineReady(true);
      } else if (data.length > 0) {
        markOfflineReadyForEmail(email);
        setOfflineReady(true);
      }

      if (!checkOnlineStatus() && data.length === 0) {
        toast.info("No locally cached accounts yet. Connect once online to sync this device.");
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoadingAccounts(false);
    }
  }, [setLoadingAccounts, setAccounts, setOfflineReady]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const email = u?.email || "";
        setOfflineReady(isOfflineReadyForEmail(email));
        setAccounts([]);
        setVaultError("");
        setVaultUnlocking(true);
        setVaultUnlocked(false);

        getVaultMeta(u)
          .then(async (meta) => {
            if (!meta) {
              const vaultLikelyKnown = isVaultLikelyKnownForEmail(email);

              if (!checkOnlineStatus() || vaultLikelyKnown) {
                setVaultMode("unlock");
                setVaultError(
                  !checkOnlineStatus()
                    ? "Offline mode detected. Vault metadata could not be refreshed. Enter passphrase to continue."
                    : "Vault metadata refresh failed. Enter passphrase to continue."
                );
              } else {
                setVaultMode("setup");
                setVaultRecoveryConfig({ questions: [] });
              }
              setVaultDialogOpen(true);
              setVaultUnlocking(false);
              return;
            }

            markVaultKnownForEmail(u?.email || "");

            if (meta?.v === 2 && meta?.recovery?.questions?.length) {
              const ids = meta.recovery.questions;
              const questions = RECOVERY_QUESTION_BANK.filter((q) => ids.includes(q.id));
              setVaultRecoveryConfig({ questions });
            } else {
              setVaultRecoveryConfig({ questions: [] });
            }

            setVaultMode("unlock");

            const rememberedKey = vaultRememberKeyForEmail(email);
            const { value: remembered, error: rememberError } = email
              ? await secureGetItemWithStatus(rememberedKey)
              : { value: null, error: null };

            if (rememberError) {
              setSecureStorageDialog({
                open: true,
                message: `${SECURE_STORAGE_GET_KEY_ERROR}. Please enter your vault passphrase manually to continue safely.`,
              });
            }

            const shouldRemember = !!remembered;
            if (remembered) {
              unlockVault(u, remembered)
                .then(() => loadAccounts(u))
                .then(() => {
                  if (shouldRemember && remembered) secureSetItem(rememberedKey, remembered);
                  setVaultDialogOpen(false);
                  setVaultPassphrase("");
                  setVaultRemember(shouldRemember);
                  setVaultUnlocked(true);
                  markVaultKnownForEmail(u?.email || "");
                })
                .catch((err) => {
                  const unlockMessage = String(err?.message || "").toLowerCase();
                  const shouldPreserveRemembered = !checkOnlineStatus() || unlockMessage.includes("network") || unlockMessage.includes("offline");
                  if (!shouldPreserveRemembered) secureRemoveItem(vaultRememberKeyForEmail(u?.email || ""));
                  setVaultPassphrase("");
                  setVaultRemember(shouldRemember && shouldPreserveRemembered);
                  if (!checkOnlineStatus()) {
                    setVaultError("Offline mode detected. Auto-unlock failed, please enter your passphrase to continue.");
                  }
                  setVaultDialogOpen(true);
                })
                .finally(() => setVaultUnlocking(false));
            } else {
              setVaultPassphrase("");
              setVaultRemember(false);
              setVaultDialogOpen(true);
              setVaultUnlocking(false);
            }
          })
          .catch(() => {
            if (!checkOnlineStatus()) {
              setVaultMode("unlock");
              setVaultDialogOpen(true);
              setVaultError("Offline mode detected. Enter your vault passphrase to continue.");
              setVaultUnlocking(false);
              return;
            }

            setVaultMode("setup");
            setVaultRecoveryConfig({ questions: [] });
            setVaultDialogOpen(true);
            setVaultUnlocking(false);
          });
      } else {
        setAccounts([]);
        lockVault();
        setOfflineReady(false);
        setVaultDialogOpen(false);
        setVaultPassphrase("");
        setVaultError("");
      }
      setLoadingAuth(false);
    });

    return unsub;
  }, [
    setUser,
    setAccounts,
    setLoadingAuth,
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
    setLoadingAccounts,
    loadAccounts,
  ]);

  return { loadAccounts };
}
