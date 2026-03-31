const express = require('express');
const progressController = require('../controllers/progress.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('student'));

router.post('/lessons/:lessonId/heartbeat', progressController.heartbeatLesson);
router.post('/lessons/:lessonId/complete', progressController.completeLesson);

module.exports = router;
