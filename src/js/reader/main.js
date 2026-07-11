/**
 * Block 1 of 1 — reader/main.js
 * Description: Boot reader — layout, type controls, Links; no settings/theme chrome
 * Version: 1.c
 * Revised: 260711 12:00
 */

import { loadSettings, saveSettings, FONT_SCALES, LINE_HEIGHTS } from '../shared/storage.js';
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
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl } from '../shared/paths.js';
import { BRAND } from '../shared/constants.js';

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

function cycleLineHeight(settings) {
  let idx = LINE_HEIGHTS.indexOf(settings.lineHeight);
  if (idx < 0) idx = 1;
  idx = (idx + 1) % LINE_HEIGHTS.length;
  settings.lineHeight = LINE_HEIGHTS[idx];
  applyTypography(settings);
  const chip = document.getElementById('line-height-chip');
  if (chip) chip.textContent = String(settings.lineHeight);
  return saveSettings(settings);
}

function syncLineChip(settings) {
  const chip = document.getElementById('line-height-chip');
  if (chip) chip.textContent = String(settings.lineHeight ?? 1.6);
}

async function boot() {
  let settings = applyQueryToSettings();
  applyTypography(settings);
  applyTheme(settings.theme);
  setHypoInvert(settings.theme);
  syncLineChip(settings);

  const lib = document.getElementById('btn-library');
  if (lib) lib.setAttribute('href', libraryHomeUrl());

  const strings = await loadLocale(settings.lang);
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);

  const title = document.body.dataset.bookTitle || t(strings, 'brand', BRAND);
  document.title = title + ' · ' + t(strings, 'brand', BRAND);
  const label = document.getElementById('book-title-label');
  if (label) label.textContent = title;

  document.getElementById('btn-font-cycle')?.addEventListener('click', () => {
    settings = cycleFont(settings);
  });
  document.getElementById('btn-line-cycle')?.addEventListener('click', () => {
    settings = cycleLineHeight(settings);
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
  console.info(BRAND + ' reader', computeIsWide() ? 'wide' : 'narrow');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
