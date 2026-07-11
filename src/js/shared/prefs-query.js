/**
 * Block 1 of 1 — shared/prefs-query.js
 * Description: URL query → settings (write-through localStorage)
 * Version: 1.a
 * Revised: 260711 12:00
 */

import { loadSettings, saveSettings, FONT_SCALES, LINE_HEIGHTS } from './storage.js';

/**
 * Read known query params, merge into settings, save when any applied.
 * Supported: lang, theme, density, font, line (lineHeight), l, w, d (0|1), prov=l,w,d
 * @returns {ReturnType<typeof loadSettings>}
 */
export function applyQueryToSettings() {
  let settings = loadSettings();
  const params = new URLSearchParams(window.location.search || '');
  if (![...params.keys()].length) return settings;

  let changed = false;

  if (params.has('lang')) {
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'pt') {
      settings.lang = lang;
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
    if (d === 'lo' || d === 'med' || d === 'hi') {
      settings.linkDensity = d;
      changed = true;
    }
  }

  if (params.has('font')) {
    const fs = Number(params.get('font'));
    if (FONT_SCALES.includes(fs)) {
      settings.fontScale = fs;
      changed = true;
    }
  }

  if (params.has('line')) {
    const lh = Number(params.get('line'));
    if (LINE_HEIGHTS.includes(lh)) {
      settings.lineHeight = lh;
      changed = true;
    }
  }

  if (!settings.linkProviders) settings.linkProviders = { l: true, w: true, d: true };

  for (const code of ['l', 'w', 'd']) {
    if (!params.has(code)) continue;
    const v = params.get(code);
    settings.linkProviders[code] = v === '1' || v === 'true' || v === 'on';
    changed = true;
  }

  if (params.has('prov')) {
    const raw = (params.get('prov') || '').toLowerCase();
    const set = new Set(raw.split(/[,+\s]+/).filter(Boolean));
    settings.linkProviders = {
      l: set.has('l'),
      w: set.has('w'),
      d: set.has('d')
    };
    changed = true;
  }

  if (changed) settings = saveSettings(settings);
  return settings;
}
