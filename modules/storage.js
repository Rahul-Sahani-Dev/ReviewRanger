// storage.js
// On-device save only. Nothing ever leaves the machine.
// Named local profiles for shared computers, plus a guest mode and a
// one-tap wipe that clears localStorage, IndexedDB, and Cache Storage.

const PREFIX = "rr.";
const K_PROFILES = PREFIX + "profiles";
const K_ACTIVE = PREFIX + "active";
const K_SETTINGS = PREFIX + "settings";
const profileKey = (name) => PREFIX + "profile." + name;

export const GUEST = "__guest__";

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function emptyProgress() {
  return { completed: {}, position: { theme: 0, puzzle: 0 }, version: 1 };
}

export function listProfiles() {
  return readJSON(K_PROFILES, []);
}
export function profileExists(name) {
  return listProfiles().includes(name);
}

export function createProfile(rawName) {
  const name = String(rawName || "").trim().slice(0, 40);
  if (!name || name === GUEST) return null;
  const profiles = listProfiles();
  if (!profiles.includes(name)) {
    profiles.push(name);
    writeJSON(K_PROFILES, profiles);
  }
  if (!localStorage.getItem(profileKey(name))) {
    writeJSON(profileKey(name), emptyProgress());
  }
  setActiveProfile(name);
  return name;
}

export function setActiveProfile(name) {
  writeJSON(K_ACTIVE, name);
}
export function getActiveProfile() {
  return readJSON(K_ACTIVE, null);
}

export function loadProgress(name) {
  const who = name || getActiveProfile() || GUEST;
  return readJSON(profileKey(who), emptyProgress());
}
export function saveProgress(name, progress) {
  const who = name || getActiveProfile() || GUEST;
  return writeJSON(profileKey(who), progress);
}

// Settings are shared across profiles on this machine.
export function loadSettings() {
  return readJSON(K_SETTINGS, {
    // The cream, paper-like light theme is the identity. Dark is one tap
    // away in Settings (auto / light / dark).
    mute: false,
    theme: "light",
    motion: "auto",
    readAloud: false,
  });
}
export function saveSettings(settings) {
  return writeJSON(K_SETTINGS, settings);
}

// Database names this app might create. Browsers like Firefox (and older
// Safari) do not support indexedDB.databases(), so we always try these names
// directly too. Keep this list in sync if IndexedDB is ever used.
const KNOWN_DBS = ["reviewranger"];

// The one-tap wipe. Clears everything this app could have stored, so a
// shared or library computer is left with no trace.
export async function wipeAll() {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  // IndexedDB: delete every database we can see, plus any known names (so the
  // wipe still works where indexedDB.databases() is unsupported).
  try {
    let names = [...KNOWN_DBS];
    if (window.indexedDB && indexedDB.databases) {
      const dbs = await indexedDB.databases();
      names = names.concat((dbs || []).map((d) => d && d.name).filter(Boolean));
    }
    await Promise.all([...new Set(names)].map((n) => deleteDb(n)));
  } catch {
    /* ignore */
  }
  // Tear down the service worker so it can no longer repopulate the cache,
  // then clear Cache Storage. We clear once before and once after the
  // unregister, so an in-flight fetch cannot leave the offline files behind.
  await clearCaches();
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
  } catch {
    /* ignore */
  }
  await clearCaches();
}

async function clearCaches() {
  try {
    if (window.caches && caches.keys) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch {
    /* ignore */
  }
}

function deleteDb(name) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}
