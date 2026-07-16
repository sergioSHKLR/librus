/**
 * Block 1 of 1 — shared/prefs-query.js
 * Description: URL query → settings (write-through localStorage)
 * Version: 1.c
 * Revised: 16Jul26
 */

import { loadSettings, saveSettings, FONT_SCALES } from './storage.js';

/**
 * Read known query params, merge into settings, save when any applied.
 * Supported: lang, theme, density, font, w, d (0|1), prov=w,d
 * (Luz / l is not a LIBRUS provider.)
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

  if (!settings.linkProviders) settings.linkProviders = { w: true, d: true };

  for (const code of ['w', 'd']) {
    if (!params.has(code)) continue;
    const v = params.get(code);
    settings.linkProviders[code] = v === '1' || v === 'true' || v === 'on';
    changed = true;
  }

  if (params.has('prov')) {
    const raw = (params.get('prov') || '').toLowerCase();
    const set = new Set(raw.split(/[,+\s]+/).filter(Boolean));
    settings.linkProviders = {
      w: set.has('w'),
      d: set.has('d')
    };
    changed = true;
  }

  if (changed) settings = saveSettings(settings);
  return settings;
}
