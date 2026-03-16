import { Capacitor, registerPlugin } from "@capacitor/core";

const ScreenSecurity = registerPlugin("ScreenSecurity");

export async function setAndroidScreenSecurityEnabled(enabled) {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    await ScreenSecurity.setEnabled({ enabled: Boolean(enabled) });
  } catch (error) {
    console.warn("Failed to update Android screen security setting", error);
  }
}
