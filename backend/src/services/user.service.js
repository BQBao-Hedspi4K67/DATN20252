const pool = require('../config/db');

async function findUserProfileById(id) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, is_active, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

module.exports = {
  findUserProfileById
};
