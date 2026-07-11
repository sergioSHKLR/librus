/**
 * Block 1 of 1 — tools/build.mjs
 * Description: check → preflight → link → compile → link stats → stamp
 * Version: 1.g
 * Revised: 11Jul26
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
const BRAND = 'L∙I∙B∙R∙U∙S';
const TAGLINE = 'annotate to assimilate';

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
  if (!fs.existsSync(p)) return { brand: BRAND, tagline: TAGLINE, books: [] };
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

function pythonBin() {
  const venv = path.join(ROOT, '.venv', 'bin', 'python');
  if (fs.existsSync(venv)) return venv;
  return 'python3';
}

/** Log-only authoring checklist (never interactive). */
function preflight(catalog) {
  console.log('\n→ preflight (log-only)');
  console.log('  Have you placed all books as MD at src/content/books/{slug}/book.md?');
  console.log('  Is front matter valid and complete (title, slug, abstract, categories…)?');
  console.log('  Catalog entries must match folders; enabled books need readable MD.\n');

  const booksDir = path.join(SRC, 'content', 'books');
  const diskSlugs = fs.existsSync(booksDir)
    ? fs
        .readdirSync(booksDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

  const catalogSlugs = (catalog.books || []).map((b) => b.slug).filter(Boolean);
  console.log(`  catalog books: ${catalogSlugs.length} [${catalogSlugs.join(', ') || '—'}]`);
  console.log(`  disk folders:  ${diskSlugs.length} [${diskSlugs.join(', ') || '—'}]`);

  for (const slug of diskSlugs) {
    if (!catalogSlugs.includes(slug)) {
      console.warn(`  WARN  folder books/${slug}/ not listed in catalog.json`);
    }
  }

  for (const entry of catalog.books || []) {
    if (!entry.slug) {
      console.warn('  WARN  catalog entry missing slug');
      continue;
    }
    const mdPath = resolveMdPath(entry);
    const rel = path.relative(ROOT, mdPath);
    if (!fs.existsSync(mdPath)) {
      console.warn(`  WARN  missing MD: ${rel}`);
      continue;
    }
    const raw = fs.readFileSync(mdPath, 'utf8');
    const hasFm = raw.startsWith('---');
    console.log(`  OK    ${entry.slug} → ${rel}${hasFm ? '' : ' (no front matter delimiter)'}`);
  }
  console.log('');
}

/** Cache-only linker: source MD stays clean; output → .cache/linked/{slug}.md */
function linkBook(entry, mdPath) {
  if (entry.link === false) return mdPath;

  const lang = entry.lang || 'pt';
  const dicts = path.join(SRC, 'data', 'dictionaries', lang);
  if (!fs.existsSync(dicts)) {
    console.warn(`  WARN  no dictionaries at ${path.relative(ROOT, dicts)} — skip link`);
    return mdPath;
  }

  const cacheDir = path.join(ROOT, '.cache', 'linked');
  ensureDir(cacheDir);
  const outMd = path.join(cacheDir, entry.slug + '.md');
  const report = path.join(cacheDir, entry.slug + '-report.json');
  const script = path.join(ROOT, 'tools', 'run-linker.py');

  console.log(`→ link ${entry.slug}`);
  const r = spawnSync(
    pythonBin(),
    [
      script,
      '--input',
      mdPath,
      '--output',
      outMd,
      '--report',
      report,
      '--dicts',
      dicts,
      '--lang',
      lang,
      '--density',
      'hi'
    ],
    { cwd: ROOT, encoding: 'utf8' }
  );

  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);

  if (r.status !== 0 || !fs.existsSync(outMd)) {
    console.warn(`  WARN  linker failed for ${entry.slug} — compiling unlinked source`);
    return mdPath;
  }
  logLinkerReportStats(entry.slug, report);
  logMarkdownLinkStats(entry.slug, outMd);
  return outMd;
}

const PROVIDER_LABELS = { l: 'luz', w: 'wiki', d: 'dict', m: 'maps' };

/** Format "l:12 w:8 d:3 (total 23)" */
function formatByCode(map) {
  const parts = ['l', 'w', 'd', 'm']
    .filter((c) => (map[c] || 0) > 0)
    .map((c) => `${c}:${map[c]}`);
  const total = ['l', 'w', 'd', 'm'].reduce((s, c) => s + (map[c] || 0), 0);
  return `${parts.join(' ') || '—'}  (total ${total})`;
}

/**
 * Count baked provider links in compiled body.html.
 * total = every <a data-link-provider>; unique = distinct href per code.
 */
function countHtmlProviderLinks(html) {
  const totals = { l: 0, w: 0, d: 0, m: 0 };
  const uniques = { l: new Set(), w: new Set(), d: new Set(), m: new Set() };
  const re = /<a\b[^>]*\bdata-link-provider="([lwdm])"[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const code = m[1];
    const tag = m[0];
    const hrefM = /\bhref="([^"]*)"/i.exec(tag);
    const href = hrefM ? hrefM[1] : `#${totals[code]}`;
    totals[code] += 1;
    uniques[code].add(href);
  }
  return {
    total: totals,
    unique: {
      l: uniques.l.size,
      w: uniques.w.size,
      d: uniques.d.size,
      m: uniques.m.size
    }
  };
}

/** Short-link form in linked MD: ](l:Target "l:med") etc. */
function countMarkdownProviderLinks(md) {
  const totals = { l: 0, w: 0, d: 0, m: 0 };
  const uniques = { l: new Set(), w: new Set(), d: new Set(), m: new Set() };
  /* [text](l:slug) or [text](<l:slug with spaces> "l:med") */
  const re = /\]\(\s*<?([lwdm]):([^>"\)]+?)>?(?:\s+"[^"]*")?\s*\)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const code = m[1];
    const target = m[2].trim();
    totals[code] += 1;
    uniques[code].add(target);
  }
  return {
    total: totals,
    unique: {
      l: uniques.l.size,
      w: uniques.w.size,
      d: uniques.d.size,
      m: uniques.m.size
    }
  };
}

function sumCodes(map) {
  return ['l', 'w', 'd', 'm'].reduce((s, c) => s + (map[c] || 0), 0);
}

function logLinkStatsBlock(title, stats) {
  console.log(`  ${title}`);
  console.log(`    total   ${formatByCode(stats.total)}`);
  console.log(`    unique  ${formatByCode(stats.unique)}`);
}

function logLinkerReportStats(slug, reportPath) {
  if (!fs.existsSync(reportPath)) return;
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const meta = report.meta || {};
    const byProv = (report.stats && report.stats.candidates_by_provider) || {};
    const codes = { l: 0, w: 0, d: 0, m: 0 };
    const nameToCode = { luz: 'l', wikipedia: 'w', wiktionary: 'd', maps: 'm' };
    for (const [name, n] of Object.entries(byProv)) {
      const c = nameToCode[name] || name[0];
      if (codes[c] != null) codes[c] += Number(n) || 0;
    }
    /* match_count = sum of occurrence hits in phase-1 scan; candidate_count = unique targets */
    const cand = meta.candidate_count ?? Object.values(codes).reduce((a, b) => a + b, 0);
    const matches = meta.match_count ?? cand;
    console.log(`  report  candidates (unique targets) ${formatByCode(codes)}`);
    console.log(`  report  phase-1 match hits (all positions) total ${matches} · unique targets ${cand}`);
    if (matches <= cand) {
      console.log(
        `  note    linker scans/bakes ≤1 use per concept×provider (no repeated links for same term)`
      );
    }
  } catch (err) {
    console.warn(`  WARN  could not read link report: ${err.message || err}`);
  }
}

function logMarkdownLinkStats(slug, mdPath) {
  if (!fs.existsSync(mdPath)) return;
  const md = fs.readFileSync(mdPath, 'utf8');
  logLinkStatsBlock(`links ${slug} (linked MD)`, countMarkdownProviderLinks(md));
}

function logHtmlLinkStats(slug, html) {
  logLinkStatsBlock(`links ${slug} (body.html)`, countHtmlProviderLinks(html));
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
        license: entry.license || 'unknown',
        abstract: entry.abstract || '',
        categories: entry.categories || []
      });
      continue;
    }

    const compileFrom = linkBook(entry, mdPath);

    console.log(`→ compile ${entry.slug}`);
    const result = compileBookFile(compileFrom, { folderSlug: entry.slug });
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
    const htmlStats = countHtmlProviderLinks(result.html);
    logLinkStatsBlock(`links ${entry.slug} (body.html)`, htmlStats);
    if (compileFrom !== mdPath && fs.existsSync(compileFrom)) {
      const mdStats = countMarkdownProviderLinks(fs.readFileSync(compileFrom, 'utf8'));
      const mdN = sumCodes(mdStats.total);
      const htmlN = sumCodes(htmlStats.total);
      if (mdN !== htmlN) {
        console.warn(
          `  WARN  ${entry.slug}: linked MD has ${mdN} provider links but body.html has ${htmlN} (MD→HTML drop)`
        );
      }
    }

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
      abstract: m.abstract || '',
      categories: m.categories || [],
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
    brand: catalog.brand || BRAND,
    tagline: catalog.tagline || TAGLINE,
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
    brand: BRAND,
    tagline: TAGLINE,
    phase: 'polish-batch'
  };
  fs.writeFileSync(path.join(PUBLIC, 'integrity.json'), JSON.stringify(payload, null, 2) + '\n');
}

function dirSizeBytes(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  const walk = (p) => {
    for (const name of fs.readdirSync(p)) {
      const full = path.join(p, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else total += st.size;
    }
  };
  walk(dir);
  return total;
}

function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function summarizePublic() {
  const bytes = dirSizeBytes(PUBLIC);
  console.log(`\n→ public/ total size: ${formatMb(bytes)} MB (${bytes.toLocaleString()} bytes)`);
  for (const name of ['books', 'css', 'js', 'icons', 'locales', 'pages'].sort()) {
    const p = path.join(PUBLIC, name);
    if (!fs.existsSync(p)) continue;
    const b = dirSizeBytes(p);
    console.log(`    ${name}/  ${formatMb(b)} MB`);
  }
}

function main() {
  console.log(`${BRAND} nano-ssg — build\n`);
  runCheck();

  const catalog = readCatalog();
  preflight(catalog);

  rimraf(PUBLIC);
  ensureDir(PUBLIC);

  for (const dir of ['css', 'js', 'locales', 'icons', 'images', 'pages']) {
    copyRecursive(path.join(SRC, dir), path.join(PUBLIC, dir));
  }
  for (const f of ['manifest.webmanifest', 'sw.js', 'hypothesis-boot.js']) {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(PUBLIC, f));
  }

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
  summarizePublic();
  console.log('\n→ public/ ready');
  console.log('  Serve document root: public/  (not the repo root)');
  console.log('  npm start  → http://localhost:3000');
  console.log('  reader     → http://localhost:3000/books/lde/\n');
}

main();
