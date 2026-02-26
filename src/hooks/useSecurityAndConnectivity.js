import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { toast } from "react-toastify";

export function useSecurityAndConnectivity(setIsOnline) {
  useEffect(() => {
    if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
      console.error("App is not running in a secure context. Crypto APIs may not be available.");
      toast.error("Please access this app via HTTPS for security features to work properly.", {
        autoClose: 5000,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        ),
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let nativeNetworkListener = null;
    let offlineTransitionTimer = null;

    const applyConnectivity = (isConnected) => {
      if (!isMounted) return;

      window.__shieldOnlineStatus = isConnected;
      setIsOnline((previous) => {
        if (previous === isConnected) return previous;
        return isConnected;
      });
    };

    const setConnectivity = (isConnected) => {
      if (isConnected) {
        if (offlineTransitionTimer) {
          clearTimeout(offlineTransitionTimer);
          offlineTransitionTimer = null;
        }
        applyConnectivity(true);
        return;
      }

      if (offlineTransitionTimer) return;

      offlineTransitionTimer = setTimeout(() => {
        offlineTransitionTimer = null;
        applyConnectivity(false);
      }, 450);
    };

    const refreshNetworkStatus = async () => {
      try {
        const { connected } = await Network.getStatus();
        if (isMounted) setConnectivity(connected);
      } catch {
        if (isMounted) setConnectivity(navigator.onLine);
      }
    };

    const handleOnline = () => setConnectivity(true);
    const handleOffline = () => setConnectivity(false);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshNetworkStatus();
      }
    };
    const handleFocus = () => {
      refreshNetworkStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    refreshNetworkStatus();

    if (Capacitor.isNativePlatform()) {
      Network.addListener("networkStatusChange", (status) => {
        if (isMounted) setConnectivity(status.connected);
      })
        .then((listener) => {
          nativeNetworkListener = listener;
        })
        .catch((error) => {
          console.warn("Unable to subscribe to native network status changes", error);
        });
    }

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (nativeNetworkListener) {
        nativeNetworkListener.remove();
      }

      if (offlineTransitionTimer) {
        clearTimeout(offlineTransitionTimer);
        offlineTransitionTimer = null;
      }

      delete window.__shieldOnlineStatus;
    };
  }, [setIsOnline]);
}
