/**
 * Block 1 of 1 — settings/update.js
 * Description: Service worker update banner + force update
 * Version: 1.a
 * Revised: 260710 18:30
 */

import { assetBase } from '../shared/paths.js';

let waitingWorker = null;

function showBanner(on) {
  const banner = document.getElementById('update-banner');
  if (!banner) return;
  banner.classList.toggle('is-hidden', !on);
  if (on) banner.removeAttribute('hidden');
  else banner.setAttribute('hidden', '');
}

export function ensureUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  const el = document.createElement('div');
  el.id = 'update-banner';
  el.className = 'update-banner is-hidden';
  el.hidden = true;
  el.innerHTML =
    '<span data-i18n="update.available">Update available</span>' +
    '<button type="button" id="btn-force-update" data-i18n="update.reload">Update now</button>';
  document.body.appendChild(el);
}

export function wirePwaUpdates() {
  if (!('serviceWorker' in navigator)) return;
  ensureUpdateBanner();

  const swUrl = assetBase() + 'sw.js';
  navigator.serviceWorker
    .register(swUrl)
    .then((reg) => {
      if (!reg) return;
      if (reg.waiting) {
        waitingWorker = reg.waiting;
        showBanner(true);
      }
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker = reg.waiting || sw;
            showBanner(true);
          }
        });
      });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    })
    .catch(() => {});
}

export function forceUpdate() {
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
  let reloaded = false;
  const onChange = () => {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  };
  navigator.serviceWorker?.addEventListener('controllerchange', onChange);
  setTimeout(() => location.reload(), 900);
}
