const pool = require('../config/db');
const AppError = require('../utils/appError');
const { scoreAssessment } = require('../utils/assessmentRules');
const completionService = require('./completion.service');

async function getAssessmentById(assessmentId) {
  const [rows] = await pool.query(
    `SELECT
      a.id,
      a.course_id,
      a.chapter_id,
      a.title,
      a.assessment_type,
      a.pass_score,
      a.max_attempts,
      a.is_published,
      c.title AS course_title,
      c.final_exam_enabled,
      c.instructor_id
     FROM assessments a
     INNER JOIN courses c ON c.id = a.course_id
     WHERE a.id = ?
     LIMIT 1`,
    [assessmentId]
  );

  return rows[0] || null;
}

async function getEnrollmentForAssessment(studentId, assessment) {
  const [rows] = await pool.query(
    `SELECT id, status
     FROM enrollments
     WHERE student_id = ? AND course_id = ?
     LIMIT 1`,
    [studentId, assessment.course_id]
  );

  return rows[0] || null;
}

async function getAssessmentQuestions(assessmentId) {
  const [questions] = await pool.query(
    `SELECT id, assessment_id, question_text, question_type, position
     FROM assessment_questions
     WHERE assessment_id = ?
     ORDER BY position ASC`,
    [assessmentId]
  );

  if (questions.length === 0) {
    return [];
  }

  const questionIds = questions.map((q) => q.id);
  const [options] = await pool.query(
    `SELECT id, question_id, option_text, is_correct
     FROM assessment_options
     WHERE question_id IN (?)`,
    [questionIds]
  );

  return questions.map((question) => ({
    ...question,
    options: options.filter((option) => option.question_id === question.id)
  }));
}

async function getAssessmentForStudent(studentId, assessmentId) {
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment || Number(assessment.is_published) !== 1) {
    throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
  }

  const enrollment = await getEnrollmentForAssessment(studentId, assessment);
  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403, 'ASSESSMENT_ENROLLMENT_REQUIRED');
  }

  const questions = await getAssessmentQuestions(assessmentId);
  const safeQuestions = questions.map((question) => ({
    id: question.id,
    questionText: question.question_text,
    questionType: question.question_type,
    position: question.position,
    options: question.options.map((option) => ({
      id: option.id,
      optionText: option.option_text
    }))
  }));

  const [attemptRows] = await pool.query(
    `SELECT COUNT(*) AS attempt_count
     FROM assessment_attempts
     WHERE enrollment_id = ? AND assessment_id = ?`,
    [enrollment.id, assessment.id]
  );

  return {
    id: assessment.id,
    title: assessment.title,
    assessmentType: assessment.assessment_type,
    passScore: assessment.pass_score,
    maxAttempts: assessment.max_attempts,
    attemptCount: Number(attemptRows[0]?.attempt_count || 0),
    questions: safeQuestions
  };
}

async function getAssessmentAttempts(studentId, assessmentId) {
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment || Number(assessment.is_published) !== 1) {
    throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
  }

  const enrollment = await getEnrollmentForAssessment(studentId, assessment);
  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403, 'ASSESSMENT_ENROLLMENT_REQUIRED');
  }

  const [rows] = await pool.query(
    `SELECT id, score, is_passed, started_at, submitted_at
     FROM assessment_attempts
     WHERE enrollment_id = ?
       AND assessment_id = ?
     ORDER BY submitted_at DESC, id DESC`,
    [enrollment.id, assessment.id]
  );

  return rows.map((row) => ({
    id: row.id,
    score: Number(row.score),
    isPassed: Number(row.is_passed) === 1,
    startedAt: row.started_at,
    submittedAt: row.submitted_at
  }));
}

async function submitAssessment(studentId, assessmentId, submittedAnswers) {
  if (!Array.isArray(submittedAnswers) || submittedAnswers.length === 0) {
    throw new AppError('answers is required and must be non-empty', 400, 'ASSESSMENT_EMPTY_ANSWERS');
  }

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment || Number(assessment.is_published) !== 1) {
    throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
  }

  const enrollment = await getEnrollmentForAssessment(studentId, assessment);
  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403, 'ASSESSMENT_ENROLLMENT_REQUIRED');
  }

  const [attemptRows] = await pool.query(
    `SELECT COUNT(*) AS attempt_count
     FROM assessment_attempts
     WHERE enrollment_id = ? AND assessment_id = ?`,
    [enrollment.id, assessment.id]
  );
  const attemptCount = Number(attemptRows[0]?.attempt_count || 0);

  if (assessment.max_attempts !== null && attemptCount >= Number(assessment.max_attempts)) {
    throw new AppError('Maximum attempts reached', 400, 'ASSESSMENT_MAX_ATTEMPTS_REACHED');
  }

  const questions = await getAssessmentQuestions(assessmentId);
  if (questions.length === 0) {
    throw new AppError('Assessment has no questions', 400, 'ASSESSMENT_NO_QUESTIONS');
  }

  const allowedQuestionIds = new Set(questions.map((q) => Number(q.id)));
  const allowedOptionIds = new Set(questions.flatMap((q) => q.options.map((o) => Number(o.id))));

  for (const answer of submittedAnswers) {
    if (!allowedQuestionIds.has(Number(answer.questionId))) {
      throw new AppError('Invalid questionId in answers payload', 400, 'ASSESSMENT_INVALID_QUESTION');
    }
    if (!allowedOptionIds.has(Number(answer.optionId))) {
      throw new AppError('Invalid optionId in answers payload', 400, 'ASSESSMENT_INVALID_OPTION');
    }
  }

  const evaluated = scoreAssessment(questions, submittedAnswers);
  const isPassed = evaluated.score >= Number(assessment.pass_score);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [attemptResult] = await conn.query(
      `INSERT INTO assessment_attempts
        (assessment_id, enrollment_id, score, is_passed, submitted_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [assessment.id, enrollment.id, evaluated.score, isPassed ? 1 : 0]
    );

    for (const answerCheck of evaluated.answerChecks) {
      if (!answerCheck.optionId) {
        continue;
      }

      await conn.query(
        `INSERT INTO assessment_attempt_answers
          (attempt_id, question_id, option_id, is_correct)
         VALUES (?, ?, ?, ?)`,
        [attemptResult.insertId, answerCheck.questionId, answerCheck.optionId, answerCheck.isCorrect ? 1 : 0]
      );
    }

    await conn.commit();

    const completion = await completionService.syncEnrollmentCompletion(enrollment.id);

    return {
      attemptId: attemptResult.insertId,
      score: evaluated.score,
      passScore: Number(assessment.pass_score),
      isPassed,
      correctCount: evaluated.correctCount,
      totalQuestions: evaluated.totalQuestions,
      completion
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function createAssessment(authorUser, payload) {
  const {
    courseId,
    chapterId = null,
    title,
    assessmentType,
    passScore,
    maxAttempts = null,
    isPublished = 1,
    questions = []
  } = payload;

  if (!courseId || !title || !assessmentType || !passScore) {
    throw new AppError('courseId, title, assessmentType, passScore are required', 400, 'ASSESSMENT_CREATE_INVALID_PAYLOAD');
  }

  if (!['chapter_quiz', 'final_exam'].includes(assessmentType)) {
    throw new AppError('assessmentType must be chapter_quiz or final_exam', 400, 'ASSESSMENT_INVALID_TYPE');
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new AppError('questions must be a non-empty array', 400, 'ASSESSMENT_INVALID_QUESTIONS');
  }

  const [courseRows] = await pool.query(
    `SELECT id, instructor_id
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );

  const course = courseRows[0];
  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  if (authorUser.role !== 'admin' && Number(course.instructor_id) !== Number(authorUser.id)) {
    throw new AppError('Only course owner can create assessments', 403, 'ASSESSMENT_FORBIDDEN');
  }

  if (assessmentType === 'chapter_quiz' && !chapterId) {
    throw new AppError('chapterId is required for chapter_quiz', 400, 'ASSESSMENT_CHAPTER_REQUIRED');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [assessmentResult] = await conn.query(
      `INSERT INTO assessments
        (course_id, chapter_id, title, assessment_type, pass_score, max_attempts, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, chapterId, title, assessmentType, passScore, maxAttempts, Number(isPublished) ? 1 : 0]
    );

    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      if (!question.questionText || !Array.isArray(question.options) || question.options.length < 2) {
        throw new AppError('Each question requires questionText and at least 2 options', 400, 'ASSESSMENT_QUESTION_INVALID');
      }

      const [questionResult] = await conn.query(
        `INSERT INTO assessment_questions
          (assessment_id, question_text, question_type, position)
         VALUES (?, ?, 'single_choice', ?)`,
        [assessmentResult.insertId, question.questionText, i + 1]
      );

      const correctOptions = question.options.filter((opt) => Number(opt.isCorrect) === 1);
      if (correctOptions.length !== 1) {
        throw new AppError('Each question must have exactly one correct option', 400, 'ASSESSMENT_CORRECT_OPTION_INVALID');
      }

      for (const option of question.options) {
        await conn.query(
          `INSERT INTO assessment_options
            (question_id, option_text, is_correct)
           VALUES (?, ?, ?)`,
          [questionResult.insertId, option.optionText, Number(option.isCorrect) ? 1 : 0]
        );
      }
    }

    await conn.commit();

    return {
      id: assessmentResult.insertId,
      courseId,
      chapterId,
      title,
      assessmentType,
      passScore: Number(passScore)
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  getAssessmentForStudent,
  getAssessmentAttempts,
  submitAssessment,
  createAssessment
};
