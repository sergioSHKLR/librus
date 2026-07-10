/**
 * Block 1 of 1 — tools/build.mjs
 * Description: Orchestrate check → mirror static → library.json → stamp library
 * Version: 1.b
 * Revised: 260710 16:30
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

function readCatalog() {
  const p = path.join(SRC, 'config', 'catalog.json');
  if (!fs.existsSync(p)) return { brand: 'L.I.B.R.U.S', tagline: 'annotate / read / consult', books: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Placeholder library entries until PR 3 front-matter compile. */
function writeLibraryJson(catalog) {
  const books = (catalog.books || []).map((b) => ({
    slug: b.slug,
    title: b.title || titleFromSlug(b.slug),
    author: b.author || 'Allan Kardec',
    emoji: b.emoji || defaultEmoji(b.slug),
    cover: b.cover || defaultCover(b.slug),
    enabled: b.enabled === true,
    lang: b.lang || 'pt',
    license: b.license || 'unknown'
  }));

  const payload = {
    brand: catalog.brand || 'L.I.B.R.U.S',
    tagline: catalog.tagline || 'annotate / read / consult',
    books
  };
  fs.writeFileSync(path.join(PUBLIC, 'library.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(`→ library.json (${books.length} book(s))`);
}

function titleFromSlug(slug) {
  const map = {
    lde: 'O Livro dos Espíritos',
    ldm: 'O Livro dos Médiuns',
    ese: 'O Evangelho segundo o Espiritismo',
    ceu: 'O Céu e o Inferno',
    gen: 'A Gênese'
  };
  return map[slug] || slug;
}

function defaultEmoji(slug) {
  const map = { lde: '✨', ldm: '✒️', ese: '🕊️', ceu: '⚖️', gen: '🌌' };
  return map[slug] || '📖';
}

function defaultCover(slug) {
  const map = {
    lde: { colors: ['#1a4a7a', '#2d6a9f'], angle: 135 },
    ldm: { colors: ['#3d2914', '#8b6914'], angle: 135 },
    ese: { colors: ['#1b4332', '#40916c'], angle: 135 },
    ceu: { colors: ['#240046', '#7b2cbf'], angle: 135 },
    gen: { colors: ['#370617', '#9d0208'], angle: 135 }
  };
  return map[slug] || { colors: ['#4a5568'] };
}

function writeIntegrity() {
  const payload = {
    version: 1,
    buildId: '0.1.0-dev',
    checkedAt: new Date().toISOString(),
    status: 'pass',
    brand: 'L.I.B.R.U.S',
    tagline: 'annotate / read / consult',
    phase: 'pr1-library-shell'
  };
  fs.writeFileSync(path.join(PUBLIC, 'integrity.json'), JSON.stringify(payload, null, 2) + '\n');
}

function main() {
  console.log('L.I.B.R.U.S nano-ssg — build\n');
  runCheck();

  rimraf(PUBLIC);
  ensureDir(PUBLIC);

  for (const dir of ['css', 'js', 'locales', 'icons', 'images', 'pages']) {
    copyRecursive(path.join(SRC, dir), path.join(PUBLIC, dir));
  }
  for (const f of ['manifest.webmanifest', 'sw.js', 'hypothesis-boot.js']) {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(PUBLIC, f));
  }

  const catalog = readCatalog();
  writeLibraryJson(catalog);

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
  console.log('\n→ public/ ready');
  console.log('  npm start  → http://localhost:3000\n');
}

main();
