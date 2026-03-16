import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { setAndroidScreenSecurityEnabled } from "../Utils/screenSecurity";

export function useAppPreferences() {
  const platformName = Capacitor.getPlatform();
  const isAndroidDevice = platformName === "android";
  const hasSeenLanding = isAndroidDevice ? localStorage.getItem("shield-mobile-landing-seen") : "true";

  const [isAndroid] = useState(isAndroidDevice);
  const [showMobileLanding] = useState(isAndroidDevice && !hasSeenLanding);

  const [maskCodes, setMaskCodes] = useState(() => {
    const saved = localStorage.getItem("shield-mask-codes");
    return saved === "true";
  });
  const [showProviderLogos, setShowProviderLogos] = useState(() => {
    const saved = localStorage.getItem("shield-show-provider-logos");
    return saved === null ? true : saved === "true";
  });
  const [preventScreenViewing, setPreventScreenViewing] = useState(() => {
    if (!isAndroidDevice) return false;
    const saved = localStorage.getItem("shield-android-screen-protection");
    return saved === null ? true : saved === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("shield-sort-preference") || "name-asc");

  useEffect(() => {
    localStorage.setItem("shield-mask-codes", maskCodes);
  }, [maskCodes]);

  useEffect(() => {
    localStorage.setItem("shield-sort-preference", sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem("shield-show-provider-logos", String(showProviderLogos));
  }, [showProviderLogos]);

  useEffect(() => {
    if (!isAndroidDevice) return;
    localStorage.setItem("shield-android-screen-protection", String(preventScreenViewing));
    setAndroidScreenSecurityEnabled(preventScreenViewing);
  }, [isAndroidDevice, preventScreenViewing]);

  return {
    isAndroid,
    showMobileLanding,
    maskCodes,
    setMaskCodes,
    showProviderLogos,
    setShowProviderLogos,
    preventScreenViewing,
    setPreventScreenViewing,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
