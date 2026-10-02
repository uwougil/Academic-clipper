import { readFile, writeFile, realpath } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { sanitizeNatureHtml, sha256Bytes, verifyManifestFixtures, CorpusIntegrityError } from './lib/nature-corpus-infrastructure.mjs';

const HELP = `Source-backed Nature excerpt tool (offline).
Sanitize: node scripts/sanitize-nature-corpus.mjs --input <external raw body> --recipe <json> --output <excerpt.html> --kind article|table [--size-exception <json>]
Validate: node scripts/sanitize-nature-corpus.mjs --validate-manifest <json> --corpus-root <directory> --registry <local module>
Registry module exports assertionRegistry: Map<id, {validate, assert}>.
Sanitize reports provenance JSON on stdout; does not save raw captures or a manifest.
Exit: 0 success; 1 integrity/I/O failure; 64 usage error.`;
function usage(message) { const error = new Error(message); error.code = 'USAGE'; throw error; }
function parse(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  const allowed = new Set(['--input', '--recipe', '--output', '--kind', '--size-exception', '--validate-manifest', '--corpus-root', '--registry']);
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (!allowed.has(key) || Object.hasOwn(result, key) || !args[index + 1] || args[index + 1].startsWith('--')) usage(`Unknown, duplicate, or missing option: ${key}`);
    result[key] = args[index + 1];
  }
  const required = result['--validate-manifest'] ? ['--validate-manifest', '--corpus-root', '--registry'] : ['--input', '--recipe', '--output', '--kind'];
  if (required.some((key) => !result[key]) || Object.keys(result).some((key) => !required.includes(key) && !(key === '--size-exception' && !result['--validate-manifest']))) usage(HELP);
  if (result['--kind'] && !['article', 'table'].includes(result['--kind'])) usage('--kind must be article or table');
  return result;
}
function within(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}
export async function runSanitizerCli(args) {
  const options = parse(args);
  if (options.help) return { help: HELP };
  if (options['--validate-manifest']) {
    const manifest = JSON.parse(await readFile(options['--validate-manifest'], 'utf8'));
    const { assertionRegistry } = await import(pathToFileURL(path.resolve(options['--registry'])).href);
    return verifyManifestFixtures(manifest, options['--corpus-root'], { assertionRegistry });
  }
  const repo = await realpath(fileURLToPath(new URL('..', import.meta.url)));
  const input = await realpath(options['--input']);
  const output = path.resolve(options['--output']);
  const parent = await realpath(path.dirname(output));
  const resolvedOutput = path.join(parent, path.basename(output));
  // Resolve an existing symlink too. Output cannot overwrite input, ordinary papers,
  // golden artifacts or unrelated repository files.
  let existingOutput;
  try { existingOutput = await realpath(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const target = existingOutput || resolvedOutput;
  if (within(repo, input) && !within(path.join(repo, 'test', 'corpus', 'fixtures'), input)) usage('Raw capture input must be outside the repository.');
  if (target === input || (within(repo, target) && !within(path.join(repo, 'test', 'corpus', 'fixtures'), target))) usage('Output must be an external excerpt or test/corpus/fixtures excerpt; cannot overwrite source or unrelated files.');
  const rawBytes = await readFile(input);
  const html = new TextDecoder('utf-8', { fatal: true }).decode(rawBytes);
  const recipe = JSON.parse(await readFile(options['--recipe'], 'utf8'));
  const result = sanitizeNatureHtml(html, recipe);
  const maxBytes = options['--kind'] === 'article' ? 256 * 1024 : 64 * 1024;
  let sizeException;
  if (options['--size-exception']) {
    sizeException = JSON.parse(await readFile(options['--size-exception'], 'utf8'));
    if (Object.keys(sizeException).sort().join(',') !== 'reason,reviewedBy' || !sizeException.reason?.trim() || !sizeException.reviewedBy?.trim()) usage('Size exception requires only nonempty reason and reviewedBy');
  }
  if (result.bytes.length > maxBytes && !sizeException) throw new CorpusIntegrityError(`Excerpt exceeds ${maxBytes} bytes; requires reviewed size exception`);
  await writeFile(output, result.bytes, { flag: 'wx' });
  const { bytes, html: excerpt, ...provenance } = result;
  return { sourceSha256: sha256Bytes(rawBytes), ...provenance, bytes: bytes.length, ...(sizeException ? { sizeException } : {}) };
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await runSanitizerCli(process.argv.slice(2));
    console.log(result.help || JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`${error.code || 'ERROR'}: ${error.message}`);
    process.exitCode = error.code === 'USAGE' ? 64 : 1;
  }
}
