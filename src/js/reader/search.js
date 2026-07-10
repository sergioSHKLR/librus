/**
 * Block 1 of 1 — reader/search.js
 * Description: In-book text search with mark highlights
 * Version: 1.a
 * Revised: 260710 17:00
 */

let hits = [];
let hitIndex = -1;

function clearMarks(root) {
  root.querySelectorAll('mark.search-hit').forEach((mark) => {
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

function walkTextNodes(root, fn) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(fn);
}

export function runSearch(query) {
  const root = document.getElementById('book-root');
  const counter = document.getElementById('search-counter');
  const prev = document.getElementById('btn-search-prev');
  const next = document.getElementById('btn-search-next');
  if (!root) return;

  clearMarks(root);
  hits = [];
  hitIndex = -1;

  const q = String(query || '').trim();
  if (q.length < 2) {
    if (counter) counter.textContent = '0 / 0';
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
    return;
  }

  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  walkTextNodes(root, (textNode) => {
    const text = textNode.nodeValue;
    if (!text || !re.test(text)) return;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = m[0];
      frag.appendChild(mark);
      hits.push(mark);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  });

  if (hits.length) {
    hitIndex = 0;
    hits[0].classList.add('is-active');
    hits[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  if (counter) counter.textContent = hits.length ? hitIndex + 1 + ' / ' + hits.length : '0 / 0';
  if (prev) prev.disabled = hits.length < 2;
  if (next) next.disabled = hits.length < 2;
}

export function goSearchHit(delta) {
  if (!hits.length) return;
  hits[hitIndex]?.classList.remove('is-active');
  hitIndex = (hitIndex + delta + hits.length) % hits.length;
  hits[hitIndex].classList.add('is-active');
  hits[hitIndex].scrollIntoView({ block: 'center', behavior: 'smooth' });
  const counter = document.getElementById('search-counter');
  if (counter) counter.textContent = hitIndex + 1 + ' / ' + hits.length;
}

export function wireSearch() {
  const input = document.getElementById('search-input');
  let timer = null;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 200);
  });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goSearchHit(e.shiftKey ? -1 : 1);
    }
  });
  document.getElementById('btn-search-prev')?.addEventListener('click', () => goSearchHit(-1));
  document.getElementById('btn-search-next')?.addEventListener('click', () => goSearchHit(1));
}
