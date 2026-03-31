const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'lms_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};
