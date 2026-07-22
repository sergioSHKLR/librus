/**
 * Block 1 of 1 — reader/main.js
 * Description: Boot reader — layout, typography menu, Links; two-row toolbar
 * Version: 1.f
 * Revised: 21Jul26
 */

import { loadSettings } from '../shared/storage.js';
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
import { wireTypography, setTypographyStrings } from './typography.js';
import { wirePageNav } from './page-nav.js';
import { wirePwaUpdates } from '../settings/update.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl, assetBase } from '../shared/paths.js';
import { BRAND } from '../shared/constants.js';
import { wireStudyNote } from '../shared/study-note.js';

function setHypoInvert(theme) {
  const host = document.getElementById('hypothesis-container');
  if (!host) return;
  host.classList.toggle('hypothesis-theme-invert', isEffectivelyDark(theme));
}

async function boot() {
  let settings = applyQueryToSettings();
  applyTypography(settings);
  applyTheme(settings.theme, { assetBase: assetBase() });
  setHypoInvert(settings.theme);

  const lib = document.getElementById('btn-library');
  if (lib) lib.setAttribute('href', libraryHomeUrl());

  const strings = await loadLocale(settings.lang);
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);
  setLinksStrings(strings);
  setTypographyStrings(strings);

  const title = document.body.dataset.bookTitle || t(strings, 'brand', BRAND);
  document.title = title + ' · ' + t(strings, 'brand', BRAND);

  const selectedLabel = t(strings, 'reader.selectedTerm', 'selected_term');
  setSelectionPlaceholder(selectedLabel);
  setBreadcrumbPartLabel(t(strings, 'reader.part', settings.lang === 'pt' ? 'Parte' : 'Part'));
  setContextNavLabels({
    reload: t(strings, 'reader.reload', 'Reload'),
    stop: t(strings, 'reader.stop', 'Stop'),
    searching: t(strings, 'reader.searchingOn', 'Searching for "{term}" on {provider}'),
    opening: t(strings, 'reader.openingProvider', 'Opening {provider}…'),
    loading: t(strings, 'reader.loading', 'Loading…'),
    providers: {
      wiki: t(strings, 'reader.providerWiki', 'Wikipedia'),
      dictionary: t(strings, 'reader.providerDict', 'Wiktionary')
    }
  });
  setBlankLang(settings.lang === 'pt' ? 'pt' : 'en');

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const searchPh = t(strings, 'reader.search', settings.lang === 'pt' ? 'Procurar…' : 'Search…');
    searchInput.placeholder = searchPh;
    searchInput.setAttribute('aria-label', t(strings, 'pane.search', searchPh));
  }
  const tocFilter = document.getElementById('toc-filter');
  if (tocFilter) {
    const tocPh = t(strings, 'reader.tocFilter', settings.lang === 'pt' ? 'Filtrar…' : 'Filter…');
    tocFilter.placeholder = tocPh;
    tocFilter.setAttribute('aria-label', tocPh);
  }

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    settings = loadSettings();
    if (settings.theme === 'system') {
      applyTheme('system', { assetBase: assetBase() });
      setHypoInvert('system');
    }
  });

  wireLayout();
  wireSearch();
  wireContext();
  wireTypography();

  await loadBookBody();
  wireBreadcrumb();
  wireToc();
  wireLinkFilters();
  await wirePageNav();
  applyDeepLink();
  window.addEventListener('hashchange', applyDeepLink);

  wirePwaUpdates();
  wireStudyNote({ lang: settings.lang === 'pt' ? 'pt' : 'en' });

  runIntegrityDebug();
  console.info(BRAND + ' reader', computeIsWide() ? 'wide' : 'narrow');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
