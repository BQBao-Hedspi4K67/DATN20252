function shouldMarkLessonCompleted(lesson, readSeconds, lastPosition = 0, explicitCompleteFlag = false) {
  if (explicitCompleteFlag) {
    if (lesson.min_read_seconds > 0) {
      return readSeconds >= lesson.min_read_seconds;
    }
    return true;
  }

  if (lesson.min_read_seconds > 0) {
    return readSeconds >= lesson.min_read_seconds;
  }

  return Number(lastPosition) >= 95;
}

function computeProgressPercent(totalLessons, completedLessons) {
  if (!totalLessons || totalLessons <= 0) {
    return 0;
  }
  const raw = (completedLessons / totalLessons) * 100;
  return Math.round(raw * 100) / 100;
}

module.exports = {
  shouldMarkLessonCompleted,
  computeProgressPercent
};
