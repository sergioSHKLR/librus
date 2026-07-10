/**
 * Block 1 of 1 — reader/main.js
 * Description: Boot reader — layout, theme, book, context, Hypothesis invert
 * Version: 1.a
 * Revised: 260710 17:00
 */

import { loadSettings, saveSettings, FONT_SCALES } from '../shared/storage.js';
import { applyTheme, applyTypography, nextTheme, isEffectivelyDark } from '../shared/theme.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { runIntegrityDebug } from '../shared/integrity.js';
import { wireLayout, computeIsWide } from './layout.js';
import { loadBookBody, applyDeepLink } from './book.js';
import { wireContext } from './context.js';
import { wireSearch } from './search.js';
import { wireToc } from './toc.js';
import { assetBase } from '../shared/paths.js';

function setHypoInvert(theme) {
  const host = document.getElementById('hypothesis-container');
  if (!host) return;
  host.classList.toggle('hypothesis-theme-invert', isEffectivelyDark(theme));
}

function cycleFont(settings) {
  let idx = FONT_SCALES.indexOf(settings.fontScale);
  if (idx < 0) idx = 1;
  idx = (idx + 1) % FONT_SCALES.length;
  settings.fontScale = FONT_SCALES[idx];
  applyTypography(settings);
  return saveSettings(settings);
}

async function boot() {
  let settings = loadSettings();
  applyTypography(settings);

  const strings = await loadLocale(settings.lang);
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);

  const title = document.body.dataset.bookTitle || t(strings, 'brand', 'L.I.B.R.U.S');
  document.title = title + ' · L.I.B.R.U.S';
  const label = document.getElementById('book-title-label');
  if (label) label.textContent = title;

  const base = assetBase();
  const themeLabels = {
    light: t(strings, 'theme.tipLight', 'Theme: light'),
    dark: t(strings, 'theme.tipDark', 'Theme: dark'),
    system: t(strings, 'theme.tipSystem', 'Theme: system')
  };

  applyTheme(settings.theme, {
    iconEl: document.getElementById('theme-toggle-icon'),
    btnEl: document.getElementById('btn-theme-toggle'),
    assetBase: base,
    labels: themeLabels
  });
  setHypoInvert(settings.theme);

  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    settings.theme = nextTheme(settings.theme);
    settings = saveSettings(settings);
    applyTheme(settings.theme, {
      iconEl: document.getElementById('theme-toggle-icon'),
      btnEl: document.getElementById('btn-theme-toggle'),
      assetBase: base,
      labels: themeLabels
    });
    setHypoInvert(settings.theme);
  });

  document.getElementById('btn-font-cycle')?.addEventListener('click', () => {
    settings = cycleFont(settings);
  });

  wireLayout();
  wireSearch();
  wireToc();
  wireContext();

  await loadBookBody();
  applyDeepLink();
  window.addEventListener('hashchange', applyDeepLink);

  runIntegrityDebug();
  console.info('L.I.B.R.U.S reader', computeIsWide() ? 'wide' : 'narrow');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
