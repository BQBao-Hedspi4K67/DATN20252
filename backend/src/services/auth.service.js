const pool = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, email, full_name, role, password_hash
     FROM users
     WHERE email = ? AND is_active = 1
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

module.exports = {
  findUserByEmail
};
