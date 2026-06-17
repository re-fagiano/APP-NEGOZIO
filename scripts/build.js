import { mkdir, cp, copyFile, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
await copyFile('index.html', 'dist/index.html');
process.stdout.write('Build completed in dist/\n');
