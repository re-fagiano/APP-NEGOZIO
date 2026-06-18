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

function isMalformedPath(urlPath) {
  try {
    decodeURIComponent(urlPath);
    return false;
  } catch {
    return true;
  }
}

export function safeResolve(rootDir, urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  } catch {
    return null;
  }
  const absoluteRoot = resolve(rootDir);
  const candidate = resolve(absoluteRoot, `.${pathname}`);
  if (candidate !== absoluteRoot && !candidate.startsWith(`${absoluteRoot}/`)) return null;
  return candidate;
}

export function createStaticServer(rootDir = root) {
  const absoluteRoot = resolve(rootDir);
  return createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const path = safeResolve(absoluteRoot, url.pathname);
    if (!path) {
      const status = isMalformedPath(url.pathname) ? 400 : 404;
      response.writeHead(status, { ...securityHeaders, 'Content-Type': 'text/plain' });
      response.end(status === 400 ? 'Bad request' : 'Not found');
      return;
    }
    try {
      const info = await stat(path);
      if (!info.isFile()) throw new Error('not a file');
      response.writeHead(200, { ...securityHeaders, 'Content-Type': types[extname(path)] || 'application/octet-stream' });
      createReadStream(path).pipe(response);
    } catch {
      response.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/plain' });
      response.end('Not found');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createStaticServer().listen(port, '127.0.0.1', () => process.stdout.write(`Server listening on http://127.0.0.1:${port}\n`));
}
