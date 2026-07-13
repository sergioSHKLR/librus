/**
 * Block 1 of 1 — library/main.js
 * Description: Library home — i18n, theme, settings, cover grid + filter
 * Version: 1.c
 * Revised: 12Jul26
 */

import { BRAND, TAGLINE } from '../shared/constants.js';
import { loadSettings, saveSettings } from '../shared/storage.js';
import { applyTheme, applyTypography, nextTheme } from '../shared/theme.js';
import { loadLocale, applyI18n, t } from '../i18n/i18n.js';
import { runIntegrityDebug } from '../shared/integrity.js';
import { wireSettingsPanel } from '../settings/panel.js';
import { wirePwaUpdates } from '../settings/update.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { bookReaderUrl } from '../shared/paths.js';
import { wireStudyNote } from '../shared/study-note.js';

/** @type {object[]} */
let allBooks = [];
/** @type {Record<string, string>} */
let uiStrings = {};

function coverBackground(book) {
  const colors = (book.cover && book.cover.colors) || ['#4a5568'];
  if (colors.length >= 2) {
    const angle = (book.cover && book.cover.angle) || 135;
    return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
  }
  return colors[0] || '#4a5568';
}

function bookMatches(book, q) {
  if (!q) return true;
  const hay = [
    book.title,
    book.author,
    book.slug,
    book.abstract,
    book.subtitle,
    ...(book.categories || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

function renderBooks(listEl, emptyEl, books, strings) {
  listEl.innerHTML = '';
  const enabled = (books || []).filter((b) => b && b.slug);

  if (!enabled.length) {
    emptyEl.hidden = false;
    emptyEl.textContent = t(strings, 'library.empty', 'No books yet.');
    return;
  }

  emptyEl.hidden = true;
  for (const book of enabled) {
    const li = document.createElement('li');
    const a = document.createElement(book.enabled === false ? 'div' : 'a');
    a.className = 'cover-card' + (book.enabled === false ? ' is-disabled' : '');
    if (book.enabled !== false) {
      a.href = bookReaderUrl(book.slug);
    }
    a.setAttribute('data-title', book.title || book.slug);
    a.setAttribute('data-slug', book.slug || '');

    const face = document.createElement('div');
    face.className = 'cover-face';
    face.setAttribute('aria-hidden', 'true');
    face.style.background = coverBackground(book);
    const icon = document.createElement('img');
    icon.className = 'cover-icon';
    const iconName =
      (book.cover && book.cover.icon) ||
      book.icon ||
      'book';
    icon.src = 'icons/' + String(iconName).replace(/[^a-z0-9-]/gi, '') + '.svg';
    icon.alt = '';
    icon.width = 44;
    icon.height = 44;
    face.appendChild(icon);

    const meta = document.createElement('div');
    meta.className = 'cover-meta';
    const name = document.createElement('span');
    name.className = 'cover-name';
    name.textContent = book.title || book.slug;
    const author = document.createElement('span');
    author.className = 'cover-author';
    author.textContent = book.author || '';
    meta.appendChild(name);
    meta.appendChild(author);

    a.appendChild(face);
    a.appendChild(meta);
    li.appendChild(a);
    listEl.appendChild(li);
  }
}

function applyLibraryFilter() {
  const input = document.getElementById('library-filter');
  const q = String(input?.value || '')
    .trim()
    .toLowerCase();
  const filtered = allBooks.filter((b) => bookMatches(b, q));
  renderBooks(
    document.getElementById('cover-grid'),
    document.getElementById('library-empty'),
    filtered,
    uiStrings
  );
  const empty = document.getElementById('library-empty');
  if (empty && !filtered.length && allBooks.length) {
    empty.hidden = false;
    empty.textContent = t(uiStrings, 'library.filterEmpty', 'No books match.');
  }
}

async function fetchLibrary() {
  try {
    const res = await fetch('library.json', { cache: 'no-cache' });
    if (!res.ok) return { books: [] };
    return await res.json();
  } catch {
    return { books: [] };
  }
}

async function boot() {
  let settings = applyQueryToSettings();
  applyTypography(settings);

  const strings = await loadLocale(settings.lang);
  uiStrings = strings;
  document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en';
  applyI18n(document, strings);
  document.title = t(strings, 'brand', BRAND) + ' — ' + t(strings, 'library.title', 'Library');

  const themeLabels = {
    light: t(strings, 'theme.tipLight', 'Theme: light — click for dark'),
    dark: t(strings, 'theme.tipDark', 'Theme: dark — click for system'),
    system: t(strings, 'theme.tipSystem', 'Theme: system — click for light')
  };

  applyTheme(settings.theme, {
    iconEl: document.getElementById('theme-toggle-icon'),
    btnEl: document.getElementById('btn-theme-toggle'),
    assetBase: '',
    labels: themeLabels
  });

  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    settings.theme = nextTheme(settings.theme);
    settings = saveSettings(settings);
    applyTheme(settings.theme, {
      iconEl: document.getElementById('theme-toggle-icon'),
      btnEl: document.getElementById('btn-theme-toggle'),
      assetBase: '',
      labels: themeLabels
    });
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    settings = loadSettings();
    if (settings.theme === 'system') {
      applyTheme('system', {
        iconEl: document.getElementById('theme-toggle-icon'),
        btnEl: document.getElementById('btn-theme-toggle'),
        assetBase: '',
        labels: themeLabels
      });
    }
  });

  const data = await fetchLibrary();
  allBooks = data.books || [];
  applyLibraryFilter();

  let fTimer = null;
  document.getElementById('library-filter')?.addEventListener('input', () => {
    clearTimeout(fTimer);
    fTimer = setTimeout(applyLibraryFilter, 100);
  });

  const tag = document.getElementById('library-tagline');
  if (tag && !tag.dataset.i18n) tag.textContent = t(strings, 'tagline', TAGLINE);

  wireSettingsPanel({
    strings,
    themeUi: {
      iconEl: document.getElementById('theme-toggle-icon'),
      btnEl: document.getElementById('btn-theme-toggle'),
      assetBase: '',
      labels: themeLabels
    }
  });
  wirePwaUpdates();
  wireStudyNote({ lang: settings.lang === 'pt' ? 'pt' : 'en' });
  runIntegrityDebug();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
