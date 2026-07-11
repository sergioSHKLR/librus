/**
 * Block 1 of 1 — shared/paths.js
 * Description: Asset base + library/book URLs relative to data-app-base
 * Version: 1.c
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
 * Library home href relative to current page (via data-app-base).
 * Avoid root-absolute `/` — that 404s when public/ is not the host root
 * (e.g. Live Preview under …/public/).
 */
export function libraryHomeUrl() {
  try {
    const base = assetBase();
    if (!base || base === './' || base === '') return './';
    const resolved = new URL(base.endsWith('/') ? base : base + '/', window.location.href);
    /* Prefer path ending with / so directory index is used */
    let href = resolved.pathname;
    if (!href.endsWith('/')) href += '/';
    return href + (resolved.search || '');
  } catch {
    return assetBase() || './';
  }
}

/**
 * Book reader URL from the library home (relative — never host-root absolute).
 */
export function bookReaderUrl(slug) {
  return 'books/' + encodeURIComponent(slug) + '/';
}
