/**
 * Block 1 of 1 — settings/panel.js
 * Description: App settings — language + pack I/O (type/links live on reader)
 * Version: 1.c
 * Revised: 260711 12:00
 */

import { loadSettings, saveSettings } from '../shared/storage.js';
import { applyTheme } from '../shared/theme.js';
import { downloadExportPack, importExportPack, clearSiteData } from './export-import.js';
import { forceUpdate } from './update.js';
import { APP_VERSION, BUILD_ID } from '../shared/version.js';
import { t, applyI18n } from '../i18n/i18n.js';

let strings = {};
let themeUi = {};

export function setSettingsStrings(s) {
  strings = s || {};
}

function $(id) {
  return document.getElementById(id);
}

export function openSettings() {
  ensureSettingsDom();
  const panel = $('settings-panel');
  const backdrop = $('settings-backdrop');
  if (!panel) return;
  panel.classList.remove('is-hidden');
  panel.removeAttribute('hidden');
  if (backdrop) {
    backdrop.classList.remove('is-hidden');
    backdrop.removeAttribute('hidden');
  }
  if (strings && Object.keys(strings).length) applyI18n(panel, strings);
  syncForm(loadSettings());
}

export function closeSettings() {
  const panel = $('settings-panel');
  const backdrop = $('settings-backdrop');
  if (panel) {
    panel.classList.add('is-hidden');
    panel.setAttribute('hidden', '');
  }
  if (backdrop) {
    backdrop.classList.add('is-hidden');
    backdrop.setAttribute('hidden', '');
  }
}

function syncForm(settings) {
  const lang = $('settings-lang');
  if (lang) lang.value = settings.lang || 'en';
  const ver = $('settings-version');
  if (ver) ver.textContent = APP_VERSION + ' · ' + BUILD_ID;
}

function readForm() {
  const settings = loadSettings();
  settings.lang = $('settings-lang')?.value === 'pt' ? 'pt' : 'en';
  /* theme / type / density stay outside this panel */
  return settings;
}

let wired = false;

export function wireSettingsPanel(opts = {}) {
  setSettingsStrings(opts.strings || {});
  themeUi = opts.themeUi || {};
  ensureSettingsDom();

  if (wired) return;
  wired = true;

  document.addEventListener('click', (e) => {
    const tEl = e.target;
    if (!(tEl instanceof Element)) return;
    if (tEl.closest('#btn-settings')) {
      e.preventDefault();
      openSettings();
    }
    if (tEl.closest('#btn-settings-close') || tEl.id === 'settings-backdrop') {
      closeSettings();
    }
    if (tEl.closest('#settings-apply')) {
      let settings = readForm();
      const prevLang = loadSettings().lang;
      settings = saveSettings(settings);
      applyTheme(settings.theme, themeUi);
      document.dispatchEvent(new CustomEvent('nano:settings-changed', { detail: settings }));
      if (settings.lang !== prevLang) {
        location.reload();
        return;
      }
      closeSettings();
    }
    if (tEl.closest('#settings-export')) downloadExportPack();
    if (tEl.closest('#settings-import')) $('settings-import-file')?.click();
    if (tEl.closest('#btn-settings-force-update') || tEl.closest('#btn-force-update')) forceUpdate();
    if (tEl.closest('#settings-clear')) {
      const ok = confirm(t(strings, 'settings.clearConfirm', 'Clear site data and reload?'));
      if (!ok) return;
      clearSiteData().then(() => location.reload());
    }
  });

  document.addEventListener('change', async (e) => {
    const tEl = e.target;
    if (!(tEl instanceof HTMLInputElement) || tEl.id !== 'settings-import-file') return;
    const file = tEl.files && tEl.files[0];
    if (!file) return;
    try {
      const pack = JSON.parse(await file.text());
      const result = importExportPack(pack);
      const status = $('settings-status');
      if (status) status.textContent = result.message;
      if (result.ok) setTimeout(() => location.reload(), 400);
    } catch (err) {
      const status = $('settings-status');
      if (status) status.textContent = String(err.message || err);
    }
    tEl.value = '';
  });
}

export function ensureSettingsDom() {
  if ($('settings-panel')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'settings-backdrop';
  backdrop.className = 'settings-backdrop is-hidden';
  backdrop.hidden = true;

  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.className = 'settings-panel is-hidden';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.innerHTML = `
  <div class="settings-card">
    <header class="settings-header">
      <h2 id="settings-title" data-i18n="settings.title">Settings</h2>
      <button type="button" class="toolbar-btn" id="btn-settings-close" aria-label="Close">×</button>
    </header>
    <div class="settings-body">
      <label class="settings-row"><span data-i18n="settings.language">Language</span>
        <select id="settings-lang"><option value="en">English</option><option value="pt">Português</option></select>
      </label>
      <p class="settings-note" data-i18n="settings.notesNote">Notes live in your Hypothes.is account (not exported here).</p>
      <p class="settings-note">Typography and research links are controlled in the reader. Theme cycles on the library toolbar.</p>
      <div class="settings-actions">
        <button type="button" class="settings-btn" id="settings-export" data-i18n="settings.export">Export library pack</button>
        <button type="button" class="settings-btn" id="settings-import" data-i18n="settings.import">Import library pack</button>
        <input type="file" id="settings-import-file" accept="application/json,.json" hidden />
        <button type="button" class="settings-btn" id="btn-settings-force-update" data-i18n="settings.forceUpdate">Force update</button>
        <button type="button" class="settings-btn settings-btn-danger" id="settings-clear" data-i18n="settings.clear">Clear site data</button>
      </div>
      <p id="settings-status" class="settings-status" role="status"></p>
      <p class="settings-version">v<span id="settings-version">…</span></p>
    </div>
    <footer class="settings-footer">
      <button type="button" class="settings-btn settings-btn-primary" id="settings-apply" data-i18n="settings.apply">Apply</button>
    </footer>
  </div>`;

  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
}
