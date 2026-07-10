/**
 * Block 1 of 1 — library/site.js
 * Description: Theme toggle for About / Help / Legal pages
 * Version: 1.a
 * Revised: 260710 19:30
 */

import { loadSettings, saveSettings } from '../shared/storage.js';
import { applyTheme, nextTheme } from '../shared/theme.js';

function boot() {
  let settings = loadSettings();
  const base = document.body.dataset.appBase || '../';
  applyTheme(settings.theme, {
    iconEl: document.getElementById('theme-toggle-icon'),
    btnEl: document.getElementById('btn-theme-toggle'),
    assetBase: base
  });
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    settings.theme = nextTheme(settings.theme);
    settings = saveSettings(settings);
    applyTheme(settings.theme, {
      iconEl: document.getElementById('theme-toggle-icon'),
      btnEl: document.getElementById('btn-theme-toggle'),
      assetBase: base
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
