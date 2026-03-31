const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('student'));

router.post('/', enrollmentController.enrollCourse);
router.get('/me', enrollmentController.myEnrollments);

module.exports = router;
