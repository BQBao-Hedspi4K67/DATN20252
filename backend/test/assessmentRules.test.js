const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreAssessment } = require('../src/utils/assessmentRules');

test('scoreAssessment returns correct score and answer checks', () => {
  const questions = [
    {
      id: 1,
      options: [
        { id: 10, is_correct: 1 },
        { id: 11, is_correct: 0 }
      ]
    },
    {
      id: 2,
      options: [
        { id: 20, is_correct: 0 },
        { id: 21, is_correct: 1 }
      ]
    },
    {
      id: 3,
      options: [
        { id: 30, is_correct: 1 },
        { id: 31, is_correct: 0 }
      ]
    }
  ];

  const answers = [
    { questionId: 1, optionId: 10 },
    { questionId: 2, optionId: 20 },
    { questionId: 3, optionId: 30 }
  ];

  const result = scoreAssessment(questions, answers);

  assert.equal(result.correctCount, 2);
  assert.equal(result.totalQuestions, 3);
  assert.equal(result.score, 66.67);
  assert.equal(result.answerChecks.length, 3);
});

test('scoreAssessment handles unanswered questions', () => {
  const questions = [
    {
      id: 1,
      options: [
        { id: 10, is_correct: 1 },
        { id: 11, is_correct: 0 }
      ]
    },
    {
      id: 2,
      options: [
        { id: 20, is_correct: 1 },
        { id: 21, is_correct: 0 }
      ]
    }
  ];

  const answers = [{ questionId: 1, optionId: 10 }];
  const result = scoreAssessment(questions, answers);

  assert.equal(result.correctCount, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.score, 50);

  const unanswered = result.answerChecks.find((item) => item.questionId === 2);
  assert.equal(unanswered.optionId, null);
  assert.equal(unanswered.isCorrect, false);
});
