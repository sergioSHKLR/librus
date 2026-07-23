/**
 * Block 1 of 1 — settings/panel.js
 * Description: Language, clear data, update (provider URLs use built-ins)
 * Version: 1.g
 * Revised: 23Jul26
 */

import {
  loadSettings,
  saveSettings
} from '../shared/storage.js';
import { applyTheme } from '../shared/theme.js';
import { clearSiteData } from './export-import.js';
import { forceUpdate, refreshUpdateButton, isUpdateAvailable } from './update.js';
import { APP_VERSION, BUILD_ID } from '../shared/version.js';
import { t, applyI18n } from '../i18n/i18n.js';
import { assetBase } from '../shared/paths.js';

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
  refreshUpdateButton();
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
  if (lang) lang.value = 'en';
  const ver = $('settings-version');
  if (ver) ver.textContent = APP_VERSION + ' · ' + BUILD_ID;
}

function readForm() {
  const settings = loadSettings();
  settings.lang = 'en';
  /* Provider URLs / custom provider: built-ins only (UI hidden) */
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
      document.dispatchEvent(new CustomEvent('librus:settings-changed', { detail: settings }));
      if (settings.lang !== prevLang) {
        location.reload();
        return;
      }
      closeSettings();
    }
    if (tEl.closest('#btn-settings-update')) {
      if (!isUpdateAvailable()) return;
      forceUpdate();
    }
    if (tEl.closest('#btn-force-update')) forceUpdate();
    if (tEl.closest('#settings-clear')) {
      const ok = confirm(t(strings, 'settings.clearConfirm', 'Clear site data and reload?'));
      if (!ok) return;
      clearSiteData().then(() => location.reload());
    }
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
  const closeIcon = assetBase() + 'icons/close.svg';
  panel.innerHTML = `
  <div class="settings-card settings-card--wide">
    <header class="settings-header">
      <h2 id="settings-title" data-i18n="settings.title">Settings</h2>
      <button type="button" class="toolbar-btn" id="btn-settings-close" data-i18n-label="common.close" title="Close" aria-label="Close">
        <img src="${closeIcon}" class="toolbar-icon" alt="" width="20" height="20" />
      </button>
    </header>
    <div class="settings-body">
      <label class="settings-row"><span data-i18n="settings.language">Language</span>
        <select id="settings-lang">
          <option value="en">English</option>
          <option value="pt" disabled title="Soon">Português — Soon</option>
        </select>
      </label>
      <div class="settings-actions">
        <button type="button" class="settings-btn" id="btn-settings-update" data-i18n="settings.update" disabled>Update</button>
        <button type="button" class="settings-btn settings-btn-danger" id="settings-clear" data-i18n="settings.clear">Clear site data</button>
      </div>
      <p id="settings-status" class="settings-status" role="status"></p>
      <div class="settings-credits">
        <p class="settings-note" data-i18n-html="settings.builtWith">Built with <strong>Grok Build</strong>.</p>
      </div>
      <p class="settings-version">v<span id="settings-version">…</span></p>
    </div>
    <footer class="settings-footer">
      <button type="button" class="settings-btn settings-btn-primary" id="settings-apply" data-i18n="settings.apply">Apply</button>
    </footer>
  </div>`;

  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
  document.dispatchEvent(new CustomEvent('librus:settings-dom'));
  refreshUpdateButton();
}
