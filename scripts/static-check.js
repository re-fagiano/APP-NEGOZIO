import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const forbidden = [new RegExp('TODO' + '_SECRET', 'i'), new RegExp('VITE_' + '.*API' + '_KEY', 'i'), new RegExp('console' + '\\.log\\(')];
const roots = ['src', 'scripts', 'test'];
const failures = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    if (entry.isFile() && /\.(js|css|html)$/.test(entry.name)) {
      const text = await readFile(path, 'utf8');
      for (const pattern of forbidden) {
        if (pattern.test(text)) failures.push(`${path}: forbidden pattern found`);
      }
    }
  }
}

for (const root of roots) await walk(root);
if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('Static checks passed\n');
