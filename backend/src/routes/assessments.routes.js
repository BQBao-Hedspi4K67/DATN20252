const express = require('express');
const assessmentController = require('../controllers/assessment.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

router.use(authenticate);

router.get('/:assessmentId', authorizeRoles('student'), assessmentController.getAssessmentForStudent);
router.get('/:assessmentId/attempts', authorizeRoles('student'), assessmentController.getAssessmentAttempts);
router.post('/:assessmentId/submit', authorizeRoles('student'), assessmentController.submitAssessment);
router.post('/', authorizeRoles('instructor', 'admin'), assessmentController.createAssessment);

module.exports = router;
