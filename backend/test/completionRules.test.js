const test = require('node:test');
const assert = require('node:assert/strict');
const { isEnrollmentEligibleForCompletion } = require('../src/utils/completionRules');

test('eligible when lessons complete, chapter quizzes passed, and final not required', () => {
  const summary = {
    totalLessons: 4,
    completedLessons: 4,
    publishedChapterQuizCount: 2,
    passedChapterQuizCount: 2,
    finalExamRequired: 0,
    passedFinalExamCount: 0
  };

  assert.equal(isEnrollmentEligibleForCompletion(summary), true);
});

test('not eligible when chapter quiz requirements not met', () => {
  const summary = {
    totalLessons: 4,
    completedLessons: 4,
    publishedChapterQuizCount: 3,
    passedChapterQuizCount: 2,
    finalExamRequired: 0,
    passedFinalExamCount: 0
  };

  assert.equal(isEnrollmentEligibleForCompletion(summary), false);
});

test('not eligible when final exam required but not passed', () => {
  const summary = {
    totalLessons: 4,
    completedLessons: 4,
    publishedChapterQuizCount: 1,
    passedChapterQuizCount: 1,
    finalExamRequired: 1,
    passedFinalExamCount: 0
  };

  assert.equal(isEnrollmentEligibleForCompletion(summary), false);
});
