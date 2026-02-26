import { useEffect } from "react";
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
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online", {
        autoClose: 2000,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        ),
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection", {
        autoClose: false,
        icon: () => (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
          </svg>
        ),
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline]);
}
