/**
 * Block 1 of 1 — tools/compile-md.mjs
 * Description: Front matter normalize + MD compile + image mirror per book
 * Version: 1.b
 * Revised: 11Jul26
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { markdownToHtml } from './markdown-to-html.mjs';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const FALLBACKS = {
  lang: 'pt',
  author: 'Unknown',
  emoji: '📖',
  coverColors: ['#4a5568'],
  coverAngle: 135,
  license: 'unknown',
  copyright: ''
};

/**
 * @returns {{ meta: object, warnings: string[], fatal: string[] }}
 */
export function normalizeFrontMatter(data, folderSlug) {
  const warnings = [];
  const fatal = [];
  const meta = { ...(data || {}) };

  if (!meta.title || !String(meta.title).trim()) {
    fatal.push('missing title');
  }
  if (!meta.slug || !String(meta.slug).trim()) {
    fatal.push('missing slug');
  } else if (folderSlug && String(meta.slug) !== folderSlug) {
    fatal.push(`slug "${meta.slug}" !== folder "${folderSlug}"`);
  }

  if (!meta.lang || !['pt', 'en'].includes(String(meta.lang))) {
    warnings.push(`lang → ${FALLBACKS.lang}`);
    meta.lang = FALLBACKS.lang;
  }

  if (!meta.author || !String(meta.author).trim()) {
    warnings.push(`author → ${FALLBACKS.author}`);
    meta.author = FALLBACKS.author;
  }

  if (!meta.emoji || !String(meta.emoji).trim()) {
    warnings.push(`emoji → ${FALLBACKS.emoji}`);
    meta.emoji = FALLBACKS.emoji;
  }

  const prevIcon =
    meta.cover && meta.cover.icon != null ? String(meta.cover.icon).replace(/[^a-z0-9-]/gi, '') : '';
  let colors = meta.cover && Array.isArray(meta.cover.colors) ? meta.cover.colors : null;
  if (!colors || colors.length < 1 || colors.length > 2 || colors.some((c) => !HEX.test(String(c)))) {
    warnings.push(`cover.colors → ${JSON.stringify(FALLBACKS.coverColors)}`);
    meta.cover = { colors: [...FALLBACKS.coverColors], angle: FALLBACKS.coverAngle };
  } else {
    meta.cover = {
      colors: colors.map(String),
      angle:
        meta.cover && Number.isFinite(Number(meta.cover.angle))
          ? Number(meta.cover.angle)
          : FALLBACKS.coverAngle
    };
  }
  if (prevIcon) meta.cover.icon = prevIcon;

  const allowedLicenses = [
    'public-domain',
    'cc-by',
    'cc-by-sa',
    'all-rights-reserved',
    'unknown'
  ];
  if (!meta.license || !allowedLicenses.includes(String(meta.license))) {
    warnings.push(`license → ${FALLBACKS.license}`);
    meta.license = FALLBACKS.license;
  }

  if (meta.copyright == null) meta.copyright = FALLBACKS.copyright;

  if (meta.abstract == null || meta.abstract === '') {
    if (meta.description) meta.abstract = String(meta.description);
    else {
      warnings.push('abstract → ""');
      meta.abstract = '';
    }
  } else {
    meta.abstract = String(meta.abstract);
  }

  let categories = meta.categories;
  if (categories == null && Array.isArray(meta.tags)) categories = meta.tags;
  if (!Array.isArray(categories)) {
    warnings.push('categories → []');
    meta.categories = [];
  } else {
    meta.categories = categories.map((c) => String(c)).filter(Boolean);
  }

  /** Opt out of build-time dictionary linking (guides, legal, public pages). */
  const linkRaw = meta.link ?? meta.linker ?? meta.auto_link;
  if (linkRaw === false || linkRaw === 0 || linkRaw === 'false' || linkRaw === 'no' || linkRaw === 'off') {
    meta.link = false;
  } else if (linkRaw === true || linkRaw === 'true' || linkRaw === 'on' || linkRaw === 'yes') {
    meta.link = true;
  }

  return { meta, warnings, fatal };
}

export function compileBookFile(mdPath, { folderSlug } = {}) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const parsed = matter(raw);
  const { meta, warnings, fatal } = normalizeFrontMatter(parsed.data, folderSlug);
  if (fatal.length) {
    return { ok: false, fatal, warnings, meta, html: '', toc: [] };
  }

  const { html, toc, pages } = markdownToHtml(parsed.content || '', { lang: meta.lang });
  return { ok: true, fatal, warnings, meta, html, toc, pages: pages || [] };
}

export function mirrorBookImages(srcBookDir, destBookDir) {
  const from = path.join(srcBookDir, 'images');
  const to = path.join(destBookDir, 'images');
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name);
    if (!fs.statSync(s).isFile()) continue;
    fs.copyFileSync(s, path.join(to, name));
    n++;
  }
  return n;
}
