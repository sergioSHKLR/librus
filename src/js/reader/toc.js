/**
 * Block 1 of 1 — reader/toc.js
 * Description: Load toc.json and render sumário overlay (H1–H2)
 * Version: 1.a
 * Revised: 260710 17:30
 */

let open = false;

function setOpen(next) {
  open = next;
  const panel = document.getElementById('toc-panel');
  const btn = document.getElementById('btn-toc');
  if (!panel) return;
  panel.classList.toggle('is-hidden', !open);
  if (open) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

export async function loadToc() {
  const body = document.getElementById('toc-panel-body');
  const btn = document.getElementById('btn-toc');
  if (!body) return;

  try {
    const res = await fetch('toc.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const toc = await res.json();
    const items = (toc || []).filter((t) => t.level >= 1 && t.level <= 2 && t.id);
    if (!items.length) {
      body.innerHTML = '<p class="toc-panel-empty">No headings.</p>';
      if (btn) btn.disabled = true;
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'toc-list';
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'toc-item toc-level-' + item.level;
      const a = document.createElement('a');
      a.href = '#' + item.id;
      a.textContent = item.text || item.id;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(item.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + item.id);
        }
        setOpen(false);
      });
      li.appendChild(a);
      ul.appendChild(li);
    }
    body.innerHTML = '';
    body.appendChild(ul);
    if (btn) btn.disabled = false;
  } catch {
    body.innerHTML = '<p class="toc-panel-empty">TOC unavailable.</p>';
    if (btn) btn.disabled = true;
  }
}

export function wireToc() {
  document.getElementById('btn-toc')?.addEventListener('click', () => setOpen(!open));
  document.getElementById('btn-toc-close')?.addEventListener('click', () => setOpen(false));
  loadToc();
}
