import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const destination = path.join(root, 'dist', 'extension');
await mkdir(destination, { recursive: true });
await cp(path.join(root, 'extension'), destination, { recursive: true, force: true });
console.log(`Extension copied to ${destination}`);
