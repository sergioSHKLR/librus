/**
 * Block 1 of 1 — tools/serve-public.mjs
 * Description: Free product port, then serve public/ (fixed bookmarks)
 * Version: 1.a
 * Revised: 20Jul26
 *
 * Fixed ports (bookmark these):
 *   LIBRUS   → http://localhost:3000
 *   DOUTRINA → http://localhost:3001
 *
 * Usage (from product repo root):
 *   npm start
 *   node tools/serve-public.mjs
 *   node tools/serve-public.mjs --port 3001
 *   SERVE_PORT=3001 node tools/serve-public.mjs
 *
 * Always serves <repo>/public via absolute path (not process.cwd), so a
 * wrong shell directory cannot bind another tree’s assets to this port.
 * Any process already listening on the product port is stopped first.
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

/** Fixed product ports — keep identical in both product repos */
const PRODUCT_PORTS = {
  doutrina: 3001,
  librus: 3000
};

const DEFAULT_PORT = PRODUCT_PORTS.doutrina;

function readPackageName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return String(pkg.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
  } catch {
    return '';
  }
}

function resolvePort(argv) {
  const env = process.env.SERVE_PORT || process.env.PORT;
  if (env && /^\d+$/.test(String(env).trim())) return parseInt(String(env).trim(), 10);

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port' || argv[i] === '-p') {
      const n = parseInt(argv[i + 1], 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    const m = /^--port=(\d+)$/.exec(argv[i]);
    if (m) return parseInt(m[1], 10);
  }

  const name = readPackageName();
  if (name.includes('librus')) return PRODUCT_PORTS.librus;
  if (name.includes('doutrina')) return PRODUCT_PORTS.doutrina;
  return DEFAULT_PORT;
}

/**
 * PIDs listening on TCP port (Linux). Empty if none / tools unavailable.
 * @param {number} port
 * @returns {number[]}
 */
function pidsListeningOnPort(port) {
  const pids = new Set();

  try {
    const out = execSync(`ss -H -tlnp "sport = :${port}" 2>/dev/null || true`, {
      encoding: 'utf8',
      shell: '/bin/bash'
    });
    for (const m of out.matchAll(/pid=(\d+)/g)) {
      const pid = parseInt(m[1], 10);
      if (Number.isFinite(pid) && pid > 0) pids.add(pid);
    }
  } catch {
    /* ignore */
  }

  if (pids.size === 0) {
    try {
      const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null || true`, {
        encoding: 'utf8',
        shell: '/bin/bash'
      });
      for (const line of out.split(/\s+/)) {
        const pid = parseInt(line, 10);
        if (Number.isFinite(pid) && pid > 0) pids.add(pid);
      }
    } catch {
      /* ignore */
    }
  }

  if (pids.size === 0) {
    try {
      const out = execSync(`fuser ${port}/tcp 2>/dev/null || true`, {
        encoding: 'utf8',
        shell: '/bin/bash'
      });
      for (const m of out.matchAll(/\d+/g)) {
        const pid = parseInt(m[0], 10);
        if (Number.isFinite(pid) && pid > 0) pids.add(pid);
      }
    } catch {
      /* ignore */
    }
  }

  return [...pids];
}

function sleepMs(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      /* busy wait fallback */
    }
  }
}

/**
 * Kill every process bound to the product port (except this process).
 * @param {number} port
 */
function freePort(port) {
  const self = process.pid;
  let pids = pidsListeningOnPort(port).filter((p) => p !== self);

  if (pids.length === 0) {
    console.log(`→ port ${port}: free`);
    return;
  }

  console.log(`→ port ${port}: stopping pid(s) ${pids.join(', ')}`);
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }

  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    sleepMs(150);
    pids = pidsListeningOnPort(port).filter((p) => p !== self);
    if (pids.length === 0) break;
  }

  if (pids.length) {
    console.log(`→ port ${port}: SIGKILL remaining ${pids.join(', ')}`);
    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        /* ignore */
      }
    }
    sleepMs(200);
  }

  const left = pidsListeningOnPort(port).filter((p) => p !== self);
  if (left.length) {
    console.error(`✗ port ${port} still held by pid(s) ${left.join(', ')}`);
    process.exit(1);
  }
  console.log(`→ port ${port}: free`);
}

function start() {
  const port = resolvePort(process.argv.slice(2));
  const name = readPackageName() || 'app';

  if (!fs.existsSync(PUBLIC) || !fs.statSync(PUBLIC).isDirectory()) {
    console.error(`✗ missing ${path.relative(ROOT, PUBLIC)}/ — run npm run build first`);
    process.exit(1);
  }

  console.log(`\n${name} · serve public/`);
  console.log(`  root  ${ROOT}`);
  console.log(`  dir   ${path.relative(ROOT, PUBLIC) || 'public'}/`);
  console.log(`  url   http://localhost:${port}/`);
  console.log(`  note  any prior listener on :${port} is stopped first\n`);

  freePort(port);

  /* Absolute PUBLIC path — never rely on cwd for which tree is served */
  const child = spawn(
    'npx',
    ['--yes', 'serve', PUBLIC, '-l', String(port), '-n'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
      shell: false
    }
  );

  const shutdown = (sig) => {
    try {
      child.kill(sig);
    } catch {
      /* ignore */
    }
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  child.on('exit', (code, signal) => {
    if (signal) process.exit(1);
    process.exit(code ?? 0);
  });
  child.on('error', (err) => {
    console.error('✗ failed to start serve:', err.message);
    process.exit(1);
  });
}

start();
