function evaluateCoursePublishReadiness(chapterRows) {
  const issues = [];

  if (!Array.isArray(chapterRows) || chapterRows.length === 0) {
    issues.push('Course must have at least one chapter');
    return { ready: false, issues };
  }

  for (const chapter of chapterRows) {
    if (Number(chapter.lesson_count || 0) <= 0) {
      issues.push(`Chapter ${chapter.chapter_id} must have at least one lesson`);
    }

    if (Number(chapter.quiz_count || 0) <= 0) {
      issues.push(`Chapter ${chapter.chapter_id} must have at least one published chapter quiz`);
    }
  }

  return {
    ready: issues.length === 0,
    issues
  };
}

module.exports = {
  evaluateCoursePublishReadiness
};
