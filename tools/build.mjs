/**
 * Block 1 of 1 — tools/build.mjs
 * Description: check → mirror → compile MD books → stamp library + readers
 * Version: 1.d
 * Revised: 260710 17:30
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileBookFile, mirrorBookImages } from './compile-md.mjs';

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

function resolveMdPath(entry) {
  if (entry.path) return path.join(SRC, entry.path);
  return path.join(SRC, 'content', 'books', entry.slug, 'book.md');
}

/**
 * Compile all catalog books that have source MD.
 * @returns {{ libraryBooks: object[], errors: number }}
 */
function compileBooks(catalog) {
  const libraryBooks = [];
  let errors = 0;

  for (const entry of catalog.books || []) {
    if (!entry.slug) continue;
    const mdPath = resolveMdPath(entry);
    const srcBookDir = path.dirname(mdPath);
    const outDir = path.join(PUBLIC, 'books', entry.slug);
    ensureDir(outDir);

    if (!fs.existsSync(mdPath)) {
      console.warn(`  WARN  missing ${path.relative(ROOT, mdPath)} — stub body`);
      const title = entry.title || titleFromSlug(entry.slug);
      fs.writeFileSync(
        path.join(outDir, 'body.html'),
        `<article class="book"><h1>${escapeHtml(title)}</h1><p class="book-meta">Content missing.</p></article>\n`
      );
      fs.writeFileSync(path.join(outDir, 'toc.json'), '[]\n');
      libraryBooks.push({
        slug: entry.slug,
        title,
        author: entry.author || 'Unknown',
        emoji: entry.emoji || '📖',
        cover: entry.cover || { colors: ['#4a5568'] },
        enabled: entry.enabled !== false,
        lang: entry.lang || 'pt',
        license: entry.license || 'unknown'
      });
      continue;
    }

    console.log(`→ compile ${entry.slug}`);
    const result = compileBookFile(mdPath, { folderSlug: entry.slug });
    for (const w of result.warnings) console.warn(`  WARN  ${entry.slug}: ${w}`);
    if (!result.ok) {
      console.error(`  FAIL  ${entry.slug}: ${result.fatal.join('; ')}`);
      errors++;
      continue;
    }

    fs.writeFileSync(path.join(outDir, 'body.html'), result.html);
    fs.writeFileSync(path.join(outDir, 'toc.json'), JSON.stringify(result.toc, null, 2) + '\n');
    const imgs = mirrorBookImages(srcBookDir, outDir);
    if (imgs) console.log(`  images: ${imgs}`);

    const m = result.meta;
    libraryBooks.push({
      slug: m.slug,
      title: m.title,
      author: m.author,
      emoji: m.emoji,
      cover: m.cover,
      enabled: entry.enabled !== false,
      lang: m.lang,
      license: m.license,
      copyright: m.copyright || '',
      subtitle: m.subtitle || '',
      order: m.order != null ? m.order : libraryBooks.length
    });
  }

  return { libraryBooks, errors };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function writeLibraryJson(catalog, libraryBooks) {
  libraryBooks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const payload = {
    brand: catalog.brand || 'L.I.B.R.U.S',
    tagline: catalog.tagline || 'annotate / read / consult',
    books: libraryBooks
  };
  fs.writeFileSync(path.join(PUBLIC, 'library.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(`→ library.json (${libraryBooks.length} book(s))`);
}

function stampReaders(libraryBooks) {
  const tplPath = path.join(SRC, 'templates', 'reader.html');
  if (!fs.existsSync(tplPath)) {
    console.warn('→ skip readers (no templates/reader.html)');
    return;
  }
  const template = fs.readFileSync(tplPath, 'utf8');
  let n = 0;

  for (const b of libraryBooks) {
    if (!b.slug) continue;
    const dir = path.join(PUBLIC, 'books', b.slug);
    ensureDir(dir);
    const html = template
      .replaceAll('{{ASSET_PREFIX}}', '../../')
      .replaceAll('{{BOOK_TITLE}}', b.title || b.slug)
      .replaceAll('{{BOOK_FILE}}', 'body.html')
      .replaceAll('{{BOOK_SLUG}}', b.slug)
      .replaceAll('{{BOOK_BODY}}', '');
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    n++;
  }
  console.log(`→ stamped ${n} reader shell(s)`);
}

function writeIntegrity() {
  const payload = {
    version: 1,
    buildId: '0.1.0-dev',
    checkedAt: new Date().toISOString(),
    status: 'pass',
    brand: 'L.I.B.R.U.S',
    tagline: 'annotate / read / consult',
    phase: 'pr3-md-compile'
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
  const { libraryBooks, errors } = compileBooks(catalog);
  if (errors) {
    console.error(`\nBuild aborted: ${errors} book(s) failed front matter / compile`);
    process.exit(1);
  }

  writeLibraryJson(catalog, libraryBooks);

  const libTpl = path.join(SRC, 'templates', 'library.html');
  if (fs.existsSync(libTpl)) {
    fs.copyFileSync(libTpl, path.join(PUBLIC, 'index.html'));
  }

  stampReaders(libraryBooks);
  writeIntegrity();
  console.log('\n→ public/ ready');
  console.log('  npm start  → http://localhost:3000');
  console.log('  reader     → http://localhost:3000/books/lde/\n');
}

main();
