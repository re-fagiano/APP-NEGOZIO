import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { safeResolve } from '../scripts/dev-server.js';

test('dev server path resolver keeps requests inside root', () => {
  const root = resolve('/tmp/app');
  assert.equal(safeResolve(root, '/src/main.js'), resolve('/tmp/app/src/main.js'));
  assert.equal(safeResolve(root, '/../secret.txt'), null);
  assert.equal(safeResolve(root, '/%2e%2e/secret.txt'), null);
});
