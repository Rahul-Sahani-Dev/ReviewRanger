// qr.js
// A small, self-contained QR Code generator (byte mode, versions 1-40).
// Written for this project from the public QR Code standard (ISO/IEC 18004),
// so it runs fully offline with no external library. Used only to draw the
// transfer code as a scannable image; the copy-and-paste code is the
// reliable path and does not depend on this file.

// ---- error correction characteristics (levels L and M) -----------------
// Each row (version 1..40): [ecCodewordsPerBlock, g1Blocks, g1Data, g2Blocks, g2Data]
const EC_L = [
  [7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],
  [18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69],
  [20,4,81,0,0],[24,2,92,2,93],[26,4,107,0,0],[30,3,115,1,116],[22,5,87,1,88],
  [24,5,98,1,99],[28,1,107,5,108],[30,5,120,1,121],[28,3,113,4,114],[28,3,107,5,108],
  [28,4,116,4,117],[28,2,111,7,112],[30,4,121,5,122],[30,6,117,4,118],[26,8,106,4,107],
  [28,10,114,2,115],[30,8,122,4,123],[30,3,117,10,118],[30,7,116,7,117],[30,5,115,10,116],
  [30,13,115,3,116],[30,17,115,0,0],[30,17,115,1,116],[30,13,115,6,116],[30,12,121,7,122],
  [30,6,121,14,122],[30,17,122,4,123],[30,4,122,18,123],[30,20,117,4,118],[30,19,118,6,119]
];
const EC_M = [
  [10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],
  [16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44],
  [30,1,50,4,51],[22,6,36,2,37],[22,8,37,1,38],[24,4,40,5,41],[24,5,41,5,42],
  [28,7,45,3,46],[28,10,46,1,47],[26,9,43,4,44],[26,3,44,11,45],[26,3,41,13,42],
  [26,17,42,0,0],[28,17,46,0,0],[28,4,47,14,48],[28,6,45,14,46],[28,8,47,13,48],
  [28,19,46,4,47],[28,22,45,3,46],[28,3,45,23,46],[28,21,45,7,46],[28,19,47,10,48],
  [28,2,46,29,47],[28,10,46,23,47],[28,14,46,21,47],[28,14,46,23,47],[28,12,47,26,48],
  [28,6,47,34,48],[28,29,46,14,47],[28,13,46,32,47],[28,40,47,7,48],[28,18,47,31,48]
];
// alignment pattern center coordinates per version
const ALIGN = [
  [],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
  [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
  [6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],
  [6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],
  [6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],
  [6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],
  [6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]
];
// remainder bits per version
const REMAINDER = [0,7,7,7,7,7,0,0,0,0,0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,3,3,3,3,3,3,3,0,0,0,0,0,0];

// ---- Galois field GF(256) ----------------------------------------------
const EXP = new Array(512);
const LOG = new Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
function gmul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}
function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gmul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}
function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen);
  const ecc = new Array(ecLen).fill(0);
  for (const d of data) {
    const factor = d ^ ecc[0];
    ecc.shift();
    ecc.push(0);
    for (let j = 0; j < ecLen; j++) ecc[j] ^= gmul(gen[j + 1], factor);
  }
  return ecc;
}

// ---- data encoding ------------------------------------------------------
function chooseVersion(len, level) {
  const table = level === "L" ? EC_L : EC_M;
  for (let v = 1; v <= 40; v++) {
    const r = table[v - 1];
    const totalData = r[1] * r[2] + r[3] * r[4];
    const countBits = v <= 9 ? 8 : 16;
    const need = 4 + countBits + 8 * len;
    if (need <= totalData * 8) return v;
  }
  return null;
}
function encodeData(bytes, version, level) {
  const r = (level === "L" ? EC_L : EC_M)[version - 1];
  const ecPerBlock = r[0], g1 = r[1], g1d = r[2], g2 = r[3], g2d = r[4];
  const totalData = g1 * g1d + g2 * g2d;

  const bits = [];
  const push = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) push(b, 8);

  const cap = totalData * 8;
  const term = Math.min(4, cap - bits.length);
  for (let i = 0; i < term; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const pad = [0xec, 0x11];
  let pi = 0;
  while (bits.length < cap) {
    push(pad[pi % 2], 8);
    pi++;
  }
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    data.push(v);
  }
  return { data, ecPerBlock, g1, g1d, g2, g2d };
}
function interleave(enc) {
  const { data, ecPerBlock, g1, g1d, g2, g2d } = enc;
  const blocks = [];
  let idx = 0;
  for (let i = 0; i < g1; i++) { blocks.push(data.slice(idx, idx + g1d)); idx += g1d; }
  for (let i = 0; i < g2; i++) { blocks.push(data.slice(idx, idx + g2d)); idx += g2d; }
  const ecBlocks = blocks.map((b) => rsEncode(b, ecPerBlock));

  const out = [];
  const maxData = Math.max(g1d, g2d);
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.length) out.push(b[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const eb of ecBlocks) out.push(eb[i]);
  }
  return out;
}

// ---- matrix building ----------------------------------------------------
function buildMatrix(version, level, bits) {
  const N = version * 4 + 17;
  const mods = Array.from({ length: N }, () => new Array(N).fill(null));
  const fn = Array.from({ length: N }, () => new Array(N).fill(false));
  const data = Array.from({ length: N }, () => new Array(N).fill(false));

  const set = (r, c, dark) => {
    if (r < 0 || c < 0 || r >= N || c >= N) return;
    mods[r][c] = dark;
    fn[r][c] = true;
  };
  const reserve = (r, c) => {
    if (r < 0 || c < 0 || r >= N || c >= N) return;
    fn[r][c] = true;
    if (mods[r][c] === null) mods[r][c] = false;
  };

  // finder patterns + separators
  const finder = (r, c) => {
    for (let dr = -1; dr <= 7; dr++)
      for (let dc = -1; dc <= 7; dc++) {
        const inRing =
          (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
          (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6));
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        set(r + dr, c + dc, inRing || inCore);
      }
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);

  // timing patterns
  for (let i = 8; i < N - 8; i++) {
    const dark = i % 2 === 0;
    if (!fn[6][i]) set(6, i, dark);
    if (!fn[i][6]) set(i, 6, dark);
  }

  // alignment patterns
  const coords = ALIGN[version - 1];
  const last = coords[coords.length - 1];
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      const r = coords[i], c = coords[j];
      if ((r === 6 && c === 6) || (r === 6 && c === last) || (r === last && c === 6))
        continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  }

  // dark module
  set(N - 8, 8, true);

  // reserve format areas
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      reserve(8, i);
      reserve(i, 8);
    }
  }
  for (let i = 0; i < 8; i++) {
    reserve(8, N - 1 - i);
    reserve(N - 1 - i, 8);
  }
  // reserve version areas
  if (version >= 7) {
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 3; j++) {
        reserve(i, N - 11 + j);
        reserve(N - 11 + j, i);
      }
  }

  // place data with the zig-zag walk
  let bi = 0;
  let upward = true;
  for (let col = N - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let i = 0; i < N; i++) {
      const row = upward ? N - 1 - i : i;
      for (let k = 0; k < 2; k++) {
        const cc = col - k;
        if (fn[row][cc]) continue;
        let dark = false;
        if (bi < bits.length) {
          dark = bits[bi] === 1;
          bi++;
        }
        mods[row][cc] = dark;
        data[row][cc] = true;
      }
    }
    upward = !upward;
  }

  // pick the mask with the lowest penalty
  let best = null;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = applyMask(mods, data, mask, N);
    placeFormat(m, level, mask, N);
    if (version >= 7) placeVersion(m, version, N);
    const p = penalty(m, N);
    if (p < bestPenalty) {
      bestPenalty = p;
      best = m;
    }
  }
  return best;
}

function maskCondition(mask, r, c) {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}
function applyMask(mods, data, mask, N) {
  const m = mods.map((row) => row.slice());
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (data[r][c] && maskCondition(mask, r, c)) m[r][c] = !m[r][c];
  return m;
}

function placeFormat(m, level, mask, N) {
  const ecl = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 }[level];
  const value = (ecl << 3) | mask;
  let d = value << 10;
  for (let i = 4; i >= 0; i--) {
    if ((d >> (i + 10)) & 1) d ^= 0x537 << i;
  }
  const bits = ((value << 10) | (d & 0x3ff)) ^ 0x5412;
  const bit = (k) => ((bits >> k) & 1) === 1;

  // copy 1, around the top-left finder:
  //   bits 0..6 run down column 8 (skipping the timing row 6),
  //   bits 7..14 run along row 8 (skipping the timing column 6).
  for (let k = 0; k <= 5; k++) m[k][8] = bit(k);
  m[7][8] = bit(6);
  m[8][8] = bit(7);
  m[8][7] = bit(8);
  for (let k = 9; k <= 14; k++) m[8][14 - k] = bit(k);

  // copy 2: bits 0..7 along row 8 on the right, bits 8..14 up column 8 at the bottom.
  for (let k = 0; k <= 7; k++) m[8][N - 1 - k] = bit(k);
  for (let k = 8; k <= 14; k++) m[N - 15 + k][8] = bit(k);

  m[N - 8][8] = true; // dark module
}
function placeVersion(m, version, N) {
  let d = version << 12;
  for (let i = 5; i >= 0; i--) {
    if ((d >> (i + 12)) & 1) d ^= 0x1f25 << i;
  }
  const bits = (version << 12) | (d & 0xfff);
  for (let i = 0; i < 18; i++) {
    const bit = ((bits >> i) & 1) === 1;
    const a = N - 11 + (i % 3);
    const b = Math.floor(i / 3);
    m[a][b] = bit;
    m[b][a] = bit;
  }
}

function penalty(m, N) {
  let p = 0;
  // rule 1: runs of 5+
  for (let r = 0; r < N; r++) {
    let run = 1;
    for (let c = 1; c < N; c++) {
      if (m[r][c] === m[r][c - 1]) run++;
      else { if (run >= 5) p += run - 2; run = 1; }
    }
    if (run >= 5) p += run - 2;
  }
  for (let c = 0; c < N; c++) {
    let run = 1;
    for (let r = 1; r < N; r++) {
      if (m[r][c] === m[r - 1][c]) run++;
      else { if (run >= 5) p += run - 2; run = 1; }
    }
    if (run >= 5) p += run - 2;
  }
  // rule 2: 2x2 blocks
  for (let r = 0; r < N - 1; r++)
    for (let c = 0; c < N - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3;
    }
  // rule 3: finder-like patterns
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true];
  const match = (r, c, horiz, pat) => {
    for (let i = 0; i < 11; i++) {
      const rr = horiz ? r : r + i;
      const cc = horiz ? c + i : c;
      if (m[rr][cc] !== pat[i]) return false;
    }
    return true;
  };
  for (let r = 0; r < N; r++)
    for (let c = 0; c <= N - 11; c++)
      if (match(r, c, true, pat1) || match(r, c, true, pat2)) p += 40;
  for (let c = 0; c < N; c++)
    for (let r = 0; r <= N - 11; r++)
      if (match(r, c, false, pat1) || match(r, c, false, pat2)) p += 40;
  // rule 4: dark balance
  let dark = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (m[r][c]) dark++;
  const percent = (dark * 100) / (N * N);
  const prev = Math.floor(percent / 5) * 5;
  const next = prev + 5;
  p += (Math.min(Math.abs(prev - 50), Math.abs(next - 50)) / 5) * 10;
  return p;
}

function generateMatrix(text, opts) {
  const level = (opts && opts.level) || "M";
  const bytes = Array.from(new TextEncoder().encode(text));
  let lvl = level;
  let version = chooseVersion(bytes.length, lvl);
  if (version === null && lvl !== "L") {
    lvl = "L";
    version = chooseVersion(bytes.length, lvl);
  }
  if (version === null) throw new Error("Too much data for a single QR code.");
  const enc = encodeData(bytes, version, lvl);
  const codewords = interleave(enc);
  const bits = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  // remainder bits are left as 0 (zeros) by the placement walk
  return buildMatrix(version, lvl, bits);
}

// ---- public: draw onto a canvas ----------------------------------------
export function renderQR(canvas, text, opts) {
  const matrix = generateMatrix(text, opts);
  const N = matrix.length;
  const quiet = 4;
  const total = N + quiet * 2;
  const target = (opts && opts.size) || 240;
  const scale = Math.max(2, Math.floor(target / total));
  const dim = total * scale;

  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext("2d");
  // High-contrast black on white scans most reliably on any device.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = "#000000";
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (matrix[r][c]) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
  return true;
}

// exposed for self-tests
export const __test = { generateMatrix };
