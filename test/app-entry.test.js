import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('browser entrypoint loads CSS from HTML instead of importing CSS as JS', async () => {
  const [html, main] = await Promise.all([readFile('index.html', 'utf8'), readFile('src/main.js', 'utf8')]);
  assert.match(html, /<link rel="stylesheet" href="\/src\/styles\.css" \/>/);
  assert.doesNotMatch(main, /import\s+['"]\.\/styles\.css['"]/);
});

test('main entrypoint wires validation helpers and settings handler', async () => {
  const main = await readFile('src/main.js', 'utf8');
  assert.match(main, /validateTicketDraft/);
  assert.match(main, /validateInventoryDraft/);
  assert.match(main, /validateBackupPayload/);
  assert.match(main, /function updateSettings/);
});
