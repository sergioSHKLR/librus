/**
 * Block 1 of 1 — hypothesis-boot.js
 * Description: Early theme + hypothesisConfig (wide: external pane; narrow: standard)
 * Version: 1.b
 * Revised: 23Jul26
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'librus-settings';
  var WIDE_MIN = 1200;
  var FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  var LIGHT_BRANDING = {
    appBackgroundColor: '#ffffff',
    accentColor: '#0066cc',
    ctaBackgroundColor: '#ffffff',
    ctaTextColor: '#333333',
    selectionFontFamily: FONT_STACK,
    annotationFontFamily: FONT_STACK
  };

  var DARK_BRANDING = {
    appBackgroundColor: '#1a1a1a',
    accentColor: '#4da6ff',
    ctaBackgroundColor: '#242424',
    ctaTextColor: '#eeeeee',
    selectionFontFamily: FONT_STACK,
    annotationFontFamily: FONT_STACK
  };

  function loadTheme() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 'system';
      var data = JSON.parse(raw);
      return data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function isEffectivelyDark(theme) {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (_) {
      return false;
    }
  }

  function applyBootstrapTheme() {
    var theme = loadTheme();
    var root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      root.style.colorScheme = 'light dark';
    } else {
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    }
    root.classList.toggle('hypothesis-app-dark', isEffectivelyDark(theme));
  }

  function isWideLayout() {
    try {
      var w = window.innerWidth || document.documentElement.clientWidth || 0;
      return w >= WIDE_MIN;
    } catch (_) {
      return true;
    }
  }

  var wide = isWideLayout();
  document.documentElement.setAttribute('data-layout', wide ? 'wide' : 'narrow');
  window.__nanoSsgWideAtBoot = wide;

  window.hypothesisConfig = function () {
    var dark = isEffectivelyDark(loadTheme());
    var cfg = {
      openSidebar: true,
      showHighlights: 'always',
      theme: 'classic',
      branding: dark ? DARK_BRANDING : LIGHT_BRANDING
    };
    if (wide && document.getElementById('hypothesis-container')) {
      cfg.externalContainerSelector = '#hypothesis-container';
    }
    return cfg;
  };

  applyBootstrapTheme();

  try {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (loadTheme() === 'system') applyBootstrapTheme();
      });
    }
  } catch (_) {
    /* ignore */
  }
})();
