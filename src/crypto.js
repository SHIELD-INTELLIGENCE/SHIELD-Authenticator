import CryptoJS from "crypto-js";

const MASTER_KEY = "YOUR_SUPER_SECURE_KEY_32CHARS"; // 32-char key

export function encryptSecret(secret) {
  return CryptoJS.AES.encrypt(secret, MASTER_KEY).toString();
}

export function decryptSecret(encrypted) {
  return CryptoJS.AES.decrypt(encrypted, MASTER_KEY).toString(CryptoJS.enc.Utf8);
}