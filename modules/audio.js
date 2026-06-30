// audio.js
// Gentle confirmation tones only.
//
// There is deliberately NO failure sound anywhere in this file or this app.
// Nothing the learner does is ever marked wrong, so nothing ever sounds wrong.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = !!value;
}
export function isMuted() {
  return muted;
}

function ensureCtx() {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, durationMs, peak, startOffset = 0) {
  const c = ensureCtx();
  if (!c) return;
  const start = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000 + 0.03);
}

// A soft tick when a flag is toggled.
export function playToggle() {
  tone(440, 80, 0.05);
}

// A warm, rising two-note chime on a reveal. Always gentle. Never a "you failed" sound.
export function playReveal() {
  tone(523.25, 130, 0.06, 0);
  tone(659.25, 190, 0.06, 0.12);
}

// A soft tone when a session starts.
export function playStart() {
  tone(392, 150, 0.05);
}
