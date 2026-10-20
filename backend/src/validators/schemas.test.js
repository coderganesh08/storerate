import test from 'node:test';
import assert from 'node:assert/strict';
import {
  registerSchema,
  userCreateSchema,
  userUpdateSchema,
  storeCreateSchema,
  storeUpdateSchema,
  ratingSchema,
} from './schemas.js';

const schemasWithName = [
  ['registration', registerSchema, { email: 'test@example.com', address: 'Some address', password: 'Passw0rd!' }],
  ['user creation', userCreateSchema, { email: 'test@example.com', address: 'Some address', password: 'Passw0rd!', role: 'USER' }],
  ['user update', userUpdateSchema, {}],
  ['store creation', storeCreateSchema, { email: 'store@example.com', address: 'Some address', ownerId: 1 }],
  ['store update', storeUpdateSchema, {}],
];

for (const [label, schema, otherFields] of schemasWithName) {
  test(`${label} name accepts lengths 2 and 60 and rejects lengths 1 and 61`, () => {
    for (const [length, expected] of [[1, false], [2, true], [60, true], [61, false]]) {
      const result = schema.safeParse({ ...otherFields, name: 'A'.repeat(length) });
      assert.equal(result.success, expected, `expected ${label} name length ${length} to ${expected ? 'pass' : 'fail'}`);
    }
  });
}

test('rating reviews are optional, trimmed, and limited to 1000 characters', () => {
  assert.equal(ratingSchema.parse({ score: 5 }).review, undefined);
  assert.equal(ratingSchema.parse({ score: 4, review: '  Nice shop  ' }).review, 'Nice shop');
  assert.equal(ratingSchema.safeParse({ score: 4, review: 'R'.repeat(1001) }).success, false);
});

test('store update leaves omitted optional detail fields untouched and parses explicit status', () => {
  assert.deepEqual(storeUpdateSchema.parse({ name: 'Shop' }), { name: 'Shop' });
  assert.equal(storeUpdateSchema.parse({ isOpen: 'false' }).isOpen, false);
  assert.equal(storeUpdateSchema.parse({ website: '' }).website, null);
  assert.equal(storeUpdateSchema.parse({ website: 'https://example.com' }).website, 'https://example.com');
  assert.equal(storeUpdateSchema.safeParse({ website: 'not a url' }).success, false);
});
