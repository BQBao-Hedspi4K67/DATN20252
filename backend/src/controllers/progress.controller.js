const enrollmentService = require('../services/enrollment.service');
const { success } = require('../utils/apiResponse');

async function heartbeatLesson(req, res, next) {
  try {
    const studentId = req.user.id;
    const lessonId = Number(req.params.lessonId);
    const heartbeatSecond = Number(req.body.heartbeatSecond || 0);
    const lastPosition = Number(req.body.lastPosition || 0);

    if (!Number.isFinite(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lessonId',
        data: null
      });
    }

    if (!Number.isFinite(heartbeatSecond) || heartbeatSecond <= 0) {
      return res.status(400).json({
        success: false,
        message: 'heartbeatSecond must be a positive number',
        data: null
      });
    }

    const result = await enrollmentService.addLessonHeartbeat(
      studentId,
      lessonId,
      heartbeatSecond,
      lastPosition
    );

    return res.json(success('Lesson heartbeat saved', result));
  } catch (error) {
    return next(error);
  }
}

async function completeLesson(req, res, next) {
  try {
    const studentId = req.user.id;
    const lessonId = Number(req.params.lessonId);
    const lastPosition = Number(req.body.lastPosition || 100);

    if (!Number.isFinite(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lessonId',
        data: null
      });
    }

    const result = await enrollmentService.completeLesson(studentId, lessonId, lastPosition);
    return res.json(success('Lesson completed successfully', result));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  heartbeatLesson,
  completeLesson
};
