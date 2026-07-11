/**
 * Block 1 of 1 — reader/links.js
 * Description: Density + provider toggles in Links dropdown (wide only)
 * Version: 1.c
 * Revised: 10Jul26
 */

import { loadSettings, saveSettings } from '../shared/storage.js';
import { computeIsWide } from './layout.js';

const DENSITY_ORDER = ['lo', 'med', 'hi'];

function interestVisible(density, interest) {
  const i = interest || 'med';
  if (density === 'hi') return true;
  if (density === 'med') return i === 'hi' || i === 'med';
  return i === 'hi';
}

function setMenuOpen(open) {
  const btn = document.getElementById('btn-links-menu');
  const panel = document.getElementById('links-menu-panel');
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.classList.toggle('is-hidden', !open);
  if (open) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
}

function isMenuOpen() {
  const btn = document.getElementById('btn-links-menu');
  return btn?.getAttribute('aria-expanded') === 'true';
}

/** @param {ReturnType<typeof loadSettings>} settings */
export function applyLinkFilters(settings) {
  const root = document.documentElement;
  const density = settings.linkDensity || 'med';
  root.setAttribute('data-link-density', density);

  const providers = settings.linkProviders || { l: true, w: true, d: true };
  root.setAttribute('data-link-l', providers.l !== false ? '1' : '0');
  root.setAttribute('data-link-w', providers.w !== false ? '1' : '0');
  root.setAttribute('data-link-d', providers.d !== false ? '1' : '0');
  /* maps folded into wikipedia — hide legacy m: links with density/provider off */
  root.setAttribute('data-link-m', '0');

  const book = document.getElementById('book-root');
  const wide = computeIsWide();

  if (book) {
    book.querySelectorAll('a[data-link-provider]').forEach((a) => {
      const code = a.getAttribute('data-link-provider');
      const interest = a.getAttribute('data-link-interest') || 'med';
      const providerOn = providers[code] !== false;
      const densOk = interestVisible(density, interest);
      const show = wide && providerOn && densOk;
      a.classList.toggle('is-link-hidden', !show);
    });
  }

  const densText = density.toUpperCase();
  const label = document.getElementById('density-toggle-label');
  if (label) label.textContent = densText;
  const chip = document.getElementById('links-menu-chip');
  if (chip) chip.textContent = densText;

  document.querySelectorAll('.provider-toggle[data-provider-code]').forEach((btn) => {
    const code = btn.getAttribute('data-provider-code');
    const on = providers[code] !== false;
    btn.classList.toggle('is-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
  });

  const menu = document.getElementById('links-menu');
  if (menu) menu.hidden = !wide;
  if (!wide) setMenuOpen(false);
}

export function wireLinkFilters() {
  let settings = loadSettings();
  applyLinkFilters(settings);

  document.getElementById('btn-links-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!computeIsWide()) return;
    setMenuOpen(!isMenuOpen());
  });

  document.getElementById('btn-density-cycle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!computeIsWide()) return;
    settings = loadSettings();
    let idx = DENSITY_ORDER.indexOf(settings.linkDensity || 'med');
    if (idx < 0) idx = 1;
    settings.linkDensity = DENSITY_ORDER[(idx + 1) % DENSITY_ORDER.length];
    settings = saveSettings(settings);
    applyLinkFilters(settings);
  });

  document.querySelectorAll('.provider-toggle[data-provider-code]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!computeIsWide()) return;
      const code = btn.getAttribute('data-provider-code');
      if (!code) return;
      settings = loadSettings();
      if (!settings.linkProviders) settings.linkProviders = { l: true, w: true, d: true };
      settings.linkProviders[code] = settings.linkProviders[code] === false;
      settings = saveSettings(settings);
      applyLinkFilters(settings);
    });
  });

  document.addEventListener('click', (e) => {
    if (!isMenuOpen()) return;
    const menu = document.getElementById('links-menu');
    if (menu && e.target instanceof Node && menu.contains(e.target)) return;
    setMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) {
      setMenuOpen(false);
      document.getElementById('btn-links-menu')?.focus();
    }
  });

  document.addEventListener('nano:layout-change', () => {
    applyLinkFilters(loadSettings());
  });
}
