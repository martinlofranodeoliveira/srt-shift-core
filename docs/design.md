# Design — srt-shift-core

Blocks split on blank lines; each needs a numeric index, one timing line
with `-->`, and at least an (possibly empty) text body. `end <= start`
fails instead of producing zero-length cues. Hours are unbounded (long
lectures), minutes/seconds capped at 59.

Shifting is pure addition; going below zero throws with the 1-based cue
number so the caller fixes the offset instead of receiving clipped
silence. Overlap detection is a single adjacent scan — sufficient because
well-formed cues are time-ordered.

Oracle: hand-timed samples with exact expected output strings, plus a
parse→format fixed-point test. Millisecond math is integer-only.
