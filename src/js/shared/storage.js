/**
 * Block 1 of 1 — shared/storage.js
 * Description: Load/save librus-settings with safe defaults
 * Version: 1.e
 * Revised: 21Jul26
 */

import { STORAGE_KEY } from './constants.js';

/**
 * Book text size steps (slider index order: small → large).
 * Semantic: XS S M L XL 2XL 3XL
 */
export const FONT_SCALES = [0.75, 0.875, 1, 1.125, 1.25, 1.375, 1.5];
export const FONT_SCALE_LABELS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

/** Line-height steps (slider): tight → airy */
export const LINE_HEIGHTS = [1.45, 1.6, 1.75, 1.9, 2.1];
export const LINE_HEIGHT_LABELS = ['Tight', 'Snug', 'Normal', 'Relaxed', 'Airy'];

/** Reading column width: compact · normal · wide */
export const MEASURES = ['sm', 'md', 'lg'];
export const MEASURE_LABELS = ['Narrow', 'Normal', 'Wide'];
export const MEASURE_REM = { sm: 32, md: 42, lg: 56 };

/**
 * Link density steps (slider):
 * lo = zero research links · med = some · hi = all
 */
export const DENSITY_ORDER = ['lo', 'med', 'hi'];
export const DENSITY_LABELS = ['None', 'Some', 'All'];

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
    lineHeight: 1.6,
    textJustify: false,
    measure: 'md',
    linkDensity: 'med',
    linkProviders: { w: true, d: true },
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
 * @param {string} name
 * @param {string} [assetBase]
 */
export function lucideIconUrl(name, assetBase = '') {
  const n = normalizeLucideIcon(name);
  const local = new Set([
    'align-justify',
    'align-left',
    'arrow-down-a-z',
    'back',
    'book',
    'book-a',
    'book-marked',
    'book-open',
    'circle-stop',
    'close',
    'device',
    'down',
    'droplet',
    'flame',
    'globe',
    'holmes',
    'home',
    'lightbulb',
    'link',
    'moon',
    'move-horizontal',
    'pen-tool',
    'play',
    'reload',
    'settings',
    'sliders-horizontal',
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
    const st = data.searchTemplates || {};
    const cp = data.customProvider || {};
    const lh = Number(data.lineHeight);
    return {
      version: 1,
      lang: 'en',
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
      fontScale: FONT_SCALES.includes(data.fontScale) ? data.fontScale : base.fontScale,
      lineHeight: LINE_HEIGHTS.includes(lh) ? lh : base.lineHeight,
      textJustify: data.textJustify === true,
      measure: MEASURES.includes(data.measure) ? data.measure : base.measure,
      linkDensity: ['lo', 'med', 'hi'].includes(data.linkDensity) ? data.linkDensity : base.linkDensity,
      linkProviders: Object.assign({}, base.linkProviders, data.linkProviders || {}),
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
  const base = defaultSettings();
  const merged = Object.assign({}, base, settings, { version: 1 });
  merged.lang = 'en';
  const lh = Number(merged.lineHeight);
  merged.lineHeight = LINE_HEIGHTS.includes(lh) ? lh : base.lineHeight;
  merged.fontScale = FONT_SCALES.includes(merged.fontScale) ? merged.fontScale : base.fontScale;
  merged.textJustify = merged.textJustify === true;
  merged.measure = MEASURES.includes(merged.measure) ? merged.measure : base.measure;
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
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: merged.version,
        lang: merged.lang,
        theme: merged.theme,
        fontScale: merged.fontScale,
        lineHeight: merged.lineHeight,
        textJustify: merged.textJustify,
        measure: merged.measure,
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
