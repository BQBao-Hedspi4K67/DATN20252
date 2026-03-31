const express = require('express');
const pool = require('../config/db');
const { success } = require('../utils/apiResponse');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json(success('API and DB are healthy', { db: 'connected' }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
