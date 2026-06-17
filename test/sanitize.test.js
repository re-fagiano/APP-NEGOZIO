import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeAttribute, escapeHtml } from '../src/utils/sanitize.js';

test('escapeHtml neutralizes markup and scripts', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
});

test('escapeAttribute protects quoted attributes', () => {
  assert.equal(escapeAttribute('" onclick="alert(1)`'), '&quot; onclick=&quot;alert(1)&#96;');
});
