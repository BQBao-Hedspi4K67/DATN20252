const ALLOWED_COURSE_STATUSES = ['draft', 'published', 'archived'];

function normalizeIsActive(value) {
  if (value === true || value === 1 || value === '1') {
    return 1;
  }
  if (value === false || value === 0 || value === '0') {
    return 0;
  }
  throw new Error('isActive must be true/false or 1/0');
}

function assertValidCourseStatus(status) {
  if (!ALLOWED_COURSE_STATUSES.includes(status)) {
    throw new Error('status must be draft, published, or archived');
  }
}

module.exports = {
  normalizeIsActive,
  assertValidCourseStatus,
  ALLOWED_COURSE_STATUSES
};
