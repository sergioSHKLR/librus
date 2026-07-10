/**
 * Block 1 of 1 — reader/main.js
 * Description: Boot reader — layout, theme apply, book, context (no settings/theme chrome)
 * Version: 1.b
 * Revised: 260710 21:00
 */

import { loadSettings, saveSettings, FONT_SCALES } from '../shared/storage.js';
import { applyTheme, applyTypography, isEffectivelyDark } from '../shared/theme.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { runIntegrityDebug } from '../shared/integrity.js';
import { wireLayout, computeIsWide } from './layout.js';
import { loadBookBody, applyDeepLink } from './book.js';
import { wireContext } from './context.js';
import { wireSearch } from './search.js';
import { wireToc } from './toc.js';
import { wireLinkFilters } from './links.js';
import { wirePwaUpdates } from '../settings/update.js';

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
  applyTheme(settings.theme);
  setHypoInvert(settings.theme);

  const strings = await loadLocale(settings.lang);
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);

  const title = document.body.dataset.bookTitle || t(strings, 'brand', 'L.I.B.R.U.S');
  document.title = title + ' · L.I.B.R.U.S';
  const label = document.getElementById('book-title-label');
  if (label) label.textContent = title;

  document.getElementById('btn-font-cycle')?.addEventListener('click', () => {
    settings = cycleFont(settings);
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    settings = loadSettings();
    if (settings.theme === 'system') {
      applyTheme('system');
      setHypoInvert('system');
    }
  });

  wireLayout();
  wireSearch();
  wireToc();
  wireContext();

  await loadBookBody();
  wireLinkFilters();
  applyDeepLink();
  window.addEventListener('hashchange', applyDeepLink);

  wirePwaUpdates();

  runIntegrityDebug();
  console.info('L.I.B.R.U.S reader', computeIsWide() ? 'wide' : 'narrow');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
