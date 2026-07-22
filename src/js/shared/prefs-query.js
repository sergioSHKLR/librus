/**
 * Block 1 of 1 — shared/prefs-query.js
 * Description: URL query → settings (write-through localStorage)
 * Version: 1.d
 * Revised: 21Jul26
 */

import {
  loadSettings,
  saveSettings,
  FONT_SCALES,
  LINE_HEIGHTS,
  MEASURES
} from './storage.js';

/**
 * Read known query params, merge into settings, save when any applied.
 * Supported: lang, theme, density, font, lh, justify, measure, w, d (0|1), prov=w,d
 * (Luz / l is not a LIBRUS provider.)
 * @returns {ReturnType<typeof loadSettings>}
 */
export function applyQueryToSettings() {
  let settings = loadSettings();
  let changed = false;
  const params = new URLSearchParams(location.search || '');

  if (params.has('lang')) {
    const lang = params.get('lang');
    /* Product: English only for now */
    if (lang === 'en' || lang === 'pt') {
      settings.lang = lang === 'pt' ? 'en' : 'en';
      changed = true;
    }
  }

  if (params.has('theme')) {
    const theme = params.get('theme');
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      settings.theme = theme;
      changed = true;
    }
  }

  if (params.has('density')) {
    const d = params.get('density');
    if (d === 'lo' || d === 'med' || d === 'hi' || d === 'none' || d === 'some' || d === 'all') {
      const map = { none: 'lo', some: 'med', all: 'hi' };
      settings.linkDensity = map[d] || d;
      changed = true;
    }
  }

  if (params.has('font')) {
    const font = Number(params.get('font'));
    if (FONT_SCALES.includes(font)) {
      settings.fontScale = font;
      changed = true;
    }
  }

  if (params.has('lh')) {
    const lh = Number(params.get('lh'));
    if (LINE_HEIGHTS.includes(lh)) {
      settings.lineHeight = lh;
      changed = true;
    }
  }

  if (params.has('justify')) {
    const j = params.get('justify');
    settings.textJustify = j === '1' || j === 'true' || j === 'on';
    changed = true;
  }

  if (params.has('measure')) {
    const m = params.get('measure');
    if (MEASURES.includes(m)) {
      settings.measure = m;
      changed = true;
    }
  }

  if (!settings.linkProviders) settings.linkProviders = { w: true, d: true };

  for (const code of ['w', 'd']) {
    if (params.has(code)) {
      const v = params.get(code);
      settings.linkProviders[code] = v === '1' || v === 'true' || v === 'on';
      changed = true;
    }
  }

  if (params.has('prov')) {
    const list = String(params.get('prov') || '')
      .split(/[,+\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (list.length) {
      settings.linkProviders = {
        w: list.includes('w') || list.includes('wiki'),
        d: list.includes('d') || list.includes('dict') || list.includes('dictionary')
      };
      changed = true;
    }
  }

  if (changed) settings = saveSettings(settings);
  return settings;
}
