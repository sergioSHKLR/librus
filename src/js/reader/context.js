/**
 * Block 1 of 1 — reader/context.js
 * Description: Consult pane iframe; reload↔stop while loading; Wiki night mode
 * Version: 1.e
 * Revised: 16Jul26
 */

import { assetBase } from '../shared/paths.js';
import {
  loadSettings,
  resolveSearchTemplate,
  homeFromTemplate,
  defaultSearchTemplates,
  lucideIconUrl
} from '../shared/storage.js';
import { isEffectivelyDark } from '../shared/theme.js';
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
/** Overlay spinner copy (locale-filled) */
let loadingLabels = {
  searching: 'Searching for "{term}" on {provider}',
  opening: 'Opening {provider}…',
  loading: 'Loading…',
  providers: {
    luzespirita: 'Luz Espírita',
    wiki: 'Wikipedia',
    dictionary: 'Wiktionary',
    map: 'OpenStreetMap'
  }
};

/** @type {'en'|'pt'} */
let blankLang = 'pt';

/**
 * Wiki/Wiktionary hosts use Vector night mode via URL — cross-origin localStorage
 * cannot be written from this app. `vectornightmode=1` is the public share link.
 * @param {string} url
 * @returns {string}
 */
export function withWikiNightMode(url) {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.href);
    const host = u.hostname || '';
    if (!/(^|\.)wikipedia\.org$|(^|\.)wiktionary\.org$/i.test(host)) return url;
    const theme = loadSettings().theme || 'system';
    if (isEffectivelyDark(theme)) {
      u.searchParams.set('vectornightmode', '1');
    } else {
      u.searchParams.delete('vectornightmode');
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** @returns {'en'|'pt'} */
function wikiLang() {
  return blankLang === 'en' ? 'en' : 'pt';
}

function providerTemplates() {
  const s = loadSettings();
  const builtins = defaultSearchTemplates(wikiLang());
  return {
    luzespirita: resolveSearchTemplate(s, 'luzespirita') || builtins.luzespirita,
    wiki: resolveSearchTemplate(s, 'wiki') || builtins.wiki,
    dictionary: resolveSearchTemplate(s, 'dictionary') || builtins.dictionary,
    custom: resolveSearchTemplate(s, 'custom'),
    map: 'https://www.openstreetmap.org/search?query={query}'
  };
}

function providerHomes() {
  const s = loadSettings();
  const lang = wikiLang();
  const builtins = defaultSearchTemplates(lang);
  return {
    luzespirita:
      homeFromTemplate(resolveSearchTemplate(s, 'luzespirita') || builtins.luzespirita) ||
      'https://www.luzespirita.org.br/',
    wiki:
      homeFromTemplate(resolveSearchTemplate(s, 'wiki') || builtins.wiki) ||
      'https://' + lang + '.wikipedia.org/',
    dictionary:
      homeFromTemplate(resolveSearchTemplate(s, 'dictionary') || builtins.dictionary) ||
      'https://' + lang + '.wiktionary.org/',
    custom: homeFromTemplate(resolveSearchTemplate(s, 'custom')) || '',
    map: 'https://www.openstreetmap.org/'
  };
}

const PROVIDER_HOME_LABELS = {
  luzespirita: 'Luz Espírita',
  wiki: 'Wikipedia',
  dictionary: 'Wiktionary',
  custom: 'Custom',
  map: 'OpenStreetMap',
  youtube: 'YouTube'
};

/** Inject/remove optional custom provider button from settings. */
export function syncCustomProviderButton() {
  const group = document.querySelector('.context-provider-buttons');
  if (!group) return;
  const s = loadSettings();
  const tpl = resolveSearchTemplate(s, 'custom');
  const label = (s.customProvider && s.customProvider.label) || 'Custom';
  let btn = group.querySelector('[data-provider="custom"]');
  if (!tpl) {
    btn?.remove();
    return;
  }
  const iconName = (s.customProvider && s.customProvider.icon) || 'link';
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toolbar-btn context-provider-btn';
    btn.setAttribute('data-provider', 'custom');
    const img = document.createElement('img');
    img.className = 'toolbar-icon';
    img.alt = '';
    img.width = 20;
    img.height = 20;
    btn.appendChild(img);
    group.appendChild(btn);
    btn.addEventListener('click', onProviderBtnClick);
  }
  const img = btn.querySelector('img.toolbar-icon');
  if (img) img.src = lucideIconUrl(iconName, assetBase());
  btn.title = label;
  btn.setAttribute('aria-label', label);
  if (loadingLabels.providers) loadingLabels.providers.custom = label;
  PROVIDER_HOME_LABELS.custom = label;
}

function onProviderBtnClick(ev) {
  if (!computeIsWide()) return;
  const btn = ev.currentTarget;
  if (!(btn instanceof HTMLElement)) return;
  const provider = btn.getAttribute('data-provider');
  if (!provider) return;
  const templates = providerTemplates();
  const homes = providerHomes();
  const term = activeTerm();
  if (term) {
    const tpl = templates[provider];
    if (!tpl) return;
    openContextUrl(tpl.replace(/\{query\}/gi, encodeURIComponent(term)), term, provider);
    return;
  }
  const home = homes[provider];
  if (home) openContextUrl(home, '', provider);
}

/**
 * @param {string} url
 * @returns {string} provider key
 */
function providerFromUrl(url) {
  if (!url) return '';
  try {
    const h = new URL(url, window.location.href).hostname || '';
    if (/luzespirita/i.test(h) || /luzespirita/i.test(url)) return 'luzespirita';
    if (/wiktionary\.org$/i.test(h) || h.includes('wiktionary')) return 'dictionary';
    if (/wikipedia\.org$/i.test(h) || h.includes('wikipedia')) return 'wiki';
    if (/openstreetmap\.org$/i.test(h) || h.includes('openstreetmap')) return 'map';
    if (/youtube\.com$|youtube-nocookie\.com$|youtu\.be$/i.test(h)) return 'youtube';
  } catch {
    if (/luzespirita/i.test(url)) return 'luzespirita';
    if (/wiktionary/i.test(url)) return 'dictionary';
    if (/wikipedia/i.test(url)) return 'wiki';
    if (/youtube|youtu\.be/i.test(url)) return 'youtube';
  }
  return '';
}

/**
 * @param {string} [term]
 * @param {string} [providerKey]
 * @param {string} [url]
 */
function formatLoadingMessage(term, providerKey, url) {
  const key = providerKey || providerFromUrl(url || currentUrl);
  const provider =
    (loadingLabels.providers && loadingLabels.providers[key]) ||
    PROVIDER_HOME_LABELS[key] ||
    key ||
    '…';
  const t = String(term || '').trim();
  const ph = placeholderLabel || 'selected_term';
  if (t && t !== ph) {
    return String(loadingLabels.searching || '')
      .replace(/\{term\}/g, t)
      .replace(/\{provider\}/g, provider);
  }
  if (key) {
    return String(loadingLabels.opening || '').replace(/\{provider\}/g, provider);
  }
  return loadingLabels.loading || 'Loading…';
}

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

/**
 * @param {string} url
 * @param {string} [selectionLabel]
 * @param {string} [providerKey] luzespirita | wiki | dictionary | map | …
 */
export function openContextUrl(url, selectionLabel, providerKey) {
  if (!computeIsWide()) return;
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !url) return;

  const finalUrl = withWikiNightMode(url);

  if (currentUrl && !isBlankUrl(currentUrl)) historyStack.push(currentUrl);
  currentUrl = finalUrl;
  pageReady = false;
  showLoading(true, {
    term: selectionLabel,
    provider: providerKey || providerFromUrl(finalUrl),
    url: finalUrl
  });
  iframe.src = finalUrl;
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
  img.src = base + (mode === 'stop' ? 'circle-stop.svg' : 'reload.svg');
}

/**
 * @param {boolean} on
 * @param {{ term?: string, provider?: string, url?: string }} [opts]
 */
function showLoading(on, opts = {}) {
  isLoading = !!on;
  const overlay = document.getElementById('context-loading-overlay');
  if (overlay) {
    overlay.classList.toggle('is-hidden', !on);
    overlay.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  const msg = document.getElementById('context-loading-msg');
  if (msg) {
    if (on) {
      msg.textContent = formatLoadingMessage(opts.term, opts.provider, opts.url);
    } else {
      msg.textContent = '';
    }
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
  const term = activeTerm();
  showLoading(true, { term, provider: providerFromUrl(currentUrl), url: currentUrl });
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
  const src = withWikiNightMode(currentUrl || iframe.src);
  currentUrl = src;
  showLoading(true, { term: activeTerm(), provider: providerFromUrl(src), url: src });
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
 * Optional i18n labels for reload/stop + loading overlay.
 * @param {{
 *   reload?: string,
 *   stop?: string,
 *   searching?: string,
 *   opening?: string,
 *   loading?: string,
 *   providers?: Record<string, string>
 * }} next
 */
export function setContextNavLabels(next) {
  if (next?.reload) labels.reload = next.reload;
  if (next?.stop) labels.stop = next.stop;
  if (next?.searching) loadingLabels.searching = next.searching;
  if (next?.opening) loadingLabels.opening = next.opening;
  if (next?.loading) loadingLabels.loading = next.loading;
  if (next?.providers && typeof next.providers === 'object') {
    loadingLabels.providers = Object.assign({}, loadingLabels.providers, next.providers);
  }
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
    btn.addEventListener('click', onProviderBtnClick);
  });
  syncCustomProviderButton();
  document.addEventListener('librus:settings-changed', () => syncCustomProviderButton());

  document.addEventListener('selectionchange', () => {
    const t = selectedText();
    if (t && t.length < 80) updateSelection(t);
  });

  /* Alt+1/W Wiki · Alt+2/D Dict · Alt+3/C Custom (no Luz in LIBRUS) */
  document.addEventListener('keydown', (e) => {
    if (!computeIsWide()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.target && e.target.isContentEditable) return;
    if (!e.altKey) return;

    const key = e.key.toLowerCase();
    let provider = '';
    if (key === '1' || key === 'w') provider = 'wiki';
    else if (key === '2' || key === 'd') provider = 'dictionary';
    else if (key === '3' || key === 'c') provider = 'custom';
    if (!provider) return;

    e.preventDefault();
    const templates = providerTemplates();
    const homes = providerHomes();
    if (provider === 'custom' && !templates.custom) return;
    const term = activeTerm();
    if (term) {
      const tpl = templates[provider];
      if (!tpl) return;
      openContextUrl(tpl.replace(/\{query\}/gi, encodeURIComponent(term)), term, provider);
      return;
    }
    const home = homes[provider];
    if (home) openContextUrl(home, '', provider);
  });

  syncTermClear();
}
