const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldMarkLessonCompleted, computeProgressPercent } = require('../src/utils/progressRules');

test('reading lesson completes only after minimum seconds', () => {
  const lesson = { min_read_seconds: 180 };
  assert.equal(shouldMarkLessonCompleted(lesson, 120, 50, false), false);
  assert.equal(shouldMarkLessonCompleted(lesson, 180, 50, false), true);
});

test('non-reading lesson completes when last position >= 95', () => {
  const lesson = { min_read_seconds: 0 };
  assert.equal(shouldMarkLessonCompleted(lesson, 0, 90, false), false);
  assert.equal(shouldMarkLessonCompleted(lesson, 0, 95, false), true);
});

test('explicit complete still respects minimum reading time', () => {
  const lesson = { min_read_seconds: 120 };
  assert.equal(shouldMarkLessonCompleted(lesson, 60, 100, true), false);
  assert.equal(shouldMarkLessonCompleted(lesson, 120, 100, true), true);
});

test('progress percent rounds to two decimals', () => {
  assert.equal(computeProgressPercent(3, 1), 33.33);
  assert.equal(computeProgressPercent(4, 1), 25);
  assert.equal(computeProgressPercent(0, 0), 0);
});
