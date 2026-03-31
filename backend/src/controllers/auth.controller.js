const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const env = require('../config/env');
const { success } = require('../utils/apiResponse');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        data: null
      });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    const isMatched = await bcrypt.compare(password, user.password_hash);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return res.json(
      success('Login successful', {
        accessToken: token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      })
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login
};
