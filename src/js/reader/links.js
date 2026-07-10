/**
 * Block 1 of 1 — reader/links.js
 * Description: Wide-mode density + provider visibility for baked research links
 * Version: 1.a
 * Revised: 260710 18:00
 */

import { loadSettings, saveSettings } from '../shared/storage.js';
import { computeIsWide } from './layout.js';

const DENSITY_ORDER = ['lo', 'med', 'hi'];

function interestVisible(density, interest) {
  const i = interest || 'med';
  if (density === 'hi') return true;
  if (density === 'med') return i === 'hi' || i === 'med';
  return i === 'hi'; // lo
}

export function applyLinkFilters(settings) {
  const root = document.documentElement;
  const density = settings.linkDensity || 'med';
  root.setAttribute('data-link-density', density);

  const providers = settings.linkProviders || { l: true, w: true, d: true, m: true };
  root.setAttribute('data-link-l', providers.l !== false ? '1' : '0');
  root.setAttribute('data-link-w', providers.w !== false ? '1' : '0');
  root.setAttribute('data-link-d', providers.d !== false ? '1' : '0');
  root.setAttribute('data-link-m', providers.m !== false ? '1' : '0');

  const book = document.getElementById('book-root');
  if (!book) return;

  /* Narrow: CSS zeroes all; still mark for clarity */
  const wide = computeIsWide();
  book.querySelectorAll('a[data-link-provider]').forEach((a) => {
    const code = a.getAttribute('data-link-provider');
    const interest = a.getAttribute('data-link-interest') || 'med';
    const providerOn = providers[code] !== false;
    const densOk = interestVisible(density, interest);
    const show = wide && providerOn && densOk;
    a.classList.toggle('is-link-hidden', !show);
    if (!wide) a.classList.add('is-link-hidden');
  });

  const label = document.getElementById('density-toggle-label');
  if (label) label.textContent = density.toUpperCase();
}

export function wireLinkFilters() {
  let settings = loadSettings();
  applyLinkFilters(settings);

  document.getElementById('btn-density-cycle')?.addEventListener('click', () => {
    if (!computeIsWide()) return;
    settings = loadSettings();
    let idx = DENSITY_ORDER.indexOf(settings.linkDensity || 'med');
    if (idx < 0) idx = 1;
    settings.linkDensity = DENSITY_ORDER[(idx + 1) % DENSITY_ORDER.length];
    settings = saveSettings(settings);
    applyLinkFilters(settings);
  });

  document.addEventListener('nano:layout-change', () => {
    applyLinkFilters(loadSettings());
  });
}
