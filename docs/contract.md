# Contract — srt-shift-core

Pure ESM in `src/srt.mjs`, zero runtime dependencies, Node >= 22.
LF/CRLF accepted; output LF with trailing newline, renumbered from 1.

| Export | Result |
| --- | --- |
| `MAX_CUES` (5000) · `MAX_SHIFT_MS` (10h) | Hard bounds. |
| `parseTimestamp` / `formatTimestamp` | `HH:MM:SS,mmm` (hours unbounded above 99) ↔ integer ms. |
| `parseSRT(text)` | Frozen `[{start, end, text}]`. Multiline text preserved. |
| `shiftCues(cues, deltaMs)` | Shifted frozen array. Negative results throw `NEGATIVE` with cue number — never clamped silently. |
| `findOverlaps(cues)` | `[[i, i+1]]` where the next cue starts before the previous ends. |
| `formatSRT(cues)` | Canonical renumbered text. `format(parse(x))` is a fixed point. |

Errors: `NOT_STRING` · `EMPTY` · `BAD_BLOCK` · `BAD_INDEX` · `BAD_TIMING` ·
`BAD_TIMESTAMP` · `BAD_RANGE` · `NOT_ARRAY` · `BAD_SHIFT` · `NEGATIVE` · `BAD_MS`.
