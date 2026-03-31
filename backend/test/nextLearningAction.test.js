const test = require('node:test');
const assert = require('node:assert/strict');
const { determineNextLearningAction } = require('../src/utils/nextLearningAction');

test('returns first incomplete lesson as next action', () => {
  const action = determineNextLearningAction({
    orderedLessons: [
      { lesson_id: 1, chapter_id: 10, lesson_title: 'L1' },
      { lesson_id: 2, chapter_id: 10, lesson_title: 'L2' }
    ],
    orderedAssessments: [
      { assessment_id: 101, chapter_id: 10, assessment_type: 'chapter_quiz', assessment_title: 'Q1' }
    ],
    completedLessonIds: new Set([1]),
    passedAssessmentIds: new Set()
  });

  assert.equal(action.kind, 'lesson');
  assert.equal(action.lessonId, 2);
});

test('returns first unpassed assessment when all lessons complete', () => {
  const action = determineNextLearningAction({
    orderedLessons: [{ lesson_id: 1, chapter_id: 10, lesson_title: 'L1' }],
    orderedAssessments: [
      { assessment_id: 101, chapter_id: 10, assessment_type: 'chapter_quiz', assessment_title: 'Q1' },
      { assessment_id: 102, chapter_id: null, assessment_type: 'final_exam', assessment_title: 'Final' }
    ],
    completedLessonIds: new Set([1]),
    passedAssessmentIds: new Set([101])
  });

  assert.equal(action.kind, 'final_exam');
  assert.equal(action.assessmentId, 102);
});

test('returns completed when nothing left', () => {
  const action = determineNextLearningAction({
    orderedLessons: [{ lesson_id: 1, chapter_id: 10, lesson_title: 'L1' }],
    orderedAssessments: [{ assessment_id: 101, chapter_id: 10, assessment_type: 'chapter_quiz', assessment_title: 'Q1' }],
    completedLessonIds: new Set([1]),
    passedAssessmentIds: new Set([101])
  });

  assert.equal(action.kind, 'completed');
});
