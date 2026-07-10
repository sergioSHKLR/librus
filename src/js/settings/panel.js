/**
 * Block 1 of 1 — settings/panel.js
 * Description: Settings overlay — theme, type, density, export/import, updates
 * Version: 1.a
 * Revised: 260710 18:30
 */

import { loadSettings, saveSettings, FONT_SCALES, LINE_HEIGHTS } from '../shared/storage.js';
import { applyTheme, applyTypography } from '../shared/theme.js';
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
  const theme = $('settings-theme');
  if (theme) theme.value = settings.theme || 'system';
  const font = $('settings-font');
  if (font) font.value = String(settings.fontScale ?? 1);
  const lh = $('settings-line-height');
  if (lh) lh.value = String(settings.lineHeight ?? 1.6);
  const dens = $('settings-density');
  if (dens) dens.value = settings.linkDensity || 'med';
  const prov = settings.linkProviders || {};
  ['l', 'w', 'd', 'm'].forEach((code) => {
    const el = $('settings-prov-' + code);
    if (el) el.checked = prov[code] !== false;
  });
  const ver = $('settings-version');
  if (ver) ver.textContent = APP_VERSION + ' · ' + BUILD_ID;
}

function readForm() {
  const settings = loadSettings();
  settings.lang = $('settings-lang')?.value === 'pt' ? 'pt' : 'en';
  const th = $('settings-theme')?.value;
  settings.theme = th === 'light' || th === 'dark' ? th : 'system';
  const fs = Number($('settings-font')?.value);
  settings.fontScale = FONT_SCALES.includes(fs) ? fs : 1;
  const line = Number($('settings-line-height')?.value);
  settings.lineHeight = LINE_HEIGHTS.includes(line) ? line : 1.6;
  const dens = $('settings-density')?.value;
  settings.linkDensity = ['lo', 'med', 'hi'].includes(dens) ? dens : 'med';
  settings.linkProviders = {
    l: !!$('settings-prov-l')?.checked,
    w: !!$('settings-prov-w')?.checked,
    d: !!$('settings-prov-d')?.checked,
    m: !!$('settings-prov-m')?.checked
  };
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
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('#btn-settings')) {
      e.preventDefault();
      openSettings();
    }
    if (t.closest('#btn-settings-close') || t.id === 'settings-backdrop') {
      closeSettings();
    }
    if (t.closest('#settings-apply')) {
      let settings = readForm();
      const prevLang = loadSettings().lang;
      settings = saveSettings(settings);
      applyTypography(settings);
      applyTheme(settings.theme, themeUi);
      document.dispatchEvent(new CustomEvent('nano:settings-changed', { detail: settings }));
      if (settings.lang !== prevLang) {
        location.reload();
        return;
      }
      closeSettings();
    }
    if (t.closest('#settings-export')) downloadExportPack();
    if (t.closest('#settings-import')) $('settings-import-file')?.click();
    if (t.closest('#btn-settings-force-update') || t.closest('#btn-force-update')) forceUpdate();
    if (t.closest('#settings-clear')) {
      const ok = confirm(t(strings, 'settings.clearConfirm', 'Clear site data and reload?'));
      if (!ok) return;
      clearSiteData().then(() => location.reload());
    }
  });

  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || t.id !== 'settings-import-file') return;
    const file = t.files && t.files[0];
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
    t.value = '';
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
      <label class="settings-row"><span data-i18n="settings.theme">Theme</span>
        <select id="settings-theme">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label class="settings-row"><span data-i18n="settings.fontSize">Font size</span>
        <select id="settings-font">
          <option value="0.875">S</option>
          <option value="1">M</option>
          <option value="1.125">L</option>
          <option value="1.25">XL</option>
        </select>
      </label>
      <label class="settings-row"><span data-i18n="settings.lineHeight">Line height</span>
        <select id="settings-line-height">
          <option value="1.45">Tight</option>
          <option value="1.6">Normal</option>
          <option value="1.75">Relaxed</option>
        </select>
      </label>
      <label class="settings-row"><span data-i18n="settings.density">Link density</span>
        <select id="settings-density">
          <option value="lo">LO</option>
          <option value="med">MED</option>
          <option value="hi">HI</option>
        </select>
      </label>
      <fieldset class="settings-fieldset">
        <legend data-i18n="settings.providers">Providers</legend>
        <label><input type="checkbox" id="settings-prov-l" checked /> Luz (l)</label>
        <label><input type="checkbox" id="settings-prov-w" checked /> Wiki (w)</label>
        <label><input type="checkbox" id="settings-prov-d" checked /> Dict (d)</label>
        <label><input type="checkbox" id="settings-prov-m" checked /> Map (m)</label>
      </fieldset>
      <p class="settings-note" data-i18n="settings.notesNote">Notes live in your Hypothes.is account (not exported here).</p>
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
