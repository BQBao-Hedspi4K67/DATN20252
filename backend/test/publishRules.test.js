const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateCoursePublishReadiness } = require('../src/utils/publishRules');

test('publish readiness fails when no chapter exists', () => {
  const result = evaluateCoursePublishReadiness([]);
  assert.equal(result.ready, false);
  assert.equal(result.issues.length, 1);
});

test('publish readiness fails when chapter is missing quiz or lesson', () => {
  const result = evaluateCoursePublishReadiness([
    { chapter_id: 1, lesson_count: 1, quiz_count: 0 },
    { chapter_id: 2, lesson_count: 0, quiz_count: 1 }
  ]);

  assert.equal(result.ready, false);
  assert.equal(result.issues.length, 2);
});

test('publish readiness passes when each chapter has lesson and chapter quiz', () => {
  const result = evaluateCoursePublishReadiness([
    { chapter_id: 1, lesson_count: 2, quiz_count: 1 },
    { chapter_id: 2, lesson_count: 1, quiz_count: 2 }
  ]);

  assert.equal(result.ready, true);
  assert.equal(result.issues.length, 0);
});
