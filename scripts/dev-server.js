import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 5173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export function safeResolve(rootDir, urlPath) {
  const pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const candidate = resolve(rootDir, `.${pathname}`);
  if (candidate !== rootDir && !candidate.startsWith(`${rootDir}/`)) return null;
  return candidate;
}

export function createStaticServer(rootDir = root) {
  return createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const path = safeResolve(rootDir, url.pathname);
  if (!path) {
    response.writeHead(404, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    response.end('Not found');
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
  createStaticServer().listen(port, '0.0.0.0', () => process.stdout.write(`Server listening on http://0.0.0.0:${port}\n`));
}

