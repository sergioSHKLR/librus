/**
 * Block 1 of 1 — reader/layout.js
 * Description: Wide/narrow by width only; limited-experience + Hypo tip
 * Version: 1.b
 * Revised: 12Jul26
 */

import { LAYOUT_WIDE_MIN, VIEWPORT_ALERT_KEY } from '../shared/constants.js';

export function computeIsWide() {
  const w = window.innerWidth || document.documentElement.clientWidth || 0;
  return w >= LAYOUT_WIDE_MIN;
}

export function applyLayoutMode() {
  const wide = computeIsWide();
  document.documentElement.setAttribute('data-layout', wide ? 'wide' : 'narrow');
  document.body.classList.toggle('layout-wide', wide);
  document.body.classList.toggle('layout-narrow', !wide);
  return wide;
}

export function isViewportAlertDismissed() {
  try {
    return localStorage.getItem(VIEWPORT_ALERT_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissViewportAlert() {
  try {
    localStorage.setItem(VIEWPORT_ALERT_KEY, '1');
  } catch {
    /* ignore */
  }
  const el = document.getElementById('viewport-alert');
  if (el) {
    el.classList.add('is-hidden');
    el.setAttribute('hidden', '');
  }
}

export function maybeShowViewportAlert() {
  const el = document.getElementById('viewport-alert');
  if (!el) return;
  if (computeIsWide() || isViewportAlertDismissed()) {
    el.classList.add('is-hidden');
    el.setAttribute('hidden', '');
    return;
  }
  el.classList.remove('is-hidden');
  el.removeAttribute('hidden');
}

export function wireLayout() {
  applyLayoutMode();
  maybeShowViewportAlert();

  document.getElementById('viewport-alert-dismiss')?.addEventListener('click', dismissViewportAlert);

  let timer = null;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      applyLayoutMode();
      maybeShowViewportAlert();
      document.dispatchEvent(new CustomEvent('nano:layout-change', { detail: { wide: computeIsWide() } }));
    }, 120);
  });
}
