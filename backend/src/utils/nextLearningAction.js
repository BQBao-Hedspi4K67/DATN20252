function determineNextLearningAction({ orderedLessons, orderedAssessments, completedLessonIds, passedAssessmentIds }) {
  for (const lesson of orderedLessons) {
    if (!completedLessonIds.has(Number(lesson.lesson_id))) {
      return {
        kind: 'lesson',
        lessonId: Number(lesson.lesson_id),
        chapterId: Number(lesson.chapter_id),
        title: lesson.lesson_title
      };
    }
  }

  for (const assessment of orderedAssessments) {
    if (!passedAssessmentIds.has(Number(assessment.assessment_id))) {
      return {
        kind: assessment.assessment_type === 'final_exam' ? 'final_exam' : 'chapter_quiz',
        assessmentId: Number(assessment.assessment_id),
        chapterId: assessment.chapter_id ? Number(assessment.chapter_id) : null,
        title: assessment.assessment_title
      };
    }
  }

  return {
    kind: 'completed',
    title: 'All required learning actions completed'
  };
}

module.exports = {
  determineNextLearningAction
};
