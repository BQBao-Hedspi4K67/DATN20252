const express = require('express');
const courseController = require('../controllers/course.controller');

const router = express.Router();

router.get('/', courseController.listCourses);
router.get('/:slug', courseController.getCourseDetail);

module.exports = router;
