import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const bundlePath = fileURLToPath(new URL('../../../../assets/viewer/avatar-viewer.js', import.meta.url));
const source = await readFile(bundlePath, 'utf8');
const result = await transform(source, { minify: true, format: 'esm', target: 'es2020' });
await writeFile(bundlePath, result.code);
