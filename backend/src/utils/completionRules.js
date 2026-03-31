function isEnrollmentEligibleForCompletion(summary) {
  const lessonsDone = Number(summary.totalLessons || 0) > 0
    && Number(summary.completedLessons || 0) >= Number(summary.totalLessons || 0);

  const chapterQuizDone = Number(summary.publishedChapterQuizCount || 0) === Number(summary.passedChapterQuizCount || 0);

  const finalExamDone = Number(summary.finalExamRequired || 0) === 0
    ? true
    : Number(summary.passedFinalExamCount || 0) > 0;

  return lessonsDone && chapterQuizDone && finalExamDone;
}

module.exports = {
  isEnrollmentEligibleForCompletion
};
