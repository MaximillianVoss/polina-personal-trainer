import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', '.nvmrc', '.env.example', 'public/icon.svg',
  'src/types.ts', 'src/domain.ts', 'src/demo.ts', 'src/api.ts', 'src/Dialog.tsx', 'src/Forms.tsx',
  'src/Calendar.tsx', 'src/App.tsx', 'src/main.tsx', 'src/styles.css',
  'tests/setup.ts', 'tests/domain.test.ts', 'tests/demo.test.ts', 'tests/api.test.ts', 'tests/App.test.tsx',
  'scripts/build-manual.mjs', 'scripts/check-docs.mjs', 'scripts/render-doc-preview.mjs',
];
const intro = (await readFile(path.join(root, 'docs/MANUAL-INTRO.md'), 'utf8')).replaceAll('\r\n', '\n').trimEnd();
const snippets = await Promise.all(files.map(async name => {
  const content = (await readFile(path.join(root, name), 'utf8')).replaceAll('\r\n', '\n').trimEnd();
  const language = name.endsWith('.tsx') ? 'tsx' : name.endsWith('.ts') ? 'typescript' : name.endsWith('.json') ? 'json' : name.endsWith('.html') ? 'html' : name.endsWith('.svg') ? 'xml' : name.endsWith('.css') ? 'css' : name.endsWith('.mjs') ? 'javascript' : 'text';
  const fence = '`'.repeat(Math.max(3, ...[...content.matchAll(/`+/g)].map(match => match[0].length + 1)));
  return `### ${name}\n\n${fence}${language}\n${content}\n${fence}\n`;
}));
const appendix = `${snippets.join('\n')}\n`;
const manual = `${intro}\n\n${appendix}`;
const destinations = [{ name: path.join(root, 'docs/MANUAL.md'), value: manual }];
const guidesDir = path.resolve(root, '../../guides');
if (process.argv.includes('--bundle-guide')) {
  if (!(await stat(path.join(guidesDir, 'final-frontend-personal-trainer.md')).then(value => value.isFile()).catch(() => false))) throw new Error('Параметр --bundle-guide используется только внутри исходного учебного комплекта.');
  const guideIntro = intro.replace(/\]\(([^)]+)\)/g, (match, target) => {
    if (/^(?:[a-z]+:|#)/i.test(target)) return match;
    const [file, fragment] = target.split('#');
    const relative = path.relative(guidesDir, path.resolve(root, 'docs', file)).replaceAll('\\', '/');
    return `](${relative}${fragment ? `#${fragment}` : ''})`;
  });
  destinations.push({ name: path.join(guidesDir, 'final-frontend-personal-trainer.md'), value: `${guideIntro}\n\n${appendix}` });
}
let stale = false;
for (const destination of destinations) {
  if (process.argv.includes('--check')) {
    const saved = await readFile(destination.name, 'utf8').catch(() => '');
    if (saved.replaceAll('\r\n', '\n') !== destination.value) { console.error(`Outdated: ${path.basename(destination.name)}`); stale = true; }
  } else await writeFile(destination.name, destination.value, 'utf8');
}
if (stale) process.exitCode = 1;
else console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} complete source listings: ${files.length} files, ${destinations.length} documents.`);
