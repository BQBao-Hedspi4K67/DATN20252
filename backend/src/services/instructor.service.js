const pool = require('../config/db');
const AppError = require('../utils/appError');
const { evaluateCoursePublishReadiness } = require('../utils/publishRules');

async function getCourseForOwner(courseId) {
  const [rows] = await pool.query(
    `SELECT id, instructor_id, status, title
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );

  return rows[0] || null;
}

function ensureOwner(user, course) {
  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  if (user.role !== 'admin' && Number(course.instructor_id) !== Number(user.id)) {
    throw new AppError('Only course owner can perform this action', 403, 'COURSE_OWNER_REQUIRED');
  }
}

function validateLessonPayload(payload) {
  const {
    lessonType,
    contentText,
    videoUrl,
    fileUrl
  } = payload;

  if (!['video', 'document', 'text', 'image'].includes(lessonType)) {
    throw new AppError('lessonType must be video, document, text, or image', 400, 'LESSON_TYPE_INVALID');
  }

  if (lessonType === 'video' && !videoUrl) {
    throw new AppError('videoUrl is required for video lesson', 400, 'LESSON_VIDEO_URL_REQUIRED');
  }

  if ((lessonType === 'document' || lessonType === 'image') && !fileUrl) {
    throw new AppError('fileUrl is required for document/image lesson', 400, 'LESSON_FILE_URL_REQUIRED');
  }

  if (lessonType === 'text' && !contentText) {
    throw new AppError('contentText is required for text lesson', 400, 'LESSON_CONTENT_REQUIRED');
  }
}

async function getMyCourses(user) {
  const params = [];
  let where = '1=1';

  if (user.role !== 'admin') {
    where = 'c.instructor_id = ?';
    params.push(user.id);
  }

  const [rows] = await pool.query(
    `SELECT
      c.id,
      c.title,
      c.slug,
      c.course_mode,
      c.status,
      c.final_exam_enabled,
      c.final_exam_pass_score,
      COUNT(DISTINCT ch.id) AS chapter_count,
      COUNT(DISTINCT ls.id) AS lesson_count
     FROM courses c
     LEFT JOIN chapters ch ON ch.course_id = c.id
     LEFT JOIN lessons ls ON ls.chapter_id = ch.id
     WHERE ${where}
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    params
  );

  return rows;
}

async function createCourse(user, payload) {
  const {
    title,
    slug,
    description = null,
    thumbnailUrl = null,
    courseMode,
    passScoreChapterQuiz = 70,
    finalExamEnabled = 0,
    finalExamPassScore = null
  } = payload;

  if (!title || !slug || !courseMode) {
    throw new AppError('title, slug, courseMode are required', 400, 'COURSE_CREATE_INVALID_PAYLOAD');
  }

  if (!['certificate', 'instructor_led'].includes(courseMode)) {
    throw new AppError('courseMode must be certificate or instructor_led', 400, 'COURSE_MODE_INVALID');
  }

  const [result] = await pool.query(
    `INSERT INTO courses
      (instructor_id, title, slug, description, thumbnail_url, course_mode, status, pass_score_chapter_quiz, final_exam_enabled, final_exam_pass_score)
     VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
    [
      user.id,
      title,
      slug,
      description,
      thumbnailUrl,
      courseMode,
      passScoreChapterQuiz,
      Number(finalExamEnabled) ? 1 : 0,
      finalExamPassScore
    ]
  );

  return {
    id: result.insertId,
    title,
    slug,
    status: 'draft'
  };
}

async function updateCourse(user, courseId, payload) {
  const course = await getCourseForOwner(courseId);
  ensureOwner(user, course);

  const fields = [];
  const values = [];

  const mapping = [
    ['title', 'title'],
    ['slug', 'slug'],
    ['description', 'description'],
    ['thumbnailUrl', 'thumbnail_url'],
    ['passScoreChapterQuiz', 'pass_score_chapter_quiz'],
    ['finalExamEnabled', 'final_exam_enabled'],
    ['finalExamPassScore', 'final_exam_pass_score']
  ];

  for (const [payloadKey, column] of mapping) {
    if (Object.prototype.hasOwnProperty.call(payload, payloadKey)) {
      fields.push(`${column} = ?`);
      if (payloadKey === 'finalExamEnabled') {
        values.push(Number(payload[payloadKey]) ? 1 : 0);
      } else {
        values.push(payload[payloadKey]);
      }
    }
  }

  if (fields.length === 0) {
    throw new AppError('No updatable fields in payload', 400, 'COURSE_UPDATE_EMPTY');
  }

  values.push(courseId);

  await pool.query(
    `UPDATE courses
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  return { id: courseId, updated: true };
}

async function createChapter(user, courseId, payload) {
  const course = await getCourseForOwner(courseId);
  ensureOwner(user, course);

  const { title, position = null } = payload;
  if (!title) {
    throw new AppError('title is required', 400, 'CHAPTER_TITLE_REQUIRED');
  }

  let nextPosition = position;
  if (!nextPosition) {
    const [[maxRow]] = await pool.query(
      `SELECT COALESCE(MAX(position), 0) AS max_position
       FROM chapters
       WHERE course_id = ?`,
      [courseId]
    );
    nextPosition = Number(maxRow.max_position || 0) + 1;
  }

  const [result] = await pool.query(
    `INSERT INTO chapters (course_id, title, position)
     VALUES (?, ?, ?)`,
    [courseId, title, nextPosition]
  );

  return {
    id: result.insertId,
    courseId,
    title,
    position: nextPosition
  };
}

async function createLesson(user, chapterId, payload) {
  const [chapterRows] = await pool.query(
    `SELECT ch.id, ch.course_id
     FROM chapters ch
     WHERE ch.id = ?
     LIMIT 1`,
    [chapterId]
  );

  const chapter = chapterRows[0];
  if (!chapter) {
    throw new AppError('Chapter not found', 404, 'CHAPTER_NOT_FOUND');
  }

  const course = await getCourseForOwner(chapter.course_id);
  ensureOwner(user, course);

  const {
    title,
    position = null,
    lessonType,
    contentText = null,
    videoUrl = null,
    thumbnailUrl = null,
    fileUrl = null,
    minReadSeconds = 0,
    isPreview = 0
  } = payload;

  if (!title) {
    throw new AppError('title is required', 400, 'LESSON_TITLE_REQUIRED');
  }

  validateLessonPayload({ lessonType, contentText, videoUrl, fileUrl });

  let nextPosition = position;
  if (!nextPosition) {
    const [[maxRow]] = await pool.query(
      `SELECT COALESCE(MAX(position), 0) AS max_position
       FROM lessons
       WHERE chapter_id = ?`,
      [chapterId]
    );
    nextPosition = Number(maxRow.max_position || 0) + 1;
  }

  const [result] = await pool.query(
    `INSERT INTO lessons
      (chapter_id, title, position, lesson_type, content_text, video_url, thumbnail_url, file_url, min_read_seconds, is_preview)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chapterId,
      title,
      nextPosition,
      lessonType,
      contentText,
      videoUrl,
      thumbnailUrl,
      fileUrl,
      minReadSeconds,
      Number(isPreview) ? 1 : 0
    ]
  );

  return {
    id: result.insertId,
    chapterId,
    title,
    position: nextPosition
  };
}

async function publishCourse(user, courseId) {
  const course = await getCourseForOwner(courseId);
  ensureOwner(user, course);

  const [chapterRows] = await pool.query(
    `SELECT
      ch.id AS chapter_id,
      COUNT(DISTINCT ls.id) AS lesson_count,
      COUNT(DISTINCT a.id) AS quiz_count
     FROM chapters ch
     LEFT JOIN lessons ls ON ls.chapter_id = ch.id
     LEFT JOIN assessments a
       ON a.chapter_id = ch.id
      AND a.assessment_type = 'chapter_quiz'
      AND a.is_published = 1
     WHERE ch.course_id = ?
     GROUP BY ch.id
     ORDER BY ch.position ASC`,
    [courseId]
  );

  const readiness = evaluateCoursePublishReadiness(chapterRows);
  if (!readiness.ready) {
    throw new AppError(
      `Cannot publish course. ${readiness.issues.join('; ')}`,
      400,
      'COURSE_PUBLISH_REQUIREMENTS_NOT_MET'
    );
  }

  await pool.query(
    `UPDATE courses
     SET status = 'published'
     WHERE id = ?`,
    [courseId]
  );

  return {
    id: courseId,
    status: 'published',
    checks: readiness
  };
}

module.exports = {
  getMyCourses,
  createCourse,
  updateCourse,
  createChapter,
  createLesson,
  publishCourse
};
