const certificateService = require('../services/certificate.service');
const { success } = require('../utils/apiResponse');

async function myCertificates(req, res, next) {
  try {
    const rows = await certificateService.getMyCertificates(req.user.id);
    return res.json(success('Certificates fetched successfully', rows));
  } catch (error) {
    return next(error);
  }
}

async function verifyCertificate(req, res, next) {
  try {
    const code = req.params.code;
    const cert = await certificateService.verifyCertificate(code);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        data: null
      });
    }

    return res.json(success('Certificate is valid', cert));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  myCertificates,
  verifyCertificate
};
