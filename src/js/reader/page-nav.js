/**
 * Block 1 of 1 — reader/page-nav.js
 * Description: PDF page jump control (from []{#page-N} → #page-N)
 * Version: 1.a
 * Revised: 20Jul26
 */

import { scrollToBookId } from './book.js';

/** @type {number[]} */
let pageList = [];
/** @type {number|null} */
let currentPage = null;

function $(id) {
  return document.getElementById(id);
}

function setVisible(on) {
  const nav = $('pdf-page-nav');
  if (!nav) return;
  nav.hidden = !on;
  nav.classList.toggle('is-hidden', !on);
}

function nearestPageIndex(n) {
  if (!pageList.length) return -1;
  let best = 0;
  let bestDist = Math.abs(pageList[0] - n);
  for (let i = 1; i < pageList.length; i++) {
    const d = Math.abs(pageList[i] - n);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  }
  return best;
}

function updateChrome() {
  const input = $('pdf-page-input');
  const label = $('pdf-page-label');
  const prev = $('btn-pdf-page-prev');
  const next = $('btn-pdf-page-next');
  if (input && currentPage != null) input.value = String(currentPage);
  if (label && pageList.length) {
    label.textContent =
      (currentPage != null ? String(currentPage) : '—') + ' / ' + pageList[pageList.length - 1];
  }
  const idx = currentPage != null ? pageList.indexOf(currentPage) : -1;
  if (prev) prev.disabled = idx <= 0;
  if (next) next.disabled = idx < 0 || idx >= pageList.length - 1;
}

/**
 * @param {number} n
 * @param {{ smooth?: boolean, replaceHash?: boolean }} [opts]
 */
export function goToPdfPage(n, opts = {}) {
  if (!pageList.length) return false;
  const num = parseInt(String(n), 10);
  if (!Number.isFinite(num)) return false;
  let target = num;
  if (!pageList.includes(target)) {
    const i = nearestPageIndex(target);
    if (i < 0) return false;
    target = pageList[i];
  }
  const id = 'page-' + target;
  if (!scrollToBookId(id, document.getElementById('book-root'), { smooth: opts.smooth !== false })) {
    return false;
  }
  currentPage = target;
  updateChrome();
  if (opts.replaceHash !== false) {
    try {
      history.replaceState(null, '', '#' + id);
    } catch {
      /* ignore */
    }
  }
  return true;
}

function step(delta) {
  if (!pageList.length || currentPage == null) {
    if (pageList.length) goToPdfPage(pageList[0]);
    return;
  }
  const idx = pageList.indexOf(currentPage);
  const next = idx + delta;
  if (next < 0 || next >= pageList.length) return;
  goToPdfPage(pageList[next]);
}

function onSubmit(ev) {
  ev?.preventDefault?.();
  const input = $('pdf-page-input');
  if (!input) return;
  goToPdfPage(input.value);
}

/**
 * Load pages.json for this book and wire controls (hidden if no pages).
 */
export async function wirePageNav() {
  const nav = $('pdf-page-nav');
  if (!nav) return;

  setVisible(false);
  pageList = [];
  currentPage = null;

  try {
    const res = await fetch('pages.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    const pages = Array.isArray(data.pages) ? data.pages.map(Number).filter((n) => n > 0) : [];
    if (!pages.length) return;
    pageList = pages;
  } catch {
    return;
  }

  setVisible(true);
  const min = pageList[0];
  const max = pageList[pageList.length - 1];
  const input = $('pdf-page-input');
  if (input) {
    input.min = String(min);
    input.max = String(max);
    input.placeholder = String(min);
  }

  /* Seed current from hash or first page marker in view */
  const hash = (location.hash || '').replace(/^#/, '');
  const hm = /^page-(\d+)$/i.exec(hash);
  if (hm) {
    currentPage = parseInt(hm[1], 10);
  } else if (pageList.length) {
    currentPage = pageList[0];
  }
  updateChrome();

  $('btn-pdf-page-prev')?.addEventListener('click', () => step(-1));
  $('btn-pdf-page-next')?.addEventListener('click', () => step(1));
  $('pdf-page-form')?.addEventListener('submit', onSubmit);
  input?.addEventListener('change', onSubmit);

  document.addEventListener('keydown', (ev) => {
    if (!pageList.length) return;
    if (ev.altKey && ev.key === 'ArrowLeft') {
      ev.preventDefault();
      step(-1);
    } else if (ev.altKey && ev.key === 'ArrowRight') {
      ev.preventDefault();
      step(1);
    }
  });

  /* Track visible page while scrolling */
  const markers = document.querySelectorAll('.pdf-page-start[data-page]');
  if (markers.length && typeof IntersectionObserver === 'function') {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => parseInt(e.target.getAttribute('data-page') || '', 10))
          .filter((n) => Number.isFinite(n));
        if (!visible.length) return;
        visible.sort((a, b) => a - b);
        currentPage = visible[0];
        updateChrome();
      },
      { root: null, rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    markers.forEach((el) => obs.observe(el));
  }
}
