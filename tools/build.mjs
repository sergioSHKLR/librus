/**
 * Block 1 of 1 — tools/build.mjs
 * Description: Orchestrate check → mirror static → stamp stubs (PR 0 scaffold)
 * Version: 1.a
 * Revised: 260710 16:00
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');

function runCheck() {
  console.log('→ check-blocks');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'check-blocks.mjs')], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if (r.status !== 0) {
    console.error('\nBuild aborted: check-blocks FAIL');
    process.exit(r.status || 1);
  }
}

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(to);
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);
    const st = fs.statSync(src);
    if (st.isDirectory()) copyRecursive(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function writeIntegrity() {
  const payload = {
    version: 1,
    buildId: '0.1.0-dev',
    checkedAt: new Date().toISOString(),
    status: 'pass',
    brand: 'L.I.B.R.U.S',
    tagline: 'annotate / read / consult',
    note: 'PR 0 scaffold — full file list filled in later builds'
  };
  fs.writeFileSync(path.join(PUBLIC, 'integrity.json'), JSON.stringify(payload, null, 2) + '\n');
}

function main() {
  console.log('L.I.B.R.U.S nano-ssg — build\n');
  runCheck();

  rimraf(PUBLIC);
  ensureDir(PUBLIC);

  // Mirror static trees (path parity)
  for (const dir of ['css', 'js', 'locales', 'icons', 'images', 'pages']) {
    copyRecursive(path.join(SRC, dir), path.join(PUBLIC, dir));
  }
  for (const f of ['manifest.webmanifest', 'sw.js', 'hypothesis-boot.js']) {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(PUBLIC, f));
  }

  // Stamp library from template if present
  const libTpl = path.join(SRC, 'templates', 'library.html');
  if (fs.existsSync(libTpl)) {
    fs.copyFileSync(libTpl, path.join(PUBLIC, 'index.html'));
  } else {
    fs.writeFileSync(
      path.join(PUBLIC, 'index.html'),
      '<!DOCTYPE html><html><body><p>nano-ssg: missing templates/library.html</p></body></html>\n'
    );
  }

  writeIntegrity();
  console.log('\n→ public/ ready (scaffold)');
  console.log('  npm start  → serve public on :3000\n');
}

main();
