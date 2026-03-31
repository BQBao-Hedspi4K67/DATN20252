const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeIsActive, assertValidCourseStatus } = require('../src/utils/adminRules');

test('normalizeIsActive supports boolean and numeric string forms', () => {
  assert.equal(normalizeIsActive(true), 1);
  assert.equal(normalizeIsActive(false), 0);
  assert.equal(normalizeIsActive('1'), 1);
  assert.equal(normalizeIsActive('0'), 0);
});

test('normalizeIsActive rejects invalid values', () => {
  assert.throws(() => normalizeIsActive('yes'));
});

test('assertValidCourseStatus allows only expected statuses', () => {
  assert.doesNotThrow(() => assertValidCourseStatus('draft'));
  assert.doesNotThrow(() => assertValidCourseStatus('published'));
  assert.doesNotThrow(() => assertValidCourseStatus('archived'));
  assert.throws(() => assertValidCourseStatus('deleted'));
});
