import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("shield-sort-preference") || "name-asc");

  useEffect(() => {
    localStorage.setItem("shield-mask-codes", maskCodes);
  }, [maskCodes]);

  useEffect(() => {
    localStorage.setItem("shield-sort-preference", sortBy);
  }, [sortBy]);

  return {
    isAndroid,
    showMobileLanding,
    maskCodes,
    setMaskCodes,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
