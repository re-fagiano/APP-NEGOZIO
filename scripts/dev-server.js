import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeResolve } from './server-path.js';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 5173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

export { safeResolve };

export function createStaticServer(rootDir = root) {
  return createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const path = safeResolve(rootDir, url.pathname);
    if (!path) {
      response.writeHead(400, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      response.end('Bad request');
      return;
    }
    try {
      const info = await stat(path);
      if (!info.isFile()) throw new Error('not a file');
      response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      createReadStream(path).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
      response.end('Not found');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createStaticServer().listen(port, '127.0.0.1', () => process.stdout.write(`Server listening on http://127.0.0.1:${port}\n`));
}
