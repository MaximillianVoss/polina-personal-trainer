import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['README.md', 'docs/ASSIGNMENT.md', 'docs/MANUAL-INTRO.md', 'docs/MANUAL.md', 'docs/VERIFICATION.md'];
const guide = path.resolve(root, '../../guides/final-frontend-personal-trainer.md');
if (await stat(guide).then(value => value.isFile()).catch(() => false)) names.push(guide);

function prose(text) {
  let fence = 0;
  return text.split(/\r?\n/).filter(line => {
    const match = /^\s*(`{3,})/.exec(line);
    if (match) { fence = fence ? match[1].length >= fence ? 0 : fence : match[1].length; return false; }
    return !fence;
  }).join('\n');
}
function anchors(text) {
  return new Set([
    ...[...text.matchAll(/<a\s+id="([^"]+)"/g)].map(match => match[1]),
    ...[...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-')),
  ]);
}

let count = 0;
const failures = [];
for (const name of names) {
  const source = path.resolve(root, name);
  const text = prose(await readFile(source, 'utf8'));
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) continue;
    const [file, fragment] = target.split('#');
    const destination = file ? path.resolve(path.dirname(source), file) : source;
    // Cross-kit references are available only in the original bundle.
    if (!destination.startsWith(`${root}${path.sep}`) && !(await stat(path.resolve(root, '../../assignments')).then(value => value.isDirectory()).catch(() => false))) continue;
    try {
      if (!(await stat(destination)).isFile()) throw new Error('not a file');
      if (fragment && !anchors(prose(await readFile(destination, 'utf8'))).has(decodeURIComponent(fragment))) throw new Error('missing anchor');
      count += 1;
    } catch { failures.push(`${path.basename(source)} → ${target}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Markdown links verified: ${count}; documents: ${names.length}.`);
