/**
 * Block 1 of 1 — shared/paths.js
 * Description: Asset base path from data-app-base on body
 * Version: 1.a
 * Revised: 260710 17:00
 */

export function assetBase() {
  return document.body?.dataset?.appBase || '../';
}

export function assetUrl(rel) {
  const base = assetBase();
  return base + String(rel || '').replace(/^\//, '');
}
