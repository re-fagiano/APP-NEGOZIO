import { resolve, sep } from 'node:path';

export function safeResolve(root, urlPath) {
  const absoluteRoot = resolve(root);
  const pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const candidate = resolve(absoluteRoot, `.${pathname}`);
  if (candidate !== absoluteRoot && !candidate.startsWith(`${absoluteRoot}${sep}`)) return null;
  return candidate;
}
