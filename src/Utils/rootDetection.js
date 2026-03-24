import { Capacitor, registerPlugin } from "@capacitor/core";

const RootDetectionPlugin = registerPlugin("RootDetectionPlugin");
const ROOT_WARNING_SEEN_KEY = "shield-root-warning-seen";
const ROOT_WARNING_SUPPRESS_KEY = "shield-root-warning-suppress";

function isAndroidNative() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

export async function getRootStatus() {
  if (!isAndroidNative()) {
    return { supported: false, rooted: false, reasons: [] };
  }

  try {
    const result = await RootDetectionPlugin.isRooted();
    const rooted = !!result?.rooted;
    const reasons = Array.isArray(result?.reasons) ? result.reasons : [];
    return { supported: true, rooted, reasons };
  } catch {
    return { supported: false, rooted: false, reasons: [] };
  }
}

export function shouldShowRootWarning() {
  try {
    const seen = localStorage.getItem(ROOT_WARNING_SEEN_KEY) === "1";
    const suppressed = localStorage.getItem(ROOT_WARNING_SUPPRESS_KEY) === "1";
    return !seen && !suppressed;
  } catch {
    return true;
  }
}

export function markRootWarningSeen() {
  try {
    localStorage.setItem(ROOT_WARNING_SEEN_KEY, "1");
  } catch {
    // best-effort local marker
  }
}

export function suppressRootWarningPermanently() {
  try {
    localStorage.setItem(ROOT_WARNING_SEEN_KEY, "1");
    localStorage.setItem(ROOT_WARNING_SUPPRESS_KEY, "1");
  } catch {
    // best-effort local marker
  }
}