/**
 * Block 1 of 1 — library/site.js
 * Description: Apply stored theme on About / Help / Legal (no theme control)
 * Version: 1.b
 * Revised: 260711 12:00
 */

import { loadSettings } from '../shared/storage.js';
import { applyTheme } from '../shared/theme.js';
import { applyQueryToSettings } from '../shared/prefs-query.js';
import { libraryHomeUrl } from '../shared/paths.js';

function boot() {
  const settings = applyQueryToSettings();
  applyTheme(settings.theme);

  document.querySelectorAll('a[data-library-home], .site-back a').forEach((a) => {
    a.setAttribute('href', libraryHomeUrl());
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
