/**
 * Block 1 of 1 — library/site.js
 * Description: Theme + EN/PT-BR i18n on About / Help / Legal / Contact
 * Version: 1.e
 * Revised: 23Jul26
 */

import { loadSettings } from '../shared/storage.js';
import { applyTheme } from '../shared/theme.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl, assetBase } from '../shared/paths.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { BRAND } from '../shared/constants.js';

/** Site chrome pages (footer shows all; current is greyed, not a link). */
const SITE_PAGES = [
  { id: 'about', file: 'about.html', key: 'nav.about', fallback: 'About' },
  { id: 'help', file: 'help.html', key: 'nav.help', fallback: 'Help' },
  { id: 'legal', file: 'legal.html', key: 'nav.legal', fallback: 'Legal' },
  { id: 'contact', file: 'contact.html', key: 'nav.contact', fallback: 'Contact' }
];

/**
 * Rebuild footer nav: every site page + Code; current page is non-link greyed.
 * @param {Record<string, string>} strings
 */
function wireSiteFooter(strings) {
  const nav = document.querySelector('.site-footer-nav');
  if (!nav) return;
  const current = document.body.dataset.page || '';
  nav.replaceChildren();
  nav.setAttribute('aria-label', t(strings, 'page.morePages', 'More pages'));

  const appendSep = () => {
    const sep = document.createElement('span');
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '·';
    nav.appendChild(sep);
  };

  SITE_PAGES.forEach((p, i) => {
    if (i > 0) appendSep();
    const label = t(strings, p.key, p.fallback);
    if (p.id === current) {
      const span = document.createElement('span');
      span.className = 'site-footer-current';
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      nav.appendChild(span);
    } else {
      const a = document.createElement('a');
      a.href = p.file;
      a.textContent = label;
      nav.appendChild(a);
    }
  });

  appendSep();
  const code = document.createElement('a');
  code.className = 'site-footer-external';
  code.href = 'https://github.com/sergioSHKLR/librus';
  code.rel = 'noopener noreferrer';
  code.target = '_blank';
  const codeLabel = document.createElement('span');
  codeLabel.textContent = t(strings, 'nav.code', 'Source-code');
  const codeIcon = document.createElement('img');
  codeIcon.className = 'site-footer-external-icon';
  codeIcon.src = assetBase() + 'icons/external-link.svg';
  codeIcon.alt = '';
  codeIcon.width = 14;
  codeIcon.height = 14;
  code.appendChild(codeLabel);
  code.appendChild(codeIcon);
  nav.appendChild(code);
}

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
    wireSiteFooter(strings);

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
