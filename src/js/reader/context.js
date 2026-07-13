/**
 * Block 1 of 1 — reader/context.js
 * Description: Consult pane iframe; reload↔stop while loading
 * Version: 1.d
 * Revised: 12Jul26
 */

import { assetBase } from '../shared/paths.js';
import { computeIsWide } from './layout.js';

const historyStack = [];
/** @type {string} */
let currentUrl = '';
/** True while iframe is loading a URL */
let isLoading = false;
/** True after a non-blank page has finished loading */
let pageReady = false;
/** Localized empty-term label */
let placeholderLabel = 'selected_term';
/** UI strings for reload/stop */
let labels = { reload: 'Reload', stop: 'Stop' };

const PROVIDER_TEMPLATES = {
  luzespirita: 'https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item={query}',
  wiki: 'https://pt.wikipedia.org/wiki/{query}',
  dictionary: 'https://pt.wiktionary.org/wiki/{query}',
  map: 'https://www.openstreetmap.org/search?query={query}'
};

/** Homepages when provider is clicked with no selected term */
const PROVIDER_HOMES = {
  luzespirita: 'https://www.luzespirita.org.br/',
  wiki: 'https://pt.wikipedia.org/',
  dictionary: 'https://pt.wiktionary.org/',
  map: 'https://www.openstreetmap.org/'
};

const PROVIDER_HOME_LABELS = {
  luzespirita: 'Luz Espírita',
  wiki: 'Wikipedia',
  dictionary: 'Wiktionary',
  map: 'OpenStreetMap'
};

/** @type {'en'|'pt'} */
let blankLang = 'en';

/**
 * Default consult iframe URL; lang query keeps blank.html in sync with locale.
 * @param {'en'|'pt'} [lang]
 */
export function blankUrl(lang) {
  const code = lang === 'pt' || lang === 'en' ? lang : blankLang;
  return assetBase() + 'pages/blank.html?lang=' + encodeURIComponent(code);
}

/**
 * Keep blank iframe locale in sync (call after i18n load).
 * @param {'en'|'pt'} lang
 */
export function setBlankLang(lang) {
  blankLang = lang === 'pt' ? 'pt' : 'en';
  const iframe = document.getElementById('context-iframe');
  if (!iframe) return;
  try {
    const path = new URL(iframe.src, window.location.href).pathname;
    if (path.endsWith('blank.html') || isBlankUrl(iframe.src)) {
      iframe.src = blankUrl(blankLang);
    }
  } catch {
    /* ignore */
  }
}

function isBlankUrl(url) {
  if (!url) return true;
  try {
    const path = new URL(url, window.location.href).pathname;
    return path.endsWith('/blank.html') || path.endsWith('blank.html');
  } catch {
    return String(url).includes('blank.html');
  }
}

/**
 * Apply localized placeholder for empty selected_term (EN/PT).
 * @param {string} label
 */
export function setSelectionPlaceholder(label) {
  placeholderLabel = label || 'selected_term';
  const el = document.getElementById('context-selection');
  if (el) {
    el.dataset.placeholder = placeholderLabel;
    if (el.classList.contains('is-placeholder') || !String(el.textContent || '').trim()) {
      el.textContent = placeholderLabel;
      el.classList.add('is-placeholder');
    }
  }
  syncTermClear();
}

export function openContextUrl(url, selectionLabel) {
  if (!computeIsWide()) return;
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !url) return;

  if (currentUrl && !isBlankUrl(currentUrl)) historyStack.push(currentUrl);
  currentUrl = url;
  pageReady = false;
  showLoading(true);
  iframe.src = url;
  updateSelection(selectionLabel || '');
  updateNavButtons();
}

function updateSelection(text) {
  const el = document.getElementById('context-selection');
  if (!el) return;
  if (!text) {
    el.textContent = el.dataset.placeholder || placeholderLabel || 'selected_term';
    el.classList.add('is-placeholder');
    syncTermClear();
    return;
  }
  el.textContent = text;
  el.classList.remove('is-placeholder');
  syncTermClear();
}

function syncTermClear() {
  const btn = document.getElementById('btn-term-clear');
  const el = document.getElementById('context-selection');
  if (!btn || !el) return;
  const has = !el.classList.contains('is-placeholder') && !!String(el.textContent || '').trim();
  btn.classList.toggle('is-hidden', !has);
}

/**
 * Clear selected_term label and window text selection (keeps iframe page).
 */
export function clearSelectedTerm() {
  try {
    window.getSelection()?.removeAllRanges();
  } catch {
    /* ignore */
  }
  updateSelection('');
}

/**
 * Back greyed until a non-blank page is ready.
 * Reload/Stop button: Stop while loading (enabled); Reload when idle with a page.
 */
function updateNavButtons() {
  const back = document.getElementById('btn-context-back');
  const reload = document.getElementById('btn-context-reload');
  if (back) {
    const canBack = pageReady && !isLoading && !isBlankUrl(currentUrl) && historyStack.length > 0;
    back.disabled = !canBack;
  }
  if (reload) {
    if (isLoading) {
      reload.disabled = false;
      reload.dataset.mode = 'stop';
      reload.title = labels.stop;
      reload.setAttribute('aria-label', labels.stop);
      setReloadIcon(reload, 'stop');
    } else {
      const canReload = pageReady && !isBlankUrl(currentUrl);
      reload.disabled = !canReload;
      reload.dataset.mode = 'reload';
      reload.title = labels.reload;
      reload.setAttribute('aria-label', labels.reload);
      setReloadIcon(reload, 'reload');
    }
  }
}

function setReloadIcon(btn, mode) {
  const img = btn.querySelector('img.toolbar-icon');
  if (!img) return;
  const base = assetBase() + 'icons/';
  img.src = base + (mode === 'stop' ? 'square.svg' : 'reload.svg');
}

function showLoading(on) {
  isLoading = !!on;
  const overlay = document.getElementById('context-loading-overlay');
  if (overlay) {
    overlay.classList.toggle('is-hidden', !on);
    overlay.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  updateNavButtons();
}

function onIframeLoad() {
  isLoading = false;
  pageReady = !isBlankUrl(currentUrl);
  showLoading(false);
  updateNavButtons();
}

export function contextBack() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !historyStack.length || isLoading) return;
  currentUrl = historyStack.pop() || '';
  pageReady = false;
  showLoading(true);
  iframe.src = currentUrl || blankUrl();
  if (isBlankUrl(currentUrl)) updateSelection('');
  updateNavButtons();
}

/** Abort in-flight navigation; clear loading UI. */
export function contextStop() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !isLoading) return;
  isLoading = false;
  pageReady = false;
  currentUrl = blankUrl();
  iframe.src = currentUrl;
  showLoading(false);
  updateNavButtons();
}

export function contextReload() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe || isLoading || !pageReady || isBlankUrl(currentUrl)) return;
  pageReady = false;
  showLoading(true);
  const src = currentUrl || iframe.src;
  iframe.src = 'about:blank';
  requestAnimationFrame(() => {
    iframe.src = src;
  });
  updateNavButtons();
}

function onReloadOrStopClick() {
  const reload = document.getElementById('btn-context-reload');
  if (reload?.dataset.mode === 'stop' || isLoading) {
    contextStop();
    return;
  }
  contextReload();
}

/**
 * Optional i18n labels for reload/stop.
 * @param {{ reload?: string, stop?: string }} next
 */
export function setContextNavLabels(next) {
  if (next?.reload) labels.reload = next.reload;
  if (next?.stop) labels.stop = next.stop;
  updateNavButtons();
}

function selectedText() {
  const sel = window.getSelection();
  return sel ? String(sel.toString() || '').trim() : '';
}

/** Active term: selection, or non-placeholder selection label */
function activeTerm() {
  const sel = selectedText();
  if (sel) return sel;
  const el = document.getElementById('context-selection');
  if (!el || el.classList.contains('is-placeholder')) return '';
  const t = String(el.textContent || '').trim();
  const ph = el.dataset.placeholder || placeholderLabel || 'selected_term';
  if (!t || t === ph) return '';
  return t;
}

export function wireContext() {
  const iframe = document.getElementById('context-iframe');
  if (iframe) {
    iframe.addEventListener('load', onIframeLoad);
    pageReady = false;
    isLoading = false;
    const src = iframe.getAttribute('src') || '';
    if (!src || isBlankUrl(src)) {
      currentUrl = blankUrl();
      iframe.src = currentUrl;
    } else {
      currentUrl = iframe.src || src;
    }
    updateNavButtons();
  }

  document.getElementById('btn-context-back')?.addEventListener('click', contextBack);
  document.getElementById('btn-context-reload')?.addEventListener('click', onReloadOrStopClick);
  document.getElementById('btn-term-clear')?.addEventListener('click', () => clearSelectedTerm());

  document.querySelectorAll('.context-provider-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!computeIsWide()) return;
      const provider = btn.getAttribute('data-provider');
      if (!provider) return;

      const term = activeTerm();
      if (term) {
        const tpl = PROVIDER_TEMPLATES[provider];
        if (!tpl) return;
        const url = tpl.replace('{query}', encodeURIComponent(term));
        openContextUrl(url, term);
        return;
      }

      const home = PROVIDER_HOMES[provider];
      if (!home) return;
      openContextUrl(home, PROVIDER_HOME_LABELS[provider] || provider);
    });
  });

  document.addEventListener('selectionchange', () => {
    const t = selectedText();
    if (t && t.length < 80) updateSelection(t);
  });

  /* Provider search: Alt+1/L Luz · Alt+2/W Wiki · Alt+3/D Dict */
  document.addEventListener('keydown', (e) => {
    if (!computeIsWide()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.target && e.target.isContentEditable) return;
    if (!e.altKey) return;

    const key = e.key.toLowerCase();
    let provider = '';
    if (key === '1' || key === 'l') provider = 'luzespirita';
    else if (key === '2' || key === 'w') provider = 'wiki';
    else if (key === '3' || key === 'd') provider = 'dictionary';
    if (!provider) return;

    e.preventDefault();
    const term = activeTerm();
    if (term) {
      const tpl = PROVIDER_TEMPLATES[provider];
      if (!tpl) return;
      openContextUrl(tpl.replace('{query}', encodeURIComponent(term)), term);
      return;
    }
    const home = PROVIDER_HOMES[provider];
    if (home) openContextUrl(home, PROVIDER_HOME_LABELS[provider] || provider);
  });

  syncTermClear();
}
