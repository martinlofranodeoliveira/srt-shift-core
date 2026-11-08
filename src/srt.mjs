// SPDX-License-Identifier: MIT
// SRT subtitle shifting: parse, shift by milliseconds, detect overlaps,
// serialize renumbered. Pure text processing. No network, no I/O.

export const MAX_CUES = 5000;
export const MAX_SHIFT_MS = 36000000; // 10h

export class SrtError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'SrtError';
    this.code = code;
  }
}

const TS = /(\d+):(\d{2}):(\d{2}),(\d{3})/;

/** 'HH:MM:SS,mmm' -> integer milliseconds. */
export function parseTimestamp(s) {
  const m = TS.exec(s ?? '');
  if (!m) throw new SrtError('BAD_TIMESTAMP', String(s).slice(0, 24));
  const [, h, mi, se, ms] = m.map(Number);
  if (mi > 59 || se > 59) throw new SrtError('BAD_TIMESTAMP', String(s).slice(0, 24));
  return ((h * 60 + mi) * 60 + se) * 1000 + ms;
}

/** Integer milliseconds -> 'HH:MM:SS,mmm' (hours unpadded beyond 99). */
export function formatTimestamp(ms) {
  if (!Number.isInteger(ms) || ms < 0) throw new SrtError('BAD_MS');
  const h = Math.floor(ms / 3600000);
  const mi = Math.floor((ms % 3600000) / 60000);
  const se = Math.floor((ms % 60000) / 1000);
  const m = ms % 1000;
  const p2 = (n) => String(n).padStart(2, '0');
  const p3 = (n) => String(n).padStart(3, '0');
  const hh = h < 100 ? p2(h) : String(h);
  return `${hh}:${p2(mi)}:${p2(se)},${p3(m)}`;
}

/** Parse SRT text -> frozen [{start, end, text}]. Throws on structural errors. */
export function parseSRT(text) {
  if (typeof text !== 'string') throw new SrtError('NOT_STRING');
  const normalized = text.replace(/\r\n?/g, '\n').trim();
  if (!normalized) throw new SrtError('EMPTY');
  const blocks = normalized.split(/\n{2,}/);
  if (blocks.length > MAX_CUES) throw new SrtError('TOO_MANY_CUES');
  const cues = blocks.map((block, i) => {
    const lines = block.split('\n');
    if (lines.length < 2) throw new SrtError('BAD_BLOCK', `block ${i + 1}`);
    if (!/^\d+$/.test(lines[0].trim())) throw new SrtError('BAD_INDEX', `block ${i + 1}`);
    const arrow = lines[1].split('-->');
    if (arrow.length !== 2) throw new SrtError('BAD_TIMING', `block ${i + 1}`);
    const start = parseTimestamp(arrow[0].trim());
    const end = parseTimestamp(arrow[1].trim());
    if (end <= start) throw new SrtError('BAD_RANGE', `block ${i + 1}`);
    return Object.freeze({ start, end, text: lines.slice(2).join('\n') });
  });
  return Object.freeze(cues);
}

/** Shift all cues by deltaMs. Throws NEGATIVE with 1-based cue number. */
export function shiftCues(cues, deltaMs) {
  if (!Array.isArray(cues)) throw new SrtError('NOT_ARRAY');
  if (!Number.isInteger(deltaMs) || Math.abs(deltaMs) > MAX_SHIFT_MS) throw new SrtError('BAD_SHIFT');
  return Object.freeze(cues.map((c, i) => {
    const start = c.start + deltaMs;
    const end = c.end + deltaMs;
    if (start < 0 || end < 0) throw new SrtError('NEGATIVE', `cue ${i + 1}`);
    return Object.freeze({ start, end, text: c.text });
  }));
}

/** Pairs [i, j] (0-based, j = i+1 chain) where cue j starts before cue i ends. */
export function findOverlaps(cues) {
  const out = [];
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end) out.push([i - 1, i]);
  }
  return out;
}

/** Serialize cues renumbered from 1 with blank-line separators and LF end. */
export function formatSRT(cues) {
  return cues.map((c, i) => `${i + 1}\n${formatTimestamp(c.start)} --> ${formatTimestamp(c.end)}\n${c.text}`).join('\n\n') + '\n';
}
