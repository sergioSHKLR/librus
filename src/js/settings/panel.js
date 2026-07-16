/**
 * Block 1 of 1 — settings/panel.js
 * Description: Language, custom search URLs, clear data, update
 * Version: 1.f
 * Revised: 16Jul26
 */

import {
  loadSettings,
  saveSettings,
  defaultSearchTemplates
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

  const defaults = defaultSearchTemplates('en');
  const st = settings.searchTemplates || {};
  const wiki = $('settings-url-wiki');
  const dict = $('settings-url-dict');
  if (wiki) {
    wiki.placeholder = defaults.wiki;
    wiki.value = st.wiki || '';
  }
  if (dict) {
    dict.placeholder = defaults.dictionary;
    dict.value = st.dictionary || '';
  }
  const cp = settings.customProvider || {};
  const cLabel = $('settings-custom-label');
  const cUrl = $('settings-custom-url');
  const cIcon = $('settings-custom-icon');
  if (cLabel) cLabel.value = cp.label || 'Custom';
  if (cUrl) cUrl.value = cp.searchUrl || '';
  if (cIcon) cIcon.value = cp.icon || 'link';
}

function readForm() {
  const settings = loadSettings();
  settings.lang = 'en';
  settings.searchTemplates = {
    wiki: ($('settings-url-wiki')?.value || '').trim(),
    dictionary: ($('settings-url-dict')?.value || '').trim()
  };
  settings.customProvider = {
    label: ($('settings-custom-label')?.value || 'Custom').trim() || 'Custom',
    searchUrl: ($('settings-custom-url')?.value || '').trim(),
    icon: ($('settings-custom-icon')?.value || 'link').trim() || 'link'
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
      <h3 class="settings-subtitle" data-i18n="settings.searchUrls">Search URLs</h3>
      <p class="settings-note" data-i18n="settings.searchUrlsHint">Use {query} for the selected term. Leave blank for the built-in default.</p>
      <label class="settings-field">
        <span data-i18n="reader.providerWiki">Wikipedia</span>
        <input type="url" id="settings-url-wiki" class="settings-input" autocomplete="off" spellcheck="false" />
      </label>
      <label class="settings-field">
        <span data-i18n="reader.providerDict">Wiktionary</span>
        <input type="url" id="settings-url-dict" class="settings-input" autocomplete="off" spellcheck="false" />
      </label>
      <h3 class="settings-subtitle" data-i18n="settings.customProvider">Extra provider</h3>
      <p class="settings-note" data-i18n="settings.customProviderHint">Optional third consult source (link icon). Needs a search URL with {query}.</p>
      <label class="settings-field">
        <span data-i18n="settings.customLabel">Label</span>
        <input type="text" id="settings-custom-label" class="settings-input" maxlength="40" autocomplete="off" />
      </label>
      <label class="settings-field">
        <span data-i18n="settings.customIcon">Icon (Lucide name)</span>
        <input type="text" id="settings-custom-icon" class="settings-input" maxlength="48" autocomplete="off" placeholder="link" spellcheck="false" />
      </label>
      <p class="settings-note" data-i18n="settings.customIconHint">Must match a Lucide icon name (e.g. search, book, sparkles).</p>
      <label class="settings-field">
        <span data-i18n="settings.customUrl">Search URL</span>
        <input type="url" id="settings-custom-url" class="settings-input" autocomplete="off" spellcheck="false" placeholder="https://example.com/search?q={query}" />
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
