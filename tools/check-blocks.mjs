/**
 * Block 1 of 1 — tools/check-blocks.mjs
 * Description: PASS/FAIL scanner for sequential block headers in CSS/JS/HTML
 * Version: 1.a
 * Revised: 11Jul26
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const HEADER_RE =
  /(?:\/\*[\s\S]*?Block\s+(\d+)\s+of\s+(\d+)\s*[—\-–]\s*([^\n*]+)[\s\S]*?Description:\s*([^\n*]+)[\s\S]*?Version:\s*([^\n*]+)[\s\S]*?Revised:\s*([^\n*]+)[\s\S]*?\*\/)|(?:<!--[\s\S]*?Block\s+(\d+)\s+of\s+(\d+)\s*[—\-–]\s*([^\n]+)[\s\S]*?Description:\s*([^\n]+)[\s\S]*?Version:\s*([^\n]+)[\s\S]*?Revised:\s*([^\n]+)[\s\S]*?-->)|(?:\/\*\*[\s\S]*?Block\s+(\d+)\s+of\s+(\d+)\s*[—\-–]\s*([^\n*]+)[\s\S]*?Description:\s*([^\n*]+)[\s\S]*?Version:\s*([^\n*]+)[\s\S]*?Revised:\s*([^\n*]+)[\s\S]*?\*\/)/gi;

const VERSION_RE = /^[0-9]+\.[a-z]+$/;
/** DDMMMYY e.g. 11Jul26 (day 01–31, English month abbr, 2-digit year) */
const REVISED_RE =
  /^(0[1-9]|[12]\d|3[01])(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\d{2}$/;

const SCAN_EXTS = new Set(['.css', '.js', '.mjs', '.html']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'public',
  '.cache',
  '.venv',
  'venv',
  '__pycache__'
]);

function loadAllowlist() {
  const p = path.join(ROOT, 'tools', 'check-blocks.allowlist');
  if (!fs.existsSync(p)) return new Set();
  return new Set(
    fs
      .readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.replace(/#.*$/, '').trim())
      .filter(Boolean)
  );
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (SCAN_EXTS.has(path.extname(name))) out.push(full);
  }
  return out;
}

function parseHeaders(content) {
  const blocks = [];
  let m;
  const re = new RegExp(HEADER_RE.source, 'gi');
  while ((m = re.exec(content)) !== null) {
    const n = Number(m[1] || m[7] || m[13]);
    const total = Number(m[2] || m[8] || m[14]);
    const title = String(m[3] || m[9] || m[15] || '').trim();
    const description = String(m[4] || m[10] || m[16] || '').trim();
    const version = String(m[5] || m[11] || m[17] || '').trim();
    const revised = String(m[6] || m[12] || m[18] || '').trim();
    blocks.push({ n, total, title, description, version, revised });
  }
  return blocks;
}

function checkFile(rel, content) {
  const fails = [];
  const blocks = parseHeaders(content);

  if (blocks.length === 0) {
    fails.push('no block header found');
    return { status: 'FAIL', blocks: 0, fails };
  }

  const expectedM = blocks[0].total;
  for (const b of blocks) {
    if (b.total !== expectedM) {
      fails.push(`block ${b.n}: M=${b.total} inconsistent with first M=${expectedM}`);
    }
    if (!b.title) fails.push(`block ${b.n}: missing title`);
    if (!b.description) fails.push(`block ${b.n}: missing Description`);
    if (!VERSION_RE.test(b.version)) {
      fails.push(`block ${b.n}: Version "${b.version}" (want number.letter e.g. 1.a)`);
    }
    if (!REVISED_RE.test(b.revised)) {
      fails.push(`block ${b.n}: Revised "${b.revised}" (want DDMMMYY e.g. 11Jul26)`);
    }
  }

  const nums = blocks.map((b) => b.n).sort((a, b) => a - b);
  for (let i = 1; i <= expectedM; i++) {
    if (!nums.includes(i)) fails.push(`missing block ${i} of ${expectedM}`);
  }
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) fails.push(`duplicate block ${n}`);
    seen.add(n);
  }
  if (blocks.length !== expectedM) {
    fails.push(`found ${blocks.length} headers but M=${expectedM}`);
  }

  return {
    status: fails.length ? 'FAIL' : 'PASS',
    blocks: blocks.length,
    fails
  };
}

function main() {
  const allow = loadAllowlist();
  const roots = [path.join(ROOT, 'src'), path.join(ROOT, 'tools')];
  const files = [];
  for (const r of roots) walk(r, files);

  let pass = 0;
  let fail = 0;
  const lines = [];

  console.log('nano-ssg check-blocks\n');

  for (const full of files.sort()) {
    const rel = path.relative(ROOT, full).split(path.sep).join('/');
    if (allow.has(rel)) {
      lines.push(`  SKIP  ${rel}  (allowlist)`);
      continue;
    }
    const content = fs.readFileSync(full, 'utf8');
    const result = checkFile(rel, content);
    if (result.status === 'PASS') {
      pass++;
      lines.push(`  PASS  ${rel}  (${result.blocks}/${result.blocks} blocks)`);
    } else {
      fail++;
      lines.push(`  FAIL  ${rel}`);
      for (const f of result.fails) lines.push(`        · ${f}`);
    }
  }

  for (const l of lines) console.log(l);
  console.log(`\nSummary: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main();
