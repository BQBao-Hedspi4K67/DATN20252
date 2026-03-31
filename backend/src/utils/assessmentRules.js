function buildCorrectOptionMap(questions) {
  const map = new Map();

  for (const question of questions) {
    const correctOption = question.options.find((option) => Number(option.is_correct) === 1);
    if (!correctOption) {
      throw new Error(`Question ${question.id} has no correct option`);
    }
    map.set(Number(question.id), Number(correctOption.id));
  }

  return map;
}

function scoreAssessment(questions, submittedAnswers) {
  const correctOptionMap = buildCorrectOptionMap(questions);
  const answerMap = new Map();

  for (const item of submittedAnswers) {
    answerMap.set(Number(item.questionId), Number(item.optionId));
  }

  let correctCount = 0;
  const answerChecks = [];

  for (const [questionId, correctOptionId] of correctOptionMap.entries()) {
    const submittedOptionId = answerMap.get(questionId);
    const isCorrect = submittedOptionId === correctOptionId;

    if (isCorrect) {
      correctCount += 1;
    }

    answerChecks.push({
      questionId,
      optionId: submittedOptionId || null,
      isCorrect
    });
  }

  const totalQuestions = correctOptionMap.size;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 10000) / 100;

  return {
    score,
    correctCount,
    totalQuestions,
    answerChecks
  };
}

module.exports = {
  scoreAssessment
};
