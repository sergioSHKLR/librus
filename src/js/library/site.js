/**
 * Block 1 of 1 — library/site.js
 * Description: Theme + EN/PT i18n on About / Help / Legal
 * Version: 1.c
 * Revised: 12Jul26
 */

import { loadSettings } from '../shared/storage.js';
import { applyTheme } from '../shared/theme.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl } from '../shared/paths.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { BRAND } from '../shared/constants.js';

async function boot() {
  const settings = applyQueryToSettings();
  applyTheme(settings.theme);

  document.querySelectorAll('a[data-library-home], .site-back a').forEach((a) => {
    a.setAttribute('href', libraryHomeUrl());
  });

  const lang = settings.lang === 'pt' ? 'pt' : 'en';
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  try {
    const strings = await loadLocale(lang);
    applyI18n(document, strings);

    const page = document.body.dataset.page || '';
    const pageTitle =
      (page === 'about' && t(strings, 'page.about.title', 'About')) ||
      (page === 'help' && t(strings, 'page.help.title', 'Help')) ||
      (page === 'legal' && t(strings, 'page.legal.title', 'Legal')) ||
      (page === 'contact' && t(strings, 'page.contact.title', 'Contact')) ||
      '';
    if (pageTitle) {
      document.title = pageTitle + ' · ' + t(strings, 'brand', BRAND);
    }
  } catch (err) {
    console.warn('site i18n failed', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
