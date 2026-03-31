const express = require('express');
const certificateController = require('../controllers/certificate.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

router.get('/verify/:code', certificateController.verifyCertificate);
router.get('/me', authenticate, authorizeRoles('student'), certificateController.myCertificates);

module.exports = router;
