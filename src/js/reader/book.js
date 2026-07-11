/**
 * Block 1 of 1 — reader/book.js
 * Description: Fetch body.html into book-root; wire in-book links (wide consult)
 * Version: 1.a
 * Revised: 10Jul26
 */

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
    const bases = {
      l: 'https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item=',
      w: 'https://pt.wikipedia.org/wiki/',
      d: 'https://pt.wiktionary.org/wiki/',
      /* legacy m: → Wikipedia (maps pack folded) */
      m: 'https://pt.wikipedia.org/wiki/'
    };
    return (bases[code] || '') + slug;
  }
  return href;
}

export function wireBookLinks(root) {
  const el = root || document.getElementById('book-root');
  if (!el) return;

  el.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        const target = document.getElementById(id) || el.querySelector('[id="' + CSS.escape(id) + '"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const target =
    document.getElementById(hash) ||
    (root && root.querySelector('[id="' + CSS.escape(hash) + '"]'));
  if (target) target.scrollIntoView({ block: 'start' });
}
