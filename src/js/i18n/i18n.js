/**
 * Block 1 of 1 — i18n/i18n.js
 * Description: Load EN/PT UI strings; apply text, title, aria-label, placeholder
 * Version: 1.c
 * Revised: 12Jul26
 */

const cache = new Map();

export async function loadLocale(lang) {
  const code = lang === 'pt' ? 'pt' : 'en';
  if (cache.has(code)) return cache.get(code);
  const url = new URL(`../../locales/${code}.json`, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('locale ' + code);
  const data = await res.json();
  cache.set(code, data);
  return data;
}

/**
 * Apply locale strings to a subtree.
 * - data-i18n → textContent
 * - data-i18n-html → innerHTML (trusted locale strings only)
 * - data-i18n-title → title
 * - data-i18n-aria → aria-label
 * - data-i18n-placeholder → placeholder
 * - data-i18n-label → title + aria-label
 */
export function applyI18n(root, strings) {
  const el = root || document;
  if (!strings) return;

  el.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (key && strings[key] != null) node.textContent = strings[key];
  });

  el.querySelectorAll('[data-i18n-html]').forEach((node) => {
    const key = node.getAttribute('data-i18n-html');
    if (key && strings[key] != null) node.innerHTML = strings[key];
  });

  el.querySelectorAll('[data-i18n-title]').forEach((node) => {
    const key = node.getAttribute('data-i18n-title');
    if (key && strings[key] != null) node.setAttribute('title', strings[key]);
  });

  el.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    const key = node.getAttribute('data-i18n-aria');
    if (key && strings[key] != null) node.setAttribute('aria-label', strings[key]);
  });

  el.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.getAttribute('data-i18n-placeholder');
    if (key && strings[key] != null) node.setAttribute('placeholder', strings[key]);
  });

  el.querySelectorAll('[data-i18n-label]').forEach((node) => {
    const key = node.getAttribute('data-i18n-label');
    if (!key || strings[key] == null) return;
    const val = strings[key];
    node.setAttribute('title', val);
    node.setAttribute('aria-label', val);
  });
}

export function t(strings, key, fallback) {
  return (strings && strings[key]) || fallback || key;
}
