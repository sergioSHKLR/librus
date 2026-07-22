/**
 * Block 1 of 1 — reader/toc.js
 * Description: Off-screen cascading TOC sidebar with filter
 * Version: 2.c
 * Revised: 16Jul26
 */

import { scrollToHeading, getHeadings } from './breadcrumb.js';

/**
 * @typedef {{
 *   id: string,
 *   level: number,
 *   text: string,
 *   index: number,
 *   synthetic?: boolean,
 *   childIds?: string[]
 * }} TocItem
 */

let open = false;
/** @type {TocItem[]} */
let flat = [];
/** Full list before filter */
/** @type {TocItem[]} */
let flatAll = [];
/**
 * @type {Array<{ parent: TocItem|null, items: TocItem[], title: string }>}
 */
let stack = [];
let filterQuery = '';

function cleanText(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/^\*+|\*+$/g, '')
    .trim();
}

/**
 * First A–Z letter of a glossary heading (strips emoji / punctuation).
 * Diacritics collapse for grouping: É/Ê → E, Ó → O, etc.
 * @param {string} text
 */
function glossaryLetter(text) {
  const t = cleanText(text)
    .replace(/^🔖\s*/u, '')
    .replace(/^[^\p{L}]+/u, '');
  const ch = t.charAt(0);
  if (!ch) return '#';
  /* NFD + strip combining marks so accented initials share one bucket */
  const base = ch.normalize('NFD').replace(/\p{M}/gu, '');
  const letter = (base || ch).toLocaleUpperCase('en-US');
  if (/^[A-Z]$/.test(letter)) return letter;
  /* Fallback: first ASCII letter if any */
  const m = letter.match(/[A-Z]/);
  return m ? m[0] : '#';
}

/**
 * Under 6.02 “Termos relacionados”, inject synthetic letter groups so the
 * cascade shows A, B, C… instead of hundreds of term leaves.
 * @param {TocItem[]} items
 * @returns {TocItem[]}
 */
function injectGlossaryLetterGroups(items) {
  const out = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    const isGlossaryParent =
      item.id === '6-02-01' ||
      (item.level === 4 && /termos\s+relacionados/i.test(item.text || ''));

    if (!isGlossaryParent) {
      out.push({ ...item, index: out.length });
      i++;
      continue;
    }

    out.push({ ...item, index: out.length });
    const parentLevel = item.level;
    i++;
    /** @type {Map<string, TocItem[]>} */
    const byLetter = new Map();
    while (i < items.length && items[i].level > parentLevel) {
      const term = items[i];
      if (term.level === parentLevel + 1) {
        const L = glossaryLetter(term.text);
        if (!byLetter.has(L)) byLetter.set(L, []);
        byLetter.get(L).push({ ...term, level: parentLevel + 2 });
      }
      i++;
    }

    const letters = [...byLetter.keys()].sort((a, b) => a.localeCompare(b, 'pt'));
    for (const L of letters) {
      const terms = byLetter.get(L) || [];
      const letterItem = {
        id: '6-02-letter-' + L.toLowerCase(),
        level: parentLevel + 1,
        text: L,
        index: out.length,
        synthetic: true,
        childIds: terms.map((t) => t.id)
      };
      out.push(letterItem);
      for (const term of terms) {
        out.push({ ...term, index: out.length });
      }
    }
  }
  out.forEach((t, idx) => {
    t.index = idx;
  });
  return out;
}

function setOpen(next) {
  open = next;
  const panel = document.getElementById('toc-sidebar');
  const backdrop = document.getElementById('toc-sidebar-backdrop');
  const btn = document.getElementById('btn-toc');
  document.body.classList.toggle('toc-sidebar-open', open);
  if (panel) {
    panel.classList.toggle('is-open', open);
    panel.classList.toggle('is-hidden', !open);
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
  }
  if (backdrop) {
    backdrop.classList.toggle('is-hidden', !open);
    if (open) backdrop.removeAttribute('hidden');
    else backdrop.setAttribute('hidden', '');
  }
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    resetToRoot();
    const filter = document.getElementById('toc-filter');
    if (filter) {
      filter.value = filterQuery;
      filter.focus();
    }
    renderView();
  }
}

/**
 * @param {TocItem} item
 * @returns {TocItem[]}
 */
function childrenOf(item) {
  if (item.synthetic && item.childIds && item.childIds.length) {
    const idSet = new Set(item.childIds);
    return flat.filter((n) => idSet.has(n.id));
  }
  const out = [];
  for (let i = item.index + 1; i < flat.length; i++) {
    const n = flat[i];
    if (n.level <= item.level) break;
    if (n.level === item.level + 1) out.push(n);
  }
  return out;
}

function rootItems() {
  const h2 = flat.filter((t) => t.level === 2);
  if (h2.length) return h2;
  if (!flat.length) return [];
  const min = Math.min(...flat.map((t) => t.level));
  return flat.filter((t) => t.level === min);
}

function resetToRoot() {
  stack = [{ parent: null, items: rootItems(), title: '' }];
}

function currentView() {
  return stack[stack.length - 1] || null;
}

function applyFilter(q) {
  filterQuery = String(q || '').trim().toLowerCase();
  if (!filterQuery) {
    flat = flatAll.slice();
    /* re-index for childrenOf */
    flat.forEach((t, i) => {
      t.index = i;
    });
    resetToRoot();
    renderView();
    return;
  }
  /* Flat match list: show matching headings as a single level (navigate leaves) */
  const matches = flatAll.filter(
    (t) =>
      t.text.toLowerCase().includes(filterQuery) ||
      t.id.toLowerCase().includes(filterQuery)
  );
  stack = [
    {
      parent: null,
      items: matches.map((t, i) => ({ ...t, index: i })),
      title: ''
    }
  ];
  /* childrenOf needs flat = matches for filter mode leaves only */
  flat = matches.map((t, i) => ({ ...t, index: i }));
  renderView();
}

function renderView() {
  const body = document.getElementById('toc-cascade-body');
  const titleEl = document.getElementById('toc-cascade-title');
  const backBtn = document.getElementById('btn-toc-back');
  const view = currentView();
  if (!body || !view) return;

  const atRoot = stack.length <= 1;
  if (backBtn) {
    backBtn.classList.toggle('is-hidden', atRoot || !!filterQuery);
    backBtn.disabled = atRoot || !!filterQuery;
  }
  if (titleEl) {
    if (atRoot || filterQuery) {
      titleEl.textContent = titleEl.dataset.rootLabel || 'Contents';
    } else {
      titleEl.textContent = view.title || (view.parent && view.parent.text) || '';
      titleEl.title = titleEl.textContent;
    }
  }

  body.innerHTML = '';
  if (!view.items.length) {
    const p = document.createElement('p');
    p.className = 'toc-panel-empty';
    p.textContent = filterQuery ? '—' : '…';
    body.appendChild(p);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'toc-cascade-list';
  const filtering = !!filterQuery;

  for (const item of view.items) {
    const kids = filtering ? [] : childrenOf(item);
    const hasKids = kids.length > 0;
    const li = document.createElement('li');
    li.className =
      'toc-cascade-item' +
      (hasKids ? ' has-children' : '') +
      (item.synthetic ? ' is-letter-group' : '');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toc-cascade-row';
    btn.dataset.tocId = item.id;

    const label = document.createElement('span');
    label.className = 'toc-cascade-label';
    label.textContent = item.text || item.id;
    label.title = item.text || item.id;
    btn.appendChild(label);

    if (hasKids) {
      const chev = document.createElement('span');
      chev.className = 'toc-cascade-chevron';
      chev.setAttribute('aria-hidden', 'true');
      chev.textContent = '›';
      btn.appendChild(chev);
    }

    btn.addEventListener('click', () => onItemActivate(item, filtering));
    li.appendChild(btn);
    ul.appendChild(li);
  }
  body.appendChild(ul);
}

/**
 * @param {TocItem} item
 * @param {boolean} filtering
 */
function onItemActivate(item, filtering) {
  if (filtering) {
    scrollToHeading(item.id);
    setOpen(false);
    return;
  }
  const kids = childrenOf(item);
  if (kids.length) {
    stack.push({
      parent: item,
      items: kids,
      title: item.text || item.id
    });
    renderView();
    return;
  }
  scrollToHeading(item.id);
  setOpen(false);
}

function goBack() {
  if (stack.length <= 1 || filterQuery) return;
  stack.pop();
  renderView();
}

function normalizeToc(raw) {
  const base = (raw || [])
    .filter((t) => t && t.id && t.level >= 1)
    .map((t, index) => ({
      id: t.id,
      level: Number(t.level) || 1,
      text: cleanText(t.text || t.id),
      index
    }));
  return injectGlossaryLetterGroups(base);
}

export async function loadToc() {
  const btn = document.getElementById('btn-toc');
  const body = document.getElementById('toc-cascade-body');

  try {
    const res = await fetch('toc.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    flatAll = normalizeToc(await res.json());
    if (!flatAll.length) {
      const live = getHeadings();
      flatAll = injectGlossaryLetterGroups(
        live.map((h, index) => ({
          id: h.id,
          level: h.level,
          text: cleanText(h.text),
          index
        }))
      );
    }
    flat = flatAll.slice();
    if (!flat.length) {
      if (body) body.innerHTML = '<p class="toc-panel-empty">No headings.</p>';
      if (btn) btn.disabled = true;
      return;
    }
    if (btn) btn.disabled = false;
    resetToRoot();
    if (open) renderView();
  } catch {
    if (body) body.innerHTML = '<p class="toc-panel-empty">TOC unavailable.</p>';
    if (btn) btn.disabled = true;
  }
}

export function wireToc() {
  const titleEl = document.getElementById('toc-cascade-title');
  if (titleEl && !titleEl.dataset.rootLabel) {
    titleEl.dataset.rootLabel = titleEl.textContent || 'Contents';
  }

  document.getElementById('btn-toc')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!open);
  });
  document.getElementById('btn-toc-back')?.addEventListener('click', () => goBack());
  document.getElementById('toc-sidebar-backdrop')?.addEventListener('click', () => setOpen(false));

  const filter = document.getElementById('toc-filter');
  let fTimer = null;
  filter?.addEventListener('input', () => {
    clearTimeout(fTimer);
    fTimer = setTimeout(() => applyFilter(filter.value), 120);
  });
  filter?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (filter.value) {
        filter.value = '';
        applyFilter('');
      } else setOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape' && document.activeElement !== filter) setOpen(false);
  });

  loadToc();
}
