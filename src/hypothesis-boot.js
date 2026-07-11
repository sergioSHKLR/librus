/**
 * Block 1 of 1 — hypothesis-boot.js
 * Description: Early theme + hypothesisConfig (wide: external pane; narrow: standard)
 * Version: 1.a
 * Revised: 10Jul26
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'nano-ssg-settings';
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
  }

  function isWideLayout() {
    try {
      var w = window.innerWidth || document.documentElement.clientWidth || 0;
      var landscape =
        !window.matchMedia || window.matchMedia('(orientation: landscape)').matches;
      return w >= WIDE_MIN && landscape;
    } catch (_) {
      return true;
    }
  }

  var wide = isWideLayout();
  document.documentElement.setAttribute('data-layout', wide ? 'wide' : 'narrow');
  window.__nanoSsgWideAtBoot = wide;

  window.hypothesisConfig = function () {
    var cfg = {
      openSidebar: true,
      showHighlights: 'always',
      theme: 'classic',
      branding: LIGHT_BRANDING
    };
    /* Wide: notes in left pane. Narrow: default Hypothesis sidebar (no container). */
    if (wide && document.getElementById('hypothesis-container')) {
      cfg.externalContainerSelector = '#hypothesis-container';
    }
    return cfg;
  };

  applyBootstrapTheme();
})();
