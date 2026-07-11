/**
 * Block 1 of 1 — reader/context.js
 * Description: Consult pane iframe, provider home/search, nav disabled until load
 * Version: 1.b
 * Revised: 11Jul26
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

export function blankUrl() {
  return assetBase() + 'pages/blank.html';
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
    el.textContent = el.dataset.placeholder || 'selected_term';
    el.classList.add('is-placeholder');
    return;
  }
  el.textContent = text;
  el.classList.remove('is-placeholder');
}

/**
 * Back / reload stay greyed out until a non-blank page finishes loading.
 * Back also needs history; reload needs a real current URL.
 */
function updateNavButtons() {
  const back = document.getElementById('btn-context-back');
  const reload = document.getElementById('btn-context-reload');
  const canUse = pageReady && !isLoading && !isBlankUrl(currentUrl);
  if (back) back.disabled = !canUse || historyStack.length === 0;
  if (reload) reload.disabled = !canUse;
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

export function contextReload() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe || isLoading || !pageReady || isBlankUrl(currentUrl)) return;
  pageReady = false;
  showLoading(true);
  // force reload
  const src = iframe.src;
  iframe.src = 'about:blank';
  requestAnimationFrame(() => {
    iframe.src = src;
  });
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
  if (!t || t === (el.dataset.placeholder || 'selected_term')) return '';
  return t;
}

export function wireContext() {
  const iframe = document.getElementById('context-iframe');
  if (iframe) {
    iframe.addEventListener('load', onIframeLoad);
    currentUrl = blankUrl();
    pageReady = false;
    isLoading = false;
    if (!iframe.getAttribute('src') || iframe.getAttribute('src') === '') {
      iframe.src = currentUrl;
    } else {
      currentUrl = iframe.src;
    }
    updateNavButtons();
  }

  document.getElementById('btn-context-back')?.addEventListener('click', contextBack);
  document.getElementById('btn-context-reload')?.addEventListener('click', contextReload);

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
}
