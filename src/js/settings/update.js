/**
 * Block 1 of 1 — settings/update.js
 * Description: Service worker update banner + settings Update button
 * Version: 1.b
 * Revised: 13Jul26
 */

import { assetBase } from '../shared/paths.js';

let waitingWorker = null;
let updateAvailable = false;

function showBanner(on) {
  const banner = document.getElementById('update-banner');
  if (!banner) return;
  banner.classList.toggle('is-hidden', !on);
  if (on) banner.removeAttribute('hidden');
  else banner.setAttribute('hidden', '');
}

function syncUpdateButtons() {
  const btn = document.getElementById('btn-settings-update');
  if (!btn) return;
  btn.disabled = !updateAvailable;
  btn.classList.toggle('is-disabled', !updateAvailable);
  btn.setAttribute('aria-disabled', updateAvailable ? 'false' : 'true');
}

export function isUpdateAvailable() {
  return updateAvailable;
}

export function ensureUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  const el = document.createElement('div');
  el.id = 'update-banner';
  el.className = 'update-banner is-hidden';
  el.hidden = true;
  el.innerHTML =
    '<span data-i18n="update.available">Update available</span>' +
    '<button type="button" id="btn-force-update" data-i18n="update.reload">Update</button>';
  document.body.appendChild(el);
}

function markUpdateAvailable(worker) {
  waitingWorker = worker || waitingWorker;
  updateAvailable = true;
  showBanner(true);
  syncUpdateButtons();
  document.dispatchEvent(new CustomEvent('librus:update-available'));
}

export function wirePwaUpdates() {
  if (!('serviceWorker' in navigator)) {
    updateAvailable = false;
    syncUpdateButtons();
    return;
  }
  ensureUpdateBanner();
  syncUpdateButtons();

  const swUrl = assetBase() + 'sw.js';
  navigator.serviceWorker
    .register(swUrl)
    .then((reg) => {
      if (!reg) return;
      if (reg.waiting) {
        markUpdateAvailable(reg.waiting);
      }
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            markUpdateAvailable(reg.waiting || sw);
          }
        });
      });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    })
    .catch(() => {});

  document.getElementById('btn-force-update')?.addEventListener('click', () => forceUpdate());
  document.addEventListener('librus:settings-dom', () => syncUpdateButtons());
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

/** Call after settings DOM is created so the button reflects state */
export function refreshUpdateButton() {
  syncUpdateButtons();
}
