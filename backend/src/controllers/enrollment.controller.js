const enrollmentService = require('../services/enrollment.service');
const courseService = require('../services/course.service');
const { success } = require('../utils/apiResponse');

async function enrollCourse(req, res, next) {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required',
        data: null
      });
    }

    const course = await courseService.findCourseById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unpublished',
        data: null
      });
    }

    const enrollment = await enrollmentService.enrollToCourse(studentId, courseId);
    return res.status(201).json(success('Enrollment created successfully', enrollment));
  } catch (error) {
    return next(error);
  }
}

async function myEnrollments(req, res, next) {
  try {
    const studentId = req.user.id;
    const rows = await enrollmentService.getMyEnrollments(studentId);
    return res.json(success('Enrollments fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function myCourseLessonProgress(req, res, next) {
  try {
    const studentId = req.user.id;
    const courseSlug = req.params.slug;
    const data = await enrollmentService.getCourseLessonProgress(studentId, courseSlug);
    return res.json(success('Course lesson progress fetched successfully', data));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  enrollCourse,
  myEnrollments,
  myCourseLessonProgress
};
