const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const coursesRoutes = require('./courses.routes');
const enrollmentsRoutes = require('./enrollments.routes');
const progressRoutes = require('./progress.routes');
const assessmentsRoutes = require('./assessments.routes');
const certificatesRoutes = require('./certificates.routes');
const instructorRoutes = require('./instructor.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/courses', coursesRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/progress', progressRoutes);
router.use('/assessments', assessmentsRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/instructor', instructorRoutes);

module.exports = router;
