// Remembers the secret code on this device so it only has to be typed once.
// The server checks it on every save; this only decides which screen to show.
import { checkCode } from "./recipes";

const KEY = "cookbook:secret";
let memoryCode = null;

export function storedCode() {
  try {
    return localStorage.getItem(KEY) ?? memoryCode;
  } catch {
    return memoryCode;
  }
}

export function isUnlocked() {
  return !!storedCode();
}

// Resolves true/false for right/wrong code; rejects on network errors.
export async function unlock(code) {
  code = code.trim();
  if (!(await checkCode(code))) return false;
  memoryCode = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // Private mode: still unlocked for this visit.
  }
  return true;
}

export function lock() {
  memoryCode = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
}
