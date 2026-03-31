const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const coursesRoutes = require('./courses.routes');
const enrollmentsRoutes = require('./enrollments.routes');
const progressRoutes = require('./progress.routes');
const assessmentsRoutes = require('./assessments.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/courses', coursesRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/progress', progressRoutes);
router.use('/assessments', assessmentsRoutes);

module.exports = router;
