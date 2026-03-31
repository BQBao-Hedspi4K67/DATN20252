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

function runGuardChain({ token, allowedRoles, mockedPayload }) {
  const originalVerify = jwt.verify;
  const req = {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  };
  const res = createRes();
  let passed = false;

  try {
    jwt.verify = () => mockedPayload;

    authenticate(req, res, () => {
      const roleGuard = authorizeRoles(...allowedRoles);
      roleGuard(req, res, () => {
        passed = true;
      });
    });
  } finally {
    jwt.verify = originalVerify;
  }

  return { req, res, passed };
}

test('student token is denied on admin-only guard', () => {
  const { passed, res } = runGuardChain({
    token: 'valid',
    allowedRoles: ['admin'],
    mockedPayload: { sub: 2, role: 'student', email: 's@lms.local' }
  });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.success, false);
});

test('admin token is allowed on instructor-or-admin guard', () => {
  const { passed, res } = runGuardChain({
    token: 'valid',
    allowedRoles: ['instructor', 'admin'],
    mockedPayload: { sub: 1, role: 'admin', email: 'admin@lms.local' }
  });

  assert.equal(passed, true);
  assert.equal(res.statusCode, 200);
});

test('instructor token is denied on student-only guard', () => {
  const { passed, res } = runGuardChain({
    token: 'valid',
    allowedRoles: ['student'],
    mockedPayload: { sub: 4, role: 'instructor', email: 'i@lms.local' }
  });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.success, false);
});

test('guest without token is denied before role guard', () => {
  const req = { headers: {} };
  const res = createRes();
  let passed = false;

  authenticate(req, res, () => {
    const roleGuard = authorizeRoles('student');
    roleGuard(req, res, () => {
      passed = true;
    });
  });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
});
