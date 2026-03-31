const instructorService = require('../services/instructor.service');
const { success } = require('../utils/apiResponse');

async function myCourses(req, res, next) {
  try {
    const rows = await instructorService.getMyCourses(req.user);
    return res.json(success('Instructor courses fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const data = await instructorService.createCourse(req.user, req.body);
    return res.status(201).json(success('Course created successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const data = await instructorService.updateCourse(req.user, courseId, req.body);
    return res.json(success('Course updated successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function createChapter(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const data = await instructorService.createChapter(req.user, courseId, req.body);
    return res.status(201).json(success('Chapter created successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function createLesson(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const data = await instructorService.createLesson(req.user, chapterId, req.body);
    return res.status(201).json(success('Lesson created successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function publishCourse(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const data = await instructorService.publishCourse(req.user, courseId);
    return res.json(success('Course published successfully', data));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  myCourses,
  createCourse,
  updateCourse,
  createChapter,
  createLesson,
  publishCourse
};
