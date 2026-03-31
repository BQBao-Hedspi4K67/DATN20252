const courseService = require('../services/course.service');
const { success } = require('../utils/apiResponse');

async function listCourses(req, res, next) {
  try {
    const { courseMode, keyword } = req.query;
    const courses = await courseService.listPublishedCourses({ courseMode, keyword });
    return res.json(success('Courses fetched successfully', courses));
  } catch (error) {
    return next(error);
  }
}

async function getCourseDetail(req, res, next) {
  try {
    const { slug } = req.params;
    const course = await courseService.findCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        data: null
      });
    }

    return res.json(success('Course detail fetched successfully', course));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCourses,
  getCourseDetail
};
