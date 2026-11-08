#!/usr/bin/env node
// Demo: shift a fixed sample, assert exact output. --assert exits non-zero on mismatch.
import { parseSRT, shiftCues, formatSRT, findOverlaps } from '../src/srt.mjs';

const SAMPLE = `1\n00:00:10,000 --> 00:00:12,000\nHi\n\n2\n00:00:13,000 --> 00:00:15,000\nThere\n`;
const EXPECTED = `1\n00:00:12,500 --> 00:00:14,500\nHi\n\n2\n00:00:15,500 --> 00:00:17,500\nThere\n`;

let failed = 0;
const got = formatSRT(shiftCues(parseSRT(SAMPLE), 2500));
if (got !== EXPECTED) {
  failed++;
  console.log('FAIL shift output differs');
  console.log(JSON.stringify(got));
} else {
  console.log('PASS shift +2500ms exact');
}
const overlaps = findOverlaps(parseSRT(SAMPLE));
if (overlaps.length !== 0) {
  failed++;
  console.log('FAIL unexpected overlaps');
} else {
  console.log('PASS no overlaps in sample');
}
if (process.argv.includes('--assert') && failed > 0) process.exit(1);
if (failed > 0) process.exitCode = 1;
console.log(failed === 0 ? 'demo: all cases as expected' : `demo: ${failed} mismatch(es)`);
