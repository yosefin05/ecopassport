import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUserName } from '../lib/user-name.js';

test('normalizes valid user names without changing their display casing', () => {
  assert.equal(normalizeUserName('  Eco Friend  '), 'Eco Friend');
});

test('rejects missing, non-string, overlong, and control-character names', () => {
  assert.equal(normalizeUserName(null), null);
  assert.equal(normalizeUserName('   '), null);
  assert.equal(normalizeUserName(42), null);
  assert.equal(normalizeUserName('x'.repeat(25)), null);
  assert.equal(normalizeUserName('Eco\nFriend'), null);
});
