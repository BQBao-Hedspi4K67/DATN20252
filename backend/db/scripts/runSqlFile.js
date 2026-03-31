const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runSqlFile(sqlFilePath, options = {}) {
  const absolutePath = path.resolve(sqlFilePath);
  const sql = fs.readFileSync(absolutePath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: options.withoutDatabase ? undefined : (process.env.DB_NAME || 'lms_db'),
    multipleStatements: true
  });

  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

module.exports = runSqlFile;
