import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createStaticServer } from '../scripts/dev-server.js';

test('static server sends baseline security headers', async () => {
  const server = createStaticServer('.');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/`);
  server.close();

  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
});
