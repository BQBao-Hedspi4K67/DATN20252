const pool = require('../config/db');

async function getMyCertificates(studentId) {
  const [rows] = await pool.query(
    `SELECT
      cert.id,
      cert.certificate_code,
      cert.verification_url,
      cert.issued_at,
      e.course_id,
      c.title AS course_title,
      u.full_name AS learner_name
     FROM certificates cert
     INNER JOIN enrollments e ON e.id = cert.enrollment_id
     INNER JOIN courses c ON c.id = e.course_id
     INNER JOIN users u ON u.id = e.student_id
     WHERE e.student_id = ?
     ORDER BY cert.issued_at DESC`,
    [studentId]
  );

  return rows;
}

async function verifyCertificate(code) {
  const [rows] = await pool.query(
    `SELECT
      cert.certificate_code,
      cert.verification_url,
      cert.issued_at,
      c.title AS course_title,
      c.slug AS course_slug,
      u.full_name AS learner_name
     FROM certificates cert
     INNER JOIN enrollments e ON e.id = cert.enrollment_id
     INNER JOIN courses c ON c.id = e.course_id
     INNER JOIN users u ON u.id = e.student_id
     WHERE cert.certificate_code = ?
     LIMIT 1`,
    [code]
  );

  return rows[0] || null;
}

module.exports = {
  getMyCertificates,
  verifyCertificate
};
