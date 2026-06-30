// transfer.js
// Move a learner's progress between devices with no server.
//
// The reliable path is a copy-and-paste text code (works everywhere,
// offline). A QR image of that same code is offered as a convenience,
// drawn locally. Reading a QR back uses the browser's built-in
// BarcodeDetector when present, and is simply hidden when it is not.

import { renderQR } from "./qr.js";

const PREFIX = "RR1:";

function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64ToUtf8(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Turn a progress object into a shareable code string.
export function exportCode(progress) {
  const payload = JSON.stringify({ v: 1, p: progress });
  return PREFIX + utf8ToB64(payload);
}

// Turn a code string back into a progress object, or null if it is not ours.
export function importCode(raw) {
  try {
    let s = String(raw || "").trim();
    if (s.startsWith(PREFIX)) s = s.slice(PREFIX.length);
    const obj = JSON.parse(b64ToUtf8(s));
    if (obj && obj.p && typeof obj.p === "object") return obj.p;
    return null;
  } catch {
    return null;
  }
}

// Draw the code as a QR onto a canvas. Returns true on success.
export function drawQRCode(canvas, text) {
  try {
    return renderQR(canvas, text);
  } catch {
    return false;
  }
}

// --- reading a QR back (optional, graceful) --------------------------
export function scanSupported() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export async function scanImageFile(file) {
  if (!scanSupported() || !file) return null;
  try {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const bitmap = await createImageBitmap(file);
    const codes = await detector.detect(bitmap);
    if (codes && codes.length) return codes[0].rawValue;
    return null;
  } catch {
    return null;
  }
}
