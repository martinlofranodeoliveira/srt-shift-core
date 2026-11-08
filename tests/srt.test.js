import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTimestamp, formatTimestamp, parseSRT, shiftCues, findOverlaps, formatSRT, SrtError } from '../src/srt.mjs';

const SAMPLE = `1\n00:00:01,000 --> 00:00:04,000\nHello\n\n2\n00:00:05,500 --> 00:00:07,000\n brave\nnew\n\n3\n01:02:03,004 --> 01:02:05,000\nWorld\n`;

describe('timestamps', () => {
  it('round-trips including long hours', () => {
    assert.equal(parseTimestamp('01:02:03,004'), 3723004);
    assert.equal(formatTimestamp(3723004), '01:02:03,004');
    assert.equal(formatTimestamp(0), '00:00:00,000');
  });
  it('rejects bad stamps', () => {
    assert.throws(() => parseTimestamp('00:61:00,000'), (e) => e.code === 'BAD_TIMESTAMP');
    assert.throws(() => parseTimestamp('nope'), (e) => e.code === 'BAD_TIMESTAMP');
    assert.throws(() => formatTimestamp(-1), (e) => e.code === 'BAD_MS');
  });
});

describe('parse and format', () => {
  it('parses three cues with multiline text', () => {
    const cues = parseSRT(SAMPLE);
    assert.equal(cues.length, 3);
    assert.equal(cues[1].text, ' brave\nnew');
    assert.equal(cues[2].start, 3723004);
  });
  it('round-trips normalized text', () => {
    const once = formatSRT(parseSRT(SAMPLE));
    assert.equal(formatSRT(parseSRT(once)), once);
  });
  it('rejects bad structure', () => {
    assert.throws(() => parseSRT(''), (e) => e.code === 'EMPTY');
    assert.throws(() => parseSRT('x\n00:00:01,000 --> 00:00:02,000\nt'), (e) => e.code === 'BAD_INDEX');
    assert.throws(() => parseSRT('1\n00:00:02,000 --> 00:00:01,000\nt'), (e) => e.code === 'BAD_RANGE');
    assert.ok(new SrtError('X') instanceof Error);
  });
});

describe('shift and overlaps', () => {
  it('shifts by +1500ms', () => {
    const shifted = shiftCues(parseSRT(SAMPLE), 1500);
    assert.equal(formatTimestamp(shifted[0].start), '00:00:02,500');
    assert.equal(formatSRT(shifted).split('\n')[0], '1');
  });
  it('negative shift below zero throws with cue number', () => {
    assert.throws(() => shiftCues(parseSRT(SAMPLE), -1500), (e) => e.code === 'NEGATIVE');
  });
  it('detects overlaps created by uneven shift', () => {
    const cues = [{ start: 1000, end: 4000 }, { start: 3000, end: 5000 }, { start: 6000, end: 7000 }];
    assert.deepEqual(findOverlaps(cues), [[0, 1]]);
    assert.deepEqual(findOverlaps(shiftCues(parseSRT(SAMPLE), 0)), []);
  });
});
