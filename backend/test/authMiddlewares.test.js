const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const authenticate = require('../src/middlewares/authenticate');
const authorizeRoles = require('../src/middlewares/authorizeRoles');

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

test('authenticate rejects request without bearer token', () => {
  const req = { headers: {} };
  const res = createRes();
  let called = false;

  authenticate(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
});

test('authenticate rejects invalid token', () => {
  const originalVerify = jwt.verify;
  try {
    jwt.verify = () => {
      throw new Error('invalid');
    };

    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = createRes();
    let called = false;

    authenticate(req, res, () => {
      called = true;
    });

    assert.equal(called, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.payload.success, false);
  } finally {
    jwt.verify = originalVerify;
  }
});

test('authenticate sets req.user on valid token', () => {
  const originalVerify = jwt.verify;
  try {
    jwt.verify = () => ({ sub: 10, role: 'student', email: 'student@lms.local' });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = createRes();
    let called = false;

    authenticate(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
    assert.deepEqual(req.user, {
      id: 10,
      role: 'student',
      email: 'student@lms.local'
    });
  } finally {
    jwt.verify = originalVerify;
  }
});

test('authorizeRoles returns 401 when req.user is missing', () => {
  const guard = authorizeRoles('admin');
  const req = {};
  const res = createRes();
  let called = false;

  guard(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
});

test('authorizeRoles returns 403 for role mismatch', () => {
  const guard = authorizeRoles('admin');
  const req = { user: { id: 2, role: 'student' } };
  const res = createRes();
  let called = false;

  guard(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.success, false);
});

test('authorizeRoles allows matching role', () => {
  const guard = authorizeRoles('instructor', 'admin');
  const req = { user: { id: 3, role: 'instructor' } };
  const res = createRes();
  let called = false;

  guard(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});
