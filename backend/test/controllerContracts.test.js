const test = require('node:test');
const assert = require('node:assert/strict');

const authController = require('../src/controllers/auth.controller');
const enrollmentController = require('../src/controllers/enrollment.controller');
const progressController = require('../src/controllers/progress.controller');
const assessmentController = require('../src/controllers/assessment.controller');
const certificateController = require('../src/controllers/certificate.controller');

const authService = require('../src/services/auth.service');
const courseService = require('../src/services/course.service');
const enrollmentService = require('../src/services/enrollment.service');
const assessmentService = require('../src/services/assessment.service');
const certificateService = require('../src/services/certificate.service');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../src/utils/appError');

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

function createNextTracker() {
  const tracker = {
    error: null,
    next(err) {
      tracker.error = err || null;
    }
  };
  return tracker;
}

test('auth.login returns 400 when missing email/password', async () => {
  const req = { body: { email: '', password: '' } };
  const res = createRes();
  const next = createNextTracker();

  await authController.login(req, res, next.next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, 'Email and password are required');
  assert.equal(next.error, null);
});

test('auth.login returns token payload on success', async () => {
  const originalFindUserByEmail = authService.findUserByEmail;
  const originalCompare = bcrypt.compare;
  const originalSign = jwt.sign;

  try {
    authService.findUserByEmail = async () => ({
      id: 9,
      email: 'student@lms.local',
      role: 'student',
      full_name: 'Student Demo',
      password_hash: 'hash'
    });
    bcrypt.compare = async () => true;
    jwt.sign = () => 'token-xyz';

    const req = { body: { email: 'student@lms.local', password: 'Password@123' } };
    const res = createRes();
    const next = createNextTracker();

    await authController.login(req, res, next.next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.message, 'Login successful');
    assert.equal(res.payload.data.accessToken, 'token-xyz');
    assert.equal(res.payload.data.user.role, 'student');
    assert.equal(next.error, null);
  } finally {
    authService.findUserByEmail = originalFindUserByEmail;
    bcrypt.compare = originalCompare;
    jwt.sign = originalSign;
  }
});

test('enrollment.enrollCourse validates missing courseId', async () => {
  const req = { user: { id: 7 }, body: {} };
  const res = createRes();
  const next = createNextTracker();

  await enrollmentController.enrollCourse(req, res, next.next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, 'courseId is required');
  assert.equal(next.error, null);
});

test('enrollment.enrollCourse returns 201 when course is publishable', async () => {
  const originalFindCourseById = courseService.findCourseById;
  const originalEnrollToCourse = enrollmentService.enrollToCourse;

  try {
    courseService.findCourseById = async () => ({ id: 5, status: 'published' });
    enrollmentService.enrollToCourse = async () => ({ id: 111, status: 'active' });

    const req = { user: { id: 7 }, body: { courseId: 5 } };
    const res = createRes();
    const next = createNextTracker();

    await enrollmentController.enrollCourse(req, res, next.next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.data.id, 111);
    assert.equal(next.error, null);
  } finally {
    courseService.findCourseById = originalFindCourseById;
    enrollmentService.enrollToCourse = originalEnrollToCourse;
  }
});

test('progress.heartbeatLesson validates heartbeatSecond > 0', async () => {
  const req = {
    user: { id: 7 },
    params: { lessonId: '10' },
    body: { heartbeatSecond: 0, lastPosition: 10 }
  };
  const res = createRes();
  const next = createNextTracker();

  await progressController.heartbeatLesson(req, res, next.next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, 'heartbeatSecond must be a positive number');
  assert.equal(next.error, null);
});

test('assessment.submitAssessment forwards payload and returns envelope', async () => {
  const originalSubmitAssessment = assessmentService.submitAssessment;

  try {
    assessmentService.submitAssessment = async (studentId, assessmentId, answers) => ({
      attemptId: 99,
      studentId,
      assessmentId,
      answerCount: Array.isArray(answers) ? answers.length : 0,
      score: 80,
      passScore: 70,
      isPassed: true
    });

    const req = {
      user: { id: 7 },
      params: { assessmentId: '12' },
      body: {
        answers: [
          { questionId: 1, optionId: 2 },
          { questionId: 2, optionId: 4 }
        ]
      }
    };
    const res = createRes();
    const next = createNextTracker();

    await assessmentController.submitAssessment(req, res, next.next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.data.attemptId, 99);
    assert.equal(res.payload.data.answerCount, 2);
    assert.equal(next.error, null);
  } finally {
    assessmentService.submitAssessment = originalSubmitAssessment;
  }
});

test('certificate.verifyCertificate returns 404 when cert not found', async () => {
  const originalVerifyCertificate = certificateService.verifyCertificate;

  try {
    certificateService.verifyCertificate = async () => null;

    const req = { params: { code: 'NOT-FOUND' } };
    const res = createRes();
    const next = createNextTracker();

    await certificateController.verifyCertificate(req, res, next.next);

    assert.equal(res.statusCode, 404);
    assert.equal(res.payload.success, false);
    assert.equal(res.payload.message, 'Certificate not found');
    assert.equal(next.error, null);
  } finally {
    certificateService.verifyCertificate = originalVerifyCertificate;
  }
});

test('controller passes AppError to next for centralized error envelope', async () => {
  const originalGetMyCertificates = certificateService.getMyCertificates;

  try {
    certificateService.getMyCertificates = async () => {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    };

    const req = { user: { id: 7 } };
    const res = createRes();
    const next = createNextTracker();

    await certificateController.myCertificates(req, res, next.next);

    assert.equal(res.payload, null);
    assert.equal(next.error instanceof AppError, true);
    assert.equal(next.error.statusCode, 403);
    assert.equal(next.error.code, 'FORBIDDEN');
  } finally {
    certificateService.getMyCertificates = originalGetMyCertificates;
  }
});
