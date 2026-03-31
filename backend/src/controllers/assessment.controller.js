const assessmentService = require('../services/assessment.service');
const { success } = require('../utils/apiResponse');

async function getAssessmentForStudent(req, res, next) {
  try {
    const studentId = req.user.id;
    const assessmentId = Number(req.params.assessmentId);

    if (!Number.isFinite(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessmentId',
        data: null
      });
    }

    const data = await assessmentService.getAssessmentForStudent(studentId, assessmentId);
    return res.json(success('Assessment fetched successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function submitAssessment(req, res, next) {
  try {
    const studentId = req.user.id;
    const assessmentId = Number(req.params.assessmentId);

    if (!Number.isFinite(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessmentId',
        data: null
      });
    }

    const data = await assessmentService.submitAssessment(studentId, assessmentId, req.body.answers);
    return res.json(success('Assessment submitted successfully', data));
  } catch (error) {
    return next(error);
  }
}

async function createAssessment(req, res, next) {
  try {
    const data = await assessmentService.createAssessment(req.user, req.body);
    return res.status(201).json(success('Assessment created successfully', data));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAssessmentForStudent,
  submitAssessment,
  createAssessment
};
