import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Optional verification helper. Pass an already available marked ES module.
// It installs nothing and is not needed by the app or npm ci/test/build.
if (!process.argv[2]) throw new Error('Передайте путь к существующему marked/lib/marked.esm.js.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { marked } = await import(pathToFileURL(path.resolve(process.argv[2])).href);
const text = await readFile(path.join(root, 'docs/MANUAL.md'), 'utf8');
const output = path.join(root, 'output/playwright');
await mkdir(output, { recursive: true });
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/svg+xml" href="/icon.svg"><title>Personal Trainer — учебный мануал</title><style>
body{margin:0;background:#f6f5ef;color:#26372f;font:16px/1.65 system-ui,sans-serif}main{max-width:1120px;margin:30px auto;padding:38px;background:white;border:1px solid #e3e7df;border-radius:12px}h1{font-size:32px;line-height:1.2}h2{margin-top:38px;padding-top:12px;border-top:1px solid #e3e7df;font-size:23px}h3{font-size:17px;color:#214b41;margin-top:28px}p,li{max-width:95ch}a{color:#21584a}pre{background:#f1f4ee;padding:18px;border-radius:8px;overflow:auto;font-size:12px;line-height:1.6}code{font-family:ui-monospace,monospace}p code,li code,td code{font-size:.85em;background:#f1f4ee;padding:1px 3px}table{border-collapse:collapse;width:100%;font-size:13px;line-height:1.6}th,td{border:1px solid #e3e7df;text-align:left;padding:9px}th{background:#f1f4ee}blockquote{border-left:3px solid #749568;padding-left:16px}@media(max-width:600px){main{margin:12px;padding:18px}h1{font-size:26px}table{font-size:11px}th,td{padding:5px}}
</style></head><body><main>${marked.parse(text)}</main></body></html>`;
await writeFile(path.join(output, 'manual.html'), html, 'utf8');
console.log('Generated output/playwright/manual.html for visual verification.');
