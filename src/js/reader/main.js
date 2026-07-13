/**
 * Block 1 of 1 — reader/main.js
 * Description: Boot reader — layout, font size, Links; two-row toolbar
 * Version: 1.e
 * Revised: 12Jul26
 */

import { loadSettings, saveSettings, FONT_SCALES } from '../shared/storage.js';
import { applyTheme, applyTypography, isEffectivelyDark } from '../shared/theme.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { runIntegrityDebug } from '../shared/integrity.js';
import { wireLayout, computeIsWide } from './layout.js';
import { loadBookBody, applyDeepLink } from './book.js';
import {
  wireContext,
  setSelectionPlaceholder,
  setContextNavLabels,
  setBlankLang
} from './context.js';
import { wireSearch } from './search.js';
import { wireToc } from './toc.js';
import { wireBreadcrumb, setBreadcrumbPartLabel } from './breadcrumb.js';
import { wireLinkFilters, setLinksStrings } from './links.js';
import { wirePwaUpdates } from '../settings/update.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl } from '../shared/paths.js';
import { BRAND } from '../shared/constants.js';
import { wireStudyNote } from '../shared/study-note.js';

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
  let settings = applyQueryToSettings();
  applyTypography(settings);
  applyTheme(settings.theme);
  setHypoInvert(settings.theme);

  const lib = document.getElementById('btn-library');
  if (lib) lib.setAttribute('href', libraryHomeUrl());

  const strings = await loadLocale(settings.lang);
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);
  setLinksStrings(strings);

  const title = document.body.dataset.bookTitle || t(strings, 'brand', BRAND);
  document.title = title + ' · ' + t(strings, 'brand', BRAND);

  const selectedLabel = t(strings, 'reader.selectedTerm', 'selected_term');
  setSelectionPlaceholder(selectedLabel);
  setBreadcrumbPartLabel(t(strings, 'reader.part', settings.lang === 'pt' ? 'Parte' : 'Part'));
  setContextNavLabels({
    reload: t(strings, 'reader.reload', 'Reload'),
    stop: t(strings, 'reader.stop', 'Stop')
  });
  setBlankLang(settings.lang === 'pt' ? 'pt' : 'en');

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const searchPh = t(strings, 'reader.search', 'Search…');
    searchInput.placeholder = searchPh;
    searchInput.setAttribute('aria-label', searchPh);
  }

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
  wireContext();

  await loadBookBody();
  wireBreadcrumb();
  wireToc();
  wireLinkFilters();
  applyDeepLink();
  window.addEventListener('hashchange', applyDeepLink);

  wirePwaUpdates();
  wireStudyNote({
    dismissLabel: t(strings, 'studyNote.dismiss', settings.lang === 'pt' ? 'Entendi' : 'OK')
  });

  runIntegrityDebug();
  console.info(BRAND + ' reader', computeIsWide() ? 'wide' : 'narrow');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
