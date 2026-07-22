/**
 * Block 1 of 1 — reader/links.js
 * Description: Density slider + provider toggles in display dropdown
 * Version: 1.g
 * Revised: 21Jul26
 */

import {
  loadSettings,
  saveSettings,
  lucideIconUrl,
  DENSITY_ORDER,
  DENSITY_LABELS
} from '../shared/storage.js';
import { computeIsWide } from './layout.js';
import { assetBase } from '../shared/paths.js';

/** @type {Record<string, string>} */
let strings = {};

/**
 * Locale strings for density labels and re-applied menu labels.
 * @param {Record<string, string>} s
 */
export function setLinksStrings(s) {
  strings = s || {};
  applyLinkFilters(loadSettings());
}

function t(key, fallback) {
  return strings[key] || fallback;
}

function densityLabel(density) {
  const d = density || 'med';
  const i = DENSITY_ORDER.indexOf(d);
  const keys = ['settings.density.none', 'settings.density.some', 'settings.density.all'];
  const fallbacks = DENSITY_LABELS;
  if (i >= 0) return t(keys[i], fallbacks[i]);
  return t('settings.density.some', 'Some');
}

/**
 * lo  → zero research links (none)
 * med → hi + med interest
 * hi  → all interest levels
 */
function interestVisible(density, interest) {
  if (density === 'lo') return false;
  const i = interest || 'med';
  if (density === 'hi') return true;
  return i === 'hi' || i === 'med';
}

function setMenuOpen(open) {
  const btn = document.getElementById('btn-reader-menu');
  const panel = document.getElementById('reader-menu-panel');
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.classList.toggle('is-hidden', !open);
  if (open) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
}

function isMenuOpen() {
  const btn = document.getElementById('btn-reader-menu');
  return btn?.getAttribute('aria-expanded') === 'true';
}

/**
 * Inject/remove optional custom provider toggle in the display menu.
 */
function syncMenuCustomProvider(settings) {
  const group = document.querySelector('#reader-menu-panel .provider-toggle-group');
  if (!group) return;
  const tpl = settings?.customProvider?.searchUrl;
  const label = (settings?.customProvider && settings.customProvider.label) || 'Custom';
  let btn = group.querySelector('[data-provider-code="c"]');
  if (!tpl) {
    btn?.remove();
    return;
  }
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toolbar-btn provider-toggle';
    btn.setAttribute('data-provider-code', 'c');
    btn.setAttribute('role', 'menuitemcheckbox');
    const img = document.createElement('img');
    img.className = 'toolbar-icon';
    img.alt = '';
    img.width = 20;
    img.height = 20;
    btn.appendChild(img);
    group.appendChild(btn);
    btn.addEventListener('click', onProviderClick);
  }
  const img = btn.querySelector('img.toolbar-icon');
  const icon = (settings.customProvider && settings.customProvider.icon) || 'link';
  if (img) img.src = lucideIconUrl(icon, assetBase());
  btn.title = label;
  btn.setAttribute('aria-label', label);
}

function onProviderClick(e) {
  e.stopPropagation();
  if (!computeIsWide()) return;
  const btn = e.currentTarget;
  if (!(btn instanceof HTMLElement)) return;
  const code = btn.getAttribute('data-provider-code');
  if (!code || code === 'l') return;
  let settings = loadSettings();
  if (!settings.linkProviders) settings.linkProviders = { w: true, d: true };
  const cur = settings.linkProviders[code];
  settings.linkProviders[code] = cur === false;
  settings = saveSettings(settings);
  applyLinkFilters(settings);
}

/** @param {ReturnType<typeof loadSettings>} settings */
export function applyLinkFilters(settings) {
  const root = document.documentElement;
  const density = settings.linkDensity || 'med';
  root.setAttribute('data-link-density', density);

  const providers = settings.linkProviders || { w: true, d: true };
  /* LIBRUS: no Luz — always hide l: links */
  root.setAttribute('data-link-l', '0');
  root.setAttribute('data-link-w', providers.w !== false ? '1' : '0');
  root.setAttribute('data-link-d', providers.d !== false ? '1' : '0');
  root.setAttribute('data-link-m', '0');

  const book = document.getElementById('book-root');
  const wide = computeIsWide();

  if (book) {
    book.querySelectorAll('a[data-link-provider]').forEach((a) => {
      const code = a.getAttribute('data-link-provider');
      if (code === 'l') {
        a.classList.add('is-link-hidden');
        return;
      }
      const interest = a.getAttribute('data-link-interest') || 'med';
      const providerOn = providers[code] !== false;
      const densOk = interestVisible(density, interest);
      const show = wide && providerOn && densOk;
      a.classList.toggle('is-link-hidden', !show);
    });
  }

  const di = DENSITY_ORDER.indexOf(density);
  const densSlider = document.getElementById('density-slider');
  const densLabel = document.getElementById('density-toggle-label');
  if (densSlider) densSlider.value = String(di < 0 ? 1 : di);
  if (densLabel) densLabel.textContent = densityLabel(density);

  document.querySelectorAll('.provider-toggle[data-provider-code]').forEach((btn) => {
    const code = btn.getAttribute('data-provider-code');
    const on = providers[code] !== false;
    btn.classList.toggle('is-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
  });

  syncMenuCustomProvider(settings);

  if (!wide) setMenuOpen(false);
}

export function wireLinkFilters() {
  let settings = loadSettings();
  applyLinkFilters(settings);

  document.getElementById('btn-reader-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  const densSlider = document.getElementById('density-slider');
  densSlider?.addEventListener('input', (e) => {
    e.stopPropagation();
    if (!computeIsWide()) return;
    settings = loadSettings();
    const i = Number(densSlider.value);
    settings.linkDensity = DENSITY_ORDER[Math.max(0, Math.min(2, i))] || 'med';
    settings = saveSettings(settings);
    applyLinkFilters(settings);
  });
  densSlider?.addEventListener('click', (e) => e.stopPropagation());
  densSlider?.addEventListener('pointerdown', (e) => e.stopPropagation());

  document.querySelectorAll('.provider-toggle[data-provider-code]').forEach((btn) => {
    btn.addEventListener('click', onProviderClick);
  });

  document.addEventListener('click', (e) => {
    if (!isMenuOpen()) return;
    const menu = document.getElementById('reader-menu');
    if (menu && e.target instanceof Node && menu.contains(e.target)) return;
    setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    settings = loadSettings();
    applyLinkFilters(settings);
  });
}
