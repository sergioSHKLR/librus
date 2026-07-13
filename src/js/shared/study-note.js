/**
 * Block 1 of 1 — shared/study-note.js
 * Description: First-load splash — embossed brand, green gradient, bilingual post-it, polaroid
 * Version: 1.e
 * Revised: 13Jul26
 */

import { BRAND, STUDY_NOTE_KEY } from './constants.js';
import { assetUrl } from './paths.js';
import { loadSettings, saveSettings } from './storage.js';

const QUOTE_PT =
  'O estudo de uma doutrina só pode ser feito com utilidade por pessoas sérias, perseverantes, livres de prevenções e animadas de firme e sincera vontade de chegar a um resultado quando imprimem a seus estudos a continuidade, a regularidade e o recolhimento indispensáveis.';

const QUOTE_EN =
  'The study of a doctrine can only be fruitfully undertaken by serious, persevering individuals, free from bias, and animated by a firm and sincere desire to reach a result, when they bring to their studies the indispensable continuity, regularity, and concentration.';

const TAGLINE_EN = 'annotate to assimilate';
const TAGLINE_PT = 'anotar para assimilar';
const BETA_EN = 'beta';
const BETA_PT = 'beta';

/** Lang applied when the page booted (before splash choices). */
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
  /* Settings panel reloads on language change — same contract after splash pick. */
  if (chosen !== pageLang) {
    location.reload();
  }
}

/**
 * @param {'en'|'pt'} lang
 * @param {HTMLElement} root
 */
function applySplashLang(lang, root) {
  const code = lang === 'pt' ? 'pt' : 'en';
  const settings = loadSettings();
  if (settings.lang !== code) {
    saveSettings(Object.assign({}, settings, { lang: code }));
  }

  root.dataset.lang = code;
  document.documentElement.lang = code === 'pt' ? 'pt-BR' : 'en';

  const post = root.querySelector('.study-note-postit');
  if (post instanceof HTMLImageElement) {
    post.src = assetUrl(code === 'pt' ? 'images/splash/post-it-pt.png' : 'images/splash/post-it-en.png');
  }

  const text = root.querySelector('#study-note-text');
  if (text) text.textContent = code === 'pt' ? QUOTE_PT : QUOTE_EN;

  const enter = root.querySelector('.study-note-enter');
  if (enter) enter.textContent = code === 'pt' ? 'Entrar' : 'Enter';

  const brandName = root.querySelector('.study-note-brand-name');
  if (brandName) brandName.textContent = BRAND;

  const brandBeta = root.querySelector('.study-note-brand-beta');
  if (brandBeta) brandBeta.textContent = code === 'pt' ? BETA_PT : BETA_EN;

  const tagline = root.querySelector('.study-note-brand-tagline');
  if (tagline) tagline.textContent = code === 'pt' ? TAGLINE_PT : TAGLINE_EN;

  root.querySelectorAll('[data-splash-lang]').forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const on = btn.getAttribute('data-splash-lang') === code;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-active', on);
  });
}

function ensureDom(initialLang) {
  if (document.getElementById('study-note-modal')) return;

  const postSrc = assetUrl(
    initialLang === 'pt' ? 'images/splash/post-it-pt.png' : 'images/splash/post-it-en.png'
  );
  const pol0 = assetUrl('images/splash/polaroid-0.png');
  const pol1 = assetUrl('images/splash/polaroid-1.png');

  const root = document.createElement('div');
  root.id = 'study-note-modal';
  root.className = 'study-note-modal';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'study-note-text');
  root.dataset.lang = initialLang === 'pt' ? 'pt' : 'en';

  const brandIcon = assetUrl('icons/brand.svg');

  /* Layout: embossed brand · lang pill · composition · Enter */
  root.innerHTML =
    '<div class="study-note-backdrop" aria-hidden="true"></div>' +
    '<div class="study-note-brand" aria-hidden="false">' +
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
    '<button type="button" class="study-note-lang-btn" data-splash-lang="pt" aria-label="Português" title="Português">🇧🇷</button>' +
    '<button type="button" class="study-note-lang-btn" data-splash-lang="en" aria-label="English" title="English">🇺🇸</button>' +
    '</div>' +
    '<div class="study-note-stage">' +
    '<p id="study-note-text" class="visually-hidden"></p>' +
    '<img class="study-note-postit" src="' +
    postSrc +
    '" alt="" width="287" height="287" decoding="async" />' +
    '<div class="study-note-polaroid-wrap" aria-hidden="true">' +
    '<img class="study-note-polaroid study-note-polaroid--blank" src="' +
    pol0 +
    '" alt="" width="353" height="420" decoding="async" />' +
    '<img class="study-note-polaroid study-note-polaroid--photo" src="' +
    pol1 +
    '" alt="" width="353" height="420" decoding="async" />' +
    '</div>' +
    '</div>' +
    '<div class="study-note-enter-wrap">' +
    '<button type="button" class="study-note-enter" data-study-enter></button>' +
    '</div>';

  document.body.appendChild(root);
  applySplashLang(initialLang === 'pt' ? 'pt' : 'en', root);

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const langBtn = t.closest('[data-splash-lang]');
    if (langBtn instanceof HTMLElement) {
      const lang = langBtn.getAttribute('data-splash-lang') === 'pt' ? 'pt' : 'en';
      applySplashLang(lang, root);
      return;
    }
    if (t.closest('[data-study-enter]')) {
      enterApp();
    }
  });
}

function startPolaroidDevelop(root) {
  /* Blank frame first; then develop the portrait (polaroid-0 → polaroid-1). */
  root.classList.remove('is-developed');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.add('is-developed');
    });
  });
}

/**
 * Show first-load splash unless already dismissed.
 * Sets locale from the flag pill; Enter/Entrar dismisses (reloads if lang changed).
 * @param {{ lang?: string }} [opts]
 */
export function wireStudyNote(opts = {}) {
  if (isStudyNoteDismissed()) return;

  const settings = loadSettings();
  pageLang = opts.lang === 'pt' || opts.lang === 'en' ? opts.lang : settings.lang === 'pt' ? 'pt' : 'en';

  ensureDom(pageLang);
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
