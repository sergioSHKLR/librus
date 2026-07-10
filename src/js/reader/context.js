/**
 * Block 1 of 1 — reader/context.js
 * Description: Consult pane iframe navigation and provider buttons (wide only)
 * Version: 1.a
 * Revised: 260710 17:00
 */

import { assetBase } from '../shared/paths.js';
import { computeIsWide } from './layout.js';

const historyStack = [];
let currentUrl = '';

const PROVIDER_TEMPLATES = {
  luzespirita: 'https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item={query}',
  wiki: 'https://pt.wikipedia.org/wiki/{query}',
  dictionary: 'https://pt.wiktionary.org/wiki/{query}',
  map: 'https://www.openstreetmap.org/search?query={query}'
};

export function blankUrl() {
  return assetBase() + 'pages/blank.html';
}

export function openContextUrl(url, selectionLabel) {
  if (!computeIsWide()) return;
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !url) return;

  if (currentUrl) historyStack.push(currentUrl);
  currentUrl = url;
  showLoading(true);
  iframe.src = url;
  updateSelection(selectionLabel || url);
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

function updateNavButtons() {
  const back = document.getElementById('btn-context-back');
  if (back) back.disabled = historyStack.length === 0;
}

function showLoading(on) {
  const overlay = document.getElementById('context-loading-overlay');
  if (!overlay) return;
  overlay.classList.toggle('is-hidden', !on);
  overlay.setAttribute('aria-hidden', on ? 'false' : 'true');
}

export function contextBack() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe || !historyStack.length) return;
  currentUrl = historyStack.pop() || '';
  showLoading(true);
  iframe.src = currentUrl || blankUrl();
  updateNavButtons();
}

export function contextReload() {
  const iframe = document.getElementById('context-iframe');
  if (!iframe) return;
  showLoading(true);
  // eslint-disable-next-line no-self-assign
  iframe.src = iframe.src;
}

function selectedText() {
  const sel = window.getSelection();
  return sel ? String(sel.toString() || '').trim() : '';
}

export function wireContext() {
  const iframe = document.getElementById('context-iframe');
  if (iframe) {
    iframe.addEventListener('load', () => showLoading(false));
    if (!iframe.getAttribute('src')) iframe.src = blankUrl();
  }

  document.getElementById('btn-context-back')?.addEventListener('click', contextBack);
  document.getElementById('btn-context-reload')?.addEventListener('click', contextReload);

  document.querySelectorAll('.context-provider-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!computeIsWide()) return;
      const provider = btn.getAttribute('data-provider');
      const tpl = PROVIDER_TEMPLATES[provider];
      if (!tpl) return;
      const q = selectedText() || document.getElementById('context-selection')?.textContent || '';
      const term = q && !document.getElementById('context-selection')?.classList.contains('is-placeholder')
        ? q
        : selectedText();
      if (!term) return;
      const url = tpl.replace('{query}', encodeURIComponent(term));
      openContextUrl(url, term);
    });
  });

  document.addEventListener('selectionchange', () => {
    const t = selectedText();
    if (t && t.length < 80) updateSelection(t);
  });
}
