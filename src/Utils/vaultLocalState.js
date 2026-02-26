// Copyright © 2026 SHIELD Intelligence. All rights reserved.

export function vaultRememberKeyForEmail(email) {
  return `shield-vault-passphrase:${String(email || "").trim().toLowerCase()}`;
}

export function vaultKnownKeyForEmail(email) {
  return `shield-vault-known:${String(email || "").trim().toLowerCase()}`;
}

export function markVaultKnownForEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return;

  try {
    localStorage.setItem(vaultKnownKeyForEmail(normalized), "1");
  } catch {
    // best-effort local marker
  }
}

export function isVaultLikelyKnownForEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;

  try {
    const knownMarker = localStorage.getItem(vaultKnownKeyForEmail(normalized)) === "1";
    const rememberedEntryExists = !!localStorage.getItem(vaultRememberKeyForEmail(normalized));
    return knownMarker || rememberedEntryExists;
  } catch {
    return false;
  }
}

export function offlineReadyKeyForEmail(email) {
  return `shield-offline-ready:${String(email || "").trim().toLowerCase()}`;
}

export function markOfflineReadyForEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return;

  try {
    localStorage.setItem(offlineReadyKeyForEmail(normalized), "1");
  } catch {
    // best-effort local marker
  }
}

export function isOfflineReadyForEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;

  try {
    return localStorage.getItem(offlineReadyKeyForEmail(normalized)) === "1";
  } catch {
    return false;
  }
}
