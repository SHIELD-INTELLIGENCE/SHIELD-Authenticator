// Copyright © 2026 SHIELD Intelligence. All rights reserved.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";

export function useDeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    let listenerHandle;

    CapacitorApp.addListener("appUrlOpen", (data) => {
      const url = data?.url;
      if (!url) return;

      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // Handle Firebase password reset links
        if (pathname.includes("/reset-password") || pathname.includes("reset-password")) {
          // Firebase sends the code as 'oobCode' parameter
          const oobCode = searchParams.get("oobCode") || searchParams.get("oobcode");
          if (oobCode) {
            navigate(`/reset-password?oobCode=${encodeURIComponent(oobCode)}`);
            return;
          }
        }

        // Handle other custom routes as needed
        navigate(pathname + url.substring(url.indexOf("?") >= 0 ? url.indexOf("?") : url.length));
      } catch (err) {
        console.warn("Failed to parse deep link:", err);
      }
    }).then((handle) => {
      listenerHandle = handle;
    }).catch((err) => {
      console.warn("Failed to add appUrlOpen listener:", err);
    });

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, [navigate]);
}
