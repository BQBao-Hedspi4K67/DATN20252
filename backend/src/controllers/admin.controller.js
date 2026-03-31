const adminService = require('../services/admin.service');
const AppError = require('../utils/appError');
const { success } = require('../utils/apiResponse');

async function listUsers(req, res, next) {
  try {
    const rows = await adminService.listUsers({
      role: req.query.role,
      keyword: req.query.keyword
    });

    return res.json(success('Users fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function updateUserActiveStatus(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new AppError('Invalid userId', 400, 'ADMIN_INVALID_USER_ID');
    }

    const row = await adminService.updateUserActiveStatus(userId, req.body.isActive);
    return res.json(success('User status updated successfully', row));
  } catch (error) {
    return next(error);
  }
}

async function listCourses(req, res, next) {
  try {
    const rows = await adminService.listCourses({
      status: req.query.status,
      courseMode: req.query.courseMode,
      keyword: req.query.keyword
    });

    return res.json(success('Courses fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function updateCourseStatus(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isFinite(courseId) || courseId <= 0) {
      throw new AppError('Invalid courseId', 400, 'ADMIN_INVALID_COURSE_ID');
    }

    const row = await adminService.updateCourseStatus(courseId, req.body.status);
    return res.json(success('Course status updated successfully', row));
  } catch (error) {
    return next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const rows = await adminService.listCategories();
    return res.json(success('Categories fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const row = await adminService.createCategory(req.body);
    return res.status(201).json(success('Category created successfully', row));
  } catch (error) {
    return next(error);
  }
}

async function getOverviewReport(req, res, next) {
  try {
    const report = await adminService.getOverviewReport();
    return res.json(success('Admin overview report fetched successfully', report));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  updateUserActiveStatus,
  listCourses,
  updateCourseStatus,
  listCategories,
  createCategory,
  getOverviewReport
};
