const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:userId/active', adminController.updateUserActiveStatus);

router.get('/courses', adminController.listCourses);
router.patch('/courses/:courseId/status', adminController.updateCourseStatus);

router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);

module.exports = router;
