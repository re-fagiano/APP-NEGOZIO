import { once } from 'node:events';
import { resolve } from 'node:path';
import { createStaticServer } from './dev-server.js';

const server = createStaticServer(resolve('.'));
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const { port } = server.address();

try {
  const checks = [
    ['/', 200],
    ['/src/main.js', 200],
    ['/src/styles.css', 200],
    ['/%E0%A4%A', 400],
  ];

  for (const [path, expectedStatus] of checks) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    if (response.status !== expectedStatus) {
      throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
    }
  }

  process.stdout.write('Smoke checks passed\n');
} finally {
  server.close();
}
