import { resolve, sep } from 'node:path';

export function safeResolve(root, urlPath) {
  const absoluteRoot = resolve(root);
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  } catch {
    return null;
  }
  const candidate = resolve(absoluteRoot, `.${pathname}`);
  if (candidate !== absoluteRoot && !candidate.startsWith(`${absoluteRoot}${sep}`)) return null;
  return candidate;
}
