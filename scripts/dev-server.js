import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 5173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function safeResolve(urlPath) {
  const pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return candidate;
}

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const path = safeResolve(url.pathname);
  if (!path) {
    response.writeHead(403, { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' });
    response.end('Forbidden');
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
}).listen(port, '0.0.0.0', () => process.stdout.write(`Server listening on http://0.0.0.0:${port}\n`));
