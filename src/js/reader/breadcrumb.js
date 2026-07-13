/**
 * Block 1 of 1 — reader/breadcrumb.js
 * Description: Second-row breadcrumb — slug / Part N / numbers only
 * Version: 1.c
 * Revised: 12Jul26
 */

/** @typedef {{ id: string, level: number, text: string, el: Element }} HeadingRef */

/** @type {HeadingRef[]} */
let headings = [];
/** @type {IntersectionObserver | null} */
let observer = null;
/** @type {string} */
let activeId = '';
/** @type {Set<(id: string) => void>} */
const listeners = new Set();
/** Localized "Part" / "Parte" */
let partLabel = 'Part';

function cleanHeadingText(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/^\*+|\*+$/g, '')
    .trim();
}

/**
 * Set localized Part/Parte label (call after i18n load).
 * @param {string} label
 */
export function setBreadcrumbPartLabel(label) {
  if (label) partLabel = label;
  if (activeId) renderBreadcrumb(activeId);
  else renderBreadcrumb('');
}

/**
 * Collect h1–h5 with ids inside the book root.
 * @returns {HeadingRef[]}
 */
export function collectHeadings() {
  const root = document.getElementById('book-root');
  if (!root) return [];
  const nodes = root.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id]');
  headings = Array.from(nodes).map((el) => ({
    id: el.id,
    level: parseInt(el.tagName.slice(1), 10),
    text: cleanHeadingText(el.textContent),
    el
  }));
  return headings;
}

export function getHeadings() {
  return headings;
}

export function getActiveHeadingId() {
  return activeId;
}

/** @param {(id: string) => void} fn */
export function onActiveHeading(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(id) {
  for (const fn of listeners) {
    try {
      fn(id);
    } catch {
      /* ignore listener errors */
    }
  }
}

/**
 * Extract dotted section number from heading text or id.
 * Examples: "0.03.01. Intro" → "0.03.01"; id "0-03-01" → "0.03.01"; "Q.12" → "12"
 * @param {HeadingRef} h
 * @returns {string}
 */
function extractNumber(h) {
  const text = h.text || '';
  /* Leading dotted numbers: 0. / 0.03. / 0.03.01. */
  const dotted = text.match(/^(\d+(?:\.\d+)*)\b/);
  if (dotted) return dotted[1];

  /* Question-style: Q.12 / #️⃣ Q.12 → keep Q. prefix for H5 crumbs */
  const q = text.match(/\bQ\.?\s*(\d+)\b/i);
  if (q) return 'Q.' + q[1];

  /* Id: q12 → Q.12; 0-03-01 → 0.03.01; plain 3 → 3 */
  const id = h.id || '';
  const qId = id.match(/^q(\d+)$/i);
  if (qId) return 'Q.' + qId[1];
  if (/^\d+(-\d+)*$/.test(id)) return id.replace(/-/g, '.');
  if (/^\d+$/.test(id)) return id;

  return id || text || '';
}

/**
 * Compact crumb label per level.
 * H1 → SLUG (caps); H2 → Part|Parte N; H3–H5 → number only.
 * @param {HeadingRef} h
 * @returns {{ label: string, title: string }}
 */
function crumbLabel(h) {
  const full = h.text || h.id;
  if (h.level === 1) {
    const slug = (document.body.dataset.bookSlug || h.id || 'book').toUpperCase();
    return { label: slug, title: full };
  }
  if (h.level === 2) {
    const num = extractNumber(h);
    return { label: partLabel + ' ' + num, title: full };
  }
  const num = extractNumber(h);
  return { label: num, title: full };
}

/**
 * Ancestor chain for a heading index (inclusive).
 * @param {number} idx
 * @returns {HeadingRef[]}
 */
function chainForIndex(idx) {
  if (idx < 0 || idx >= headings.length) return [];
  const chain = [];
  let minLevel = Infinity;
  for (let i = idx; i >= 0; i--) {
    const h = headings[i];
    if (h.level < minLevel) {
      chain.unshift(h);
      minLevel = h.level;
      if (h.level <= 1) break;
    }
  }
  return chain;
}

function findIndexById(id) {
  return headings.findIndex((h) => h.id === id);
}

function bookSlugCaps() {
  return (document.body.dataset.bookSlug || 'book').toUpperCase();
}

function renderBreadcrumb(id) {
  const nav = document.getElementById('reader-breadcrumb');
  if (!nav) return;

  const idx = findIndexById(id);
  const chain = idx >= 0 ? chainForIndex(idx) : [];

  nav.innerHTML = '';
  if (!chain.length) {
    const span = document.createElement('span');
    span.className = 'toolbar-breadcrumb-empty';
    span.id = 'breadcrumb-empty';
    const slug = bookSlugCaps();
    span.textContent = slug;
    span.title = document.body.dataset.bookTitle || slug;
    nav.appendChild(span);
    return;
  }

  chain.forEach((item, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      nav.appendChild(sep);
    }
    const { label, title } = crumbLabel(item);
    const isLast = i === chain.length - 1;
    if (isLast) {
      const span = document.createElement('span');
      span.className = 'crumb is-current';
      span.textContent = label;
      span.title = title;
      nav.appendChild(span);
    } else {
      const a = document.createElement('a');
      a.className = 'crumb';
      a.href = '#' + item.id;
      a.textContent = label;
      a.title = title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToHeading(item.id);
      });
      nav.appendChild(a);
    }
  });
}

export function scrollToHeading(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', '#' + id);
  setActiveHeading(id);
}

function setActiveHeading(id) {
  if (id === activeId) {
    renderBreadcrumb(activeId);
    return;
  }
  activeId = id || '';
  renderBreadcrumb(activeId);
  notify(activeId);
}

/**
 * Wire IntersectionObserver on middle-content scroll.
 */
export function wireBreadcrumb() {
  collectHeadings();
  renderBreadcrumb('');

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  const root = document.getElementById('middle-content');
  if (!root || !headings.length) return;

  const ratios = new Map();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!id) continue;
        ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      let bestId = '';
      let bestRatio = 0;
      for (const h of headings) {
        const r = ratios.get(h.id) || 0;
        if (r > bestRatio) {
          bestRatio = r;
          bestId = h.id;
        }
      }
      if (!bestId) {
        const mid = root.getBoundingClientRect().top + 48;
        for (const h of headings) {
          const top = h.el.getBoundingClientRect().top;
          if (top <= mid + 8) bestId = h.id;
        }
      }
      if (bestId) setActiveHeading(bestId);
    },
    {
      root,
      rootMargin: '-8% 0px -70% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 1]
    }
  );

  for (const h of headings) observer.observe(h.el);

  const hash = (location.hash || '').replace(/^#/, '');
  if (hash && document.getElementById(hash)) {
    setActiveHeading(hash);
  } else if (headings[0]) {
    setActiveHeading(headings[0].id);
  }
}
