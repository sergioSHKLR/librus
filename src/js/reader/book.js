/**
 * Block 1 of 1 — reader/book.js
 * Description: Fetch body.html into book-root; wire in-book links (wide consult)
 * Version: 1.e
 * Revised: 21Jul26
 */

import { loadSettings } from '../shared/storage.js';
import { computeIsWide } from './layout.js';
import { openContextUrl } from './context.js';

/**
 * Build a youtube-nocookie embed URL that keeps fullscreen enabled.
 * @param {string} id
 * @returns {string}
 */
function youtubeEmbedUrl(id) {
  const u = new URL('https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id));
  u.searchParams.set('fs', '1');
  u.searchParams.set('playsinline', '1');
  return u.toString();
}

/**
 * Rewrite YouTube watch / youtu.be / shorts → embeddable nocookie embed URL.
 * Other http(s) URLs pass through unchanged.
 * @param {string} url
 * @returns {string}
 */
export function toContextEmbedUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.href);
    const host = (u.hostname || '').replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) return youtubeEmbedUrl(id);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (/\/embed\//i.test(u.pathname)) {
        const parts = u.pathname.split('/').filter(Boolean);
        const emb = parts[parts.length - 1];
        if (emb) return youtubeEmbedUrl(emb);
        u.hostname = 'www.youtube-nocookie.com';
        u.searchParams.set('fs', '1');
        return u.toString();
      }
      const v = u.searchParams.get('v');
      if (v) return youtubeEmbedUrl(v);
      const shorts = u.pathname.match(/\/shorts\/([^/?#]+)/i);
      if (shorts) return youtubeEmbedUrl(shorts[1]);
    }
  } catch {
    /* ignore */
  }
  return url;
}

export async function loadBookBody() {
  const root = document.getElementById('book-root');
  if (!root) return;

  const inline = root.querySelector('.book');
  if (inline && !root.dataset.forceFetch) {
    wireBookLinks(root);
    return;
  }

  /* Ignore unreplaced template tokens from a partial stamp */
  let file = (document.body.dataset.bookFile || 'body.html').trim();
  if (!file || file.includes('{{') || file.includes('}}')) file = 'body.html';
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
    /* LIBRUS: wiki/dict follow UI locale (EN default) */
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
      const isHttp = /^https?:\/\//i.test(href);

      /* External http(s) — consult pane when wide; new tab when narrow */
      if (isHttp && !isProvider) {
        const label = (a.textContent || '').trim();
        const url = toContextEmbedUrl(href);
        if (!computeIsWide()) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          if (url !== href) a.setAttribute('href', url);
          return;
        }
        e.preventDefault();
        openContextUrl(url, label, /youtube/i.test(url) ? 'youtube' : '');
        return;
      }

      if (!isProvider) return;

      /* Narrow: zero research links — CSS already disables; belt-and-suspenders */
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
