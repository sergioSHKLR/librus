/**
 * Block 1 of 1 — shared/storage.js
 * Description: Load/save librus-settings with safe defaults
 * Version: 1.d
 * Revised: 16Jul26
 */

import { STORAGE_KEY } from './constants.js';

/**
 * Text size cycle order:
 * normal → 4 larger → 2 smaller → loop
 */
export const FONT_SCALES = [1, 1.125, 1.25, 1.375, 1.5, 0.875, 0.75];

/** Built-in search templates (override in settings with {query}). */
export function defaultSearchTemplates(lang) {
  const code = lang === 'pt' ? 'pt' : 'en';
  return {
    wiki: 'https://' + code + '.wikipedia.org/wiki/{query}',
    dictionary: 'https://' + code + '.wiktionary.org/wiki/{query}'
  };
}

/**
 * Normalize a user search template. Empty → use built-in.
 * Must be http(s) and include {query} when set.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeSearchTemplate(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) return '';
  if (!/\{query\}/i.test(s)) return '';
  return s;
}

/** Product locale: English only (PT “Soon”). Providers: wiki + dict + optional custom. */
export function defaultSettings() {
  return {
    version: 1,
    lang: 'en',
    theme: 'system',
    fontScale: 1,
    linkDensity: 'med',
    linkProviders: { w: true, d: true },
    /* Empty string = built-in default */
    searchTemplates: {
      wiki: '',
      dictionary: ''
    },
    customProvider: {
      label: 'Custom',
      searchUrl: '',
      icon: 'link'
    }
  };
}

/** Lucide-style icon name: kebab-case only */
export function normalizeLucideIcon(raw) {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  if (!s || !/^[a-z][a-z0-9-]*$/.test(s)) return 'link';
  return s.slice(0, 48);
}

/**
 * URL for a Lucide icon: local ship first, else lucide-static CDN.
 * @param {string} name
 * @param {string} [assetBase]
 */
export function lucideIconUrl(name, assetBase = '') {
  const n = normalizeLucideIcon(name);
  const local = new Set([
    'back',
    'book',
    'book-a',
    'book-marked',
    'book-open',
    'circle-stop',
    'close',
    'device',
    'down',
    'flame',
    'globe',
    'holmes',
    'home',
    'lightbulb',
    'link',
    'moon',
    'pen-tool',
    'reload',
    'settings',
    'sprout',
    'square',
    'sun',
    'text-size',
    'toc',
    'up',
    'wind'
  ]);
  if (local.has(n)) return assetBase + 'icons/' + n + '.svg';
  return 'https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/' + n + '.svg';
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const data = JSON.parse(raw);
    const base = defaultSettings();
    const incoming = data.linkProviders || {};
    const st = data.searchTemplates || {};
    const cp = data.customProvider || {};
    return {
      version: 1,
      lang: 'en',
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
      fontScale: FONT_SCALES.includes(data.fontScale) ? data.fontScale : base.fontScale,
      linkDensity: ['lo', 'med', 'hi'].includes(data.linkDensity) ? data.linkDensity : base.linkDensity,
      linkProviders: {
        w: incoming.w !== false,
        d: incoming.d !== false
      },
      searchTemplates: {
        wiki: normalizeSearchTemplate(st.wiki),
        dictionary: normalizeSearchTemplate(st.dictionary)
      },
      customProvider: {
        label: String(cp.label || 'Custom').trim().slice(0, 40) || 'Custom',
        searchUrl: normalizeSearchTemplate(cp.searchUrl),
        icon: normalizeLucideIcon(cp.icon || 'link')
      }
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  const merged = Object.assign(defaultSettings(), settings, { version: 1 });
  merged.lang = 'en';
  const p = merged.linkProviders || {};
  merged.linkProviders = { w: p.w !== false, d: p.d !== false };
  const st = merged.searchTemplates || {};
  merged.searchTemplates = {
    wiki: normalizeSearchTemplate(st.wiki),
    dictionary: normalizeSearchTemplate(st.dictionary)
  };
  const cp = merged.customProvider || {};
  merged.customProvider = {
    label: String(cp.label || 'Custom').trim().slice(0, 40) || 'Custom',
    searchUrl: normalizeSearchTemplate(cp.searchUrl),
    icon: normalizeLucideIcon(cp.icon || 'link')
  };
  delete merged.lineHeight;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: merged.version,
        lang: merged.lang,
        theme: merged.theme,
        fontScale: merged.fontScale,
        linkDensity: merged.linkDensity,
        linkProviders: merged.linkProviders,
        searchTemplates: merged.searchTemplates,
        customProvider: merged.customProvider
      })
    );
  } catch {
    /* private mode / quota */
  }
  return merged;
}

/**
 * Resolved search URL template for a provider key.
 * @param {ReturnType<typeof loadSettings>} settings
 * @param {string} provider wiki | dictionary | custom
 */
export function resolveSearchTemplate(settings, provider) {
  const lang = settings?.lang === 'pt' ? 'pt' : 'en';
  const defaults = defaultSearchTemplates(lang);
  if (provider === 'custom') {
    return normalizeSearchTemplate(settings?.customProvider?.searchUrl);
  }
  const override = settings?.searchTemplates?.[provider];
  if (override) return override;
  return defaults[provider] || '';
}

/**
 * Home URL derived from a search template (origin + first path segment if any).
 * @param {string} template
 */
export function homeFromTemplate(template) {
  const s = String(template || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s.replace(/\{query\}/gi, ''));
    return u.origin + '/';
  } catch {
    return '';
  }
}
