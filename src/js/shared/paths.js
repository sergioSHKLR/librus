/**
 * Block 1 of 1 — shared/paths.js
 * Description: Asset base + robust library-home URL (avoid relative 404s)
 * Version: 1.b
 * Revised: 11Jul26
 */

export function assetBase() {
  return document.body?.dataset?.appBase || '../';
}

export function assetUrl(rel) {
  const base = assetBase();
  return base + String(rel || '').replace(/^\//, '');
}

/**
 * Absolute path to library home for the current deployment root.
 * Prefer root `/` when appBase points at site root; else resolve relative base.
 * Fixes 404s when relative `../` is resolved against the wrong directory or
 * when the static server is not serving `public/` as document root.
 */
export function libraryHomeUrl() {
  try {
    const base = assetBase();
    if (!base || base === '/' || base === './') return '/';
    const resolved = new URL(base, window.location.href);
    let p = resolved.pathname;
    if (!p.endsWith('/')) p += '/';
    /* Collapse to site root when base is ../../ from /books/slug/ */
    if (p === '//' || p === '') return '/';
    return p;
  } catch {
    return '/';
  }
}

/** Root-absolute book reader URL */
export function bookReaderUrl(slug) {
  return '/books/' + encodeURIComponent(slug) + '/';
}
