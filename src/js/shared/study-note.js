/**
 * Block 1 of 1 — shared/study-note.js
 * Description: First-load pale post-it modal (Kardec study quote)
 * Version: 1.a
 * Revised: 13Jul26
 */

import { STUDY_NOTE_KEY } from './constants.js';

const QUOTE =
  '… o estudo de uma doutrina …, só pode ser feito com utilidade por pessoas sérias, perseverantes, livres de prevenções e animadas de firme e sincera vontade de chegar a um resultado.  … imprimem a seus estudos a continuidade, a regularidade e o recolhimento indispensáveis.';

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

function ensureDom(dismissLabel) {
  if (document.getElementById('study-note-modal')) return;

  const root = document.createElement('div');
  root.id = 'study-note-modal';
  root.className = 'study-note-modal';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'study-note-text');

  root.innerHTML =
    '<div class="study-note-backdrop" data-study-dismiss></div>' +
    '<div class="study-note-sheet">' +
    '<p id="study-note-text" class="study-note-text"></p>' +
    '<p class="study-note-attr">— Allan Kardec</p>' +
    '<button type="button" class="study-note-dismiss" data-study-dismiss></button>' +
    '</div>';

  document.body.appendChild(root);

  const text = root.querySelector('#study-note-text');
  if (text) text.textContent = QUOTE;
  const btn = root.querySelector('.study-note-dismiss');
  if (btn) btn.textContent = dismissLabel || 'OK';

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t instanceof Element && t.closest('[data-study-dismiss]')) {
      dismissStudyNote();
    }
  });
}

/**
 * Show first-load post-it unless already dismissed.
 * @param {{ dismissLabel?: string }} [opts]
 */
export function wireStudyNote(opts = {}) {
  if (isStudyNoteDismissed()) return;
  ensureDom(opts.dismissLabel);
  const el = document.getElementById('study-note-modal');
  if (!el) return;
  el.classList.remove('is-hidden');
  el.removeAttribute('hidden');
  document.body.classList.add('study-note-open');

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && !isStudyNoteDismissed()) dismissStudyNote();
    },
    { once: false }
  );
}
