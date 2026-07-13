/**
 * Block 1 of 1 — settings/export-import.js
 * Description: Library + settings JSON export/import (no Hypothesis notes)
 * Version: 1.a
 * Revised: 10Jul26
 */

import { STORAGE_KEY, VIEWPORT_ALERT_KEY, STUDY_NOTE_KEY } from '../shared/constants.js';
import { loadSettings, saveSettings, defaultSettings } from '../shared/storage.js';
import { APP_VERSION, BUILD_ID } from '../shared/version.js';

const PACK_KIND = 'nano-ssg-library-v1';

export function buildExportPack() {
  return {
    kind: PACK_KIND,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    buildId: BUILD_ID,
    settings: loadSettings(),
    reading: loadReadingMap(),
    flags: {
      viewportAlertDismissed: (() => {
        try {
          return localStorage.getItem(VIEWPORT_ALERT_KEY) === '1';
        } catch {
          return false;
        }
      })()
    }
  };
}

function loadReadingMap() {
  try {
    const raw = localStorage.getItem('nano-ssg-reading');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function downloadExportPack() {
  const pack = buildExportPack();
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nano-ssg-library-v1.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * @param {object} pack
 * @returns {{ ok: boolean, message: string }}
 */
export function importExportPack(pack) {
  if (!pack || pack.kind !== PACK_KIND) {
    return { ok: false, message: 'Invalid pack (expected nano-ssg-library-v1)' };
  }
  const base = defaultSettings();
  const incoming = pack.settings || {};
  saveSettings(Object.assign({}, base, incoming, { version: 1 }));
  if (pack.reading && typeof pack.reading === 'object') {
    try {
      localStorage.setItem('nano-ssg-reading', JSON.stringify(pack.reading));
    } catch {
      /* ignore */
    }
  }
  if (pack.flags && pack.flags.viewportAlertDismissed) {
    try {
      localStorage.setItem(VIEWPORT_ALERT_KEY, '1');
    } catch {
      /* ignore */
    }
  }
  return { ok: true, message: 'Imported. Reloading…' };
}

export async function clearSiteData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEWPORT_ALERT_KEY);
    localStorage.removeItem(STUDY_NOTE_KEY);
    localStorage.removeItem('nano-ssg-reading');
    localStorage.removeItem('nano-ssg-debug');
  } catch {
    /* ignore */
  }
  if (window.caches && caches.keys) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  if (navigator.serviceWorker) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
}
