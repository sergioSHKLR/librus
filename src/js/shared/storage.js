/**
 * Block 1 of 1 — shared/storage.js
 * Description: Load/save nano-ssg-settings with safe defaults
 * Version: 1.a
 * Revised: 260710 16:30
 */

import { STORAGE_KEY } from './constants.js';

export const FONT_SCALES = [0.875, 1, 1.125, 1.25];
export const LINE_HEIGHTS = [1.45, 1.6, 1.75];

export function defaultSettings() {
  return {
    version: 1,
    lang: 'en',
    theme: 'system',
    fontScale: 1,
    lineHeight: 1.6,
    linkDensity: 'med',
    linkProviders: { l: true, w: true, d: true }
  };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const data = JSON.parse(raw);
    const base = defaultSettings();
    return {
      version: 1,
      lang: data.lang === 'pt' ? 'pt' : 'en',
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
      fontScale: FONT_SCALES.includes(data.fontScale) ? data.fontScale : base.fontScale,
      lineHeight: LINE_HEIGHTS.includes(data.lineHeight) ? data.lineHeight : base.lineHeight,
      linkDensity: ['lo', 'med', 'hi'].includes(data.linkDensity) ? data.linkDensity : base.linkDensity,
      linkProviders: Object.assign({}, base.linkProviders, data.linkProviders || {})
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  const merged = Object.assign(defaultSettings(), settings, { version: 1 });
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: merged.version,
        lang: merged.lang,
        theme: merged.theme,
        fontScale: merged.fontScale,
        lineHeight: merged.lineHeight,
        linkDensity: merged.linkDensity,
        linkProviders: merged.linkProviders
      })
    );
  } catch {
    /* private mode / quota */
  }
  return merged;
}
