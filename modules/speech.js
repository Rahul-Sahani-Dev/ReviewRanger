// speech.js
// Optional read-aloud through the browser's own voice.
// Always paired with on-screen text. Absent gracefully where unsupported.

export function isSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text) {
  if (!isSupported() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch {
    /* speaking is a nice-to-have; never let it break the page */
  }
}

export function stop() {
  if (!isSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
