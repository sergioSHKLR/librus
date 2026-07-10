/**
 * Block 1 of 1 — i18n/i18n.js
 * Description: Load EN/PT UI strings and apply data-i18n attributes
 * Version: 1.a
 * Revised: 260710 16:00
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

export function applyI18n(root, strings) {
  const el = root || document;
  el.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (key && strings[key] != null) node.textContent = strings[key];
  });
}

export function t(strings, key, fallback) {
  return (strings && strings[key]) || fallback || key;
}
