const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const instructorController = require('../controllers/instructor.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('instructor', 'admin'));

router.get('/courses', instructorController.myCourses);
router.post('/courses', instructorController.createCourse);
router.patch('/courses/:courseId', instructorController.updateCourse);
router.post('/courses/:courseId/chapters', instructorController.createChapter);
router.post('/chapters/:chapterId/lessons', instructorController.createLesson);
router.post('/courses/:courseId/publish', instructorController.publishCourse);

module.exports = router;
