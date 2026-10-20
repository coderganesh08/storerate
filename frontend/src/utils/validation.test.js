import test from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from './validation.js';

test('name validation accepts lengths 2 and 60 and rejects lengths 1 and 61', () => {
  assert.notEqual(validateName('A'), '');
  assert.equal(validateName('AB'), '');
  assert.equal(validateName('A'.repeat(60)), '');
  assert.notEqual(validateName('A'.repeat(61)), '');
});
