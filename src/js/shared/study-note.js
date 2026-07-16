/**
 * Block 1 of 1 — shared/study-note.js
 * Description: First-load splash — embossed LIBRUS, charcoal, post-it + polaroid
 * Version: 2.b
 * Revised: 16Jul26
 */

import { BRAND, STUDY_NOTE_KEY, SPLASH_MODE } from './constants.js';
import { assetUrl } from './paths.js';
import { loadSettings, saveSettings } from './storage.js';

/** Holmes-themed study quotes (public domain spirit, original phrasing for splash) */
const QUOTE_EN =
  'It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.';

const QUOTE_PT =
  'É um erro capital teorizar antes de ter dados. Insensivelmente começa-se a torcer os factos para os adaptar às teorias, em vez de adaptar as teorias aos factos.';

const TAGLINE_EN = 'annotate to assimilate';
const TAGLINE_PT = 'anotar para assimilar';
const BETA_EN = 'beta';
const BETA_PT = 'beta';
const POLAROID_CAPTION = 'The game is afoot!';

let pageLang = 'en';

export function isStudyNoteDismissed() {
  try {
    return localStorage.getItem(STUDY_NOTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissStudyNote() {
  try {
    localStorage.setItem(STUDY_NOTE_KEY, '1');
  } catch {
    /* private mode */
  }
  const el = document.getElementById('study-note-modal');
  if (el) {
    el.classList.add('is-hidden');
    el.setAttribute('hidden', '');
  }
  document.body.classList.remove('study-note-open');
}

function enterApp() {
  const chosen = loadSettings().lang === 'pt' ? 'pt' : 'en';
  dismissStudyNote();
  if (chosen !== pageLang) location.reload();
}

/**
 * @param {'en'|'pt'} lang
 * @param {HTMLElement} root
 */
function applySplashLang(lang, root) {
  /* LIBRUS: EN only (PT button disabled / Soon) */
  const code = 'en';
  const settings = loadSettings();
  if (settings.lang !== code) {
    saveSettings(Object.assign({}, settings, { lang: code }));
  }

  root.dataset.lang = code;
  document.documentElement.lang = 'en';

  const text = root.querySelector('#study-note-text');
  if (text) text.textContent = QUOTE_EN;

  const enter = root.querySelector('.study-note-enter');
  if (enter) enter.textContent = 'Enter';

  const brandName = root.querySelector('.study-note-brand-name');
  if (brandName) brandName.textContent = BRAND;

  const brandBeta = root.querySelector('.study-note-brand-beta');
  if (brandBeta) brandBeta.textContent = BETA_EN;

  const tagline = root.querySelector('.study-note-brand-tagline');
  if (tagline) tagline.textContent = TAGLINE_EN;

  const cap = root.querySelector('.study-note-polaroid-caption');
  if (cap) cap.textContent = POLAROID_CAPTION;

  root.querySelectorAll('[data-splash-lang]').forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const on = btn.getAttribute('data-splash-lang') === code;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-active', on);
  });
}

function ensureDom(initialLang) {
  if (document.getElementById('study-note-modal')) return;

  const brandIcon = assetUrl('icons/brand.svg');
  const photo = assetUrl('images/splash/watson.png');
  const withPolaroid = SPLASH_MODE === 'note+polaroid';

  const root = document.createElement('div');
  root.id = 'study-note-modal';
  root.className =
    'study-note-modal study-note-modal--charcoal' +
    (withPolaroid ? ' study-note-modal--polaroid' : ' study-note-modal--note-only');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'study-note-text');
  root.dataset.lang = initialLang === 'pt' ? 'pt' : 'en';
  root.dataset.splashMode = SPLASH_MODE || 'note+polaroid';

  let polaroidHtml = '';
  if (withPolaroid) {
    polaroidHtml =
      '<div class="study-note-polaroid" aria-hidden="false">' +
      '<div class="study-note-polaroid-photo">' +
      '<img class="study-note-polaroid-img" src="' +
      photo +
      '" alt="Watson" width="400" height="400" decoding="async" />' +
      '</div>' +
      '<p class="study-note-polaroid-caption"></p>' +
      '</div>';
  }

  root.innerHTML =
    '<div class="study-note-backdrop" aria-hidden="true"></div>' +
    '<div class="study-note-brand">' +
    '<img class="study-note-brand-icon" src="' +
    brandIcon +
    '" alt="" width="32" height="32" decoding="async" />' +
    '<div class="study-note-brand-text">' +
    '<p class="study-note-brand-title">' +
    '<span class="study-note-brand-name"></span>' +
    '<sup class="study-note-brand-beta"></sup>' +
    '</p>' +
    '<p class="study-note-brand-tagline"></p>' +
    '</div>' +
    '</div>' +
    '<div class="study-note-lang-pill" role="group" aria-label="Language / Idioma">' +
    '<button type="button" class="study-note-lang-btn" data-splash-lang="en" aria-label="English" title="English">🇺🇸</button>' +
    '<button type="button" class="study-note-lang-btn is-soon" data-splash-lang="pt" disabled aria-disabled="true" aria-label="Português — Soon" title="Soon">🇧🇷</button>' +
    '</div>' +
    '<div class="study-note-stage">' +
    '<div class="study-note-sheet">' +
    '<p id="study-note-text" class="study-note-sheet-text"></p>' +
    '</div>' +
    polaroidHtml +
    '</div>' +
    '<div class="study-note-enter-wrap">' +
    '<button type="button" class="study-note-enter" data-study-enter></button>' +
    '</div>';

  document.body.appendChild(root);
  applySplashLang('en', root);

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const langBtn = t.closest('[data-splash-lang]');
    if (langBtn instanceof HTMLElement) {
      if (langBtn.hasAttribute('disabled') || langBtn.getAttribute('aria-disabled') === 'true') {
        return;
      }
      applySplashLang(langBtn.getAttribute('data-splash-lang') === 'pt' ? 'pt' : 'en', root);
      return;
    }
    if (t.closest('[data-study-enter]')) enterApp();
  });
}

function startPolaroidDevelop(root) {
  if (!root.classList.contains('study-note-modal--polaroid')) return;
  root.classList.remove('is-developed');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.add('is-developed');
    });
  });
}

/**
 * @param {{ lang?: string }} [opts]
 */
export function wireStudyNote(opts = {}) {
  if (isStudyNoteDismissed()) return;
  pageLang = 'en';
  ensureDom('en');
  const el = document.getElementById('study-note-modal');
  if (!el) return;
  el.classList.remove('is-hidden');
  el.removeAttribute('hidden');
  document.body.classList.add('study-note-open');
  startPolaroidDevelop(el);
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && !isStudyNoteDismissed()) enterApp();
    },
    { once: false }
  );
}
