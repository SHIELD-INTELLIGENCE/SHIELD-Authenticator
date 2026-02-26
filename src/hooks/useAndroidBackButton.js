import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

export function useAndroidBackButton({
  confirmDialogOpen,
  secureStorageDialogOpen,
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
}) {
  useEffect(() => {
    let listenerHandle;

    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      const currentPath = window.location?.pathname || "";

      if (confirmDialogOpen) {
        closeConfirm();
      } else if (secureStorageDialogOpen) {
        closeSecureStorageDialog();
      } else if (settingsHasOpenDialog) {
        return;
      } else if (currentPath === "/settings") {
        if (canGoBack) {
          window.history.back();
        } else {
          window.history.replaceState({}, "", "/dashboard");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } else if (showDelete) {
        setShowDelete(null);
      } else if (editing) {
        setEditing(null);
        setForm({ email: "", password: "", name: "", secret: "", website: "" });
      } else if (showSettings) {
        setShowSettings(false);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      } else if (vaultDialogOpen) {
      } else if (vaultUnlocked && user && (currentPath === "/dashboard" || currentPath === "/")) {
        CapacitorApp.minimizeApp().catch(() => {
          console.log("Minimize not available");
        });
      } else if (canGoBack) {
        window.history.back();
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, [
    confirmDialogOpen,
    secureStorageDialogOpen,
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
  ]);
}
