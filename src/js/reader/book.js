/**
 * Block 1 of 1 — reader/book.js
 * Description: Fetch body.html into book-root; wire in-book links (wide consult)
 * Version: 1.c
 * Revised: 16Jul26
 */

import { loadSettings } from '../shared/storage.js';
import { computeIsWide } from './layout.js';
import { openContextUrl } from './context.js';

export async function loadBookBody() {
  const root = document.getElementById('book-root');
  if (!root) return;

  const inline = root.querySelector('.book');
  if (inline && !root.dataset.forceFetch) {
    wireBookLinks(root);
    return;
  }

  const file = document.body.dataset.bookFile || 'body.html';
  try {
    const res = await fetch(file, { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    root.innerHTML = await res.text();
  } catch (err) {
    root.innerHTML =
      '<article class="book book-stub"><p>Could not load book body.</p><p class="book-meta">' +
      String(err.message || err) +
      '</p></article>';
  }
  wireBookLinks(root);
}

function resolveProviderHref(a) {
  const provider = a.getAttribute('data-link-provider');
  const href = a.getAttribute('href') || '';
  if (provider && a.dataset.resolvedHref) return a.dataset.resolvedHref;
  const m = href.match(/^([lwdm]):(.+)$/);
  if (m) {
    const code = m[1];
    const slug = m[2];
    /* LIBRUS: wiki/dict follow UI locale (EN default; PT when unlocked) */
    const lang = loadSettings().lang === 'pt' ? 'pt' : 'en';
    const wiki = 'https://' + lang + '.wikipedia.org/wiki/';
    const dict = 'https://' + lang + '.wiktionary.org/wiki/';
    const bases = {
      /* Luz removed from LIBRUS — map legacy l: to wiki */
      l: wiki,
      w: wiki,
      d: dict,
      /* legacy m: → Wikipedia (maps pack folded) */
      m: wiki
    };
    return (bases[code] || '') + slug;
  }
  return href;
}

/**
 * Open closed <details> ancestors so in-page anchors (e.g. index terms) are visible.
 * @param {Element} el
 */
function openDetailsAncestors(el) {
  let p = el.parentElement;
  while (p) {
    if (p instanceof HTMLDetailsElement) p.open = true;
    p = p.parentElement;
  }
}

/**
 * Scroll to an in-book id, expanding collapsible blocks if needed.
 * @param {string} id
 * @param {ParentNode} [scope]
 * @param {{ smooth?: boolean }} [opts]
 * @returns {boolean}
 */
export function scrollToBookId(id, scope, opts = {}) {
  if (!id) return false;
  const root = scope || document.getElementById('book-root') || document;
  let target = null;
  try {
    target =
      (root instanceof Element ? root.ownerDocument : document).getElementById(id) ||
      root.querySelector('[id="' + CSS.escape(id) + '"]');
  } catch {
    target = root.querySelector('[id="' + String(id).replace(/"/g, '') + '"]');
  }
  if (!target) return false;
  openDetailsAncestors(target);
  target.scrollIntoView({
    behavior: opts.smooth === false ? 'auto' : 'smooth',
    block: 'start'
  });
  return true;
}

export function wireBookLinks(root) {
  const el = root || document.getElementById('book-root');
  if (!el) return;

  el.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const id = decodeURIComponent(href.slice(1));
        if (scrollToBookId(id, el, { smooth: true })) {
          history.replaceState(null, '', '#' + id);
        }
        return;
      }

      const isProvider =
        a.hasAttribute('data-link-provider') || /^[lwdm]:/.test(href);

      if (!isProvider) return;

      /* Narrow: zero links — CSS already disables; belt-and-suspenders */
      if (!computeIsWide()) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const url = resolveProviderHref(a);
      const label = (a.textContent || '').trim();
      openContextUrl(url, label);
    });
  });
}

export function applyDeepLink() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return;
  const root = document.getElementById('book-root');
  scrollToBookId(decodeURIComponent(hash), root || document, { smooth: false });
}
