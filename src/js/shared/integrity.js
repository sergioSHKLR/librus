/**
 * Block 1 of 1 — shared/integrity.js
 * Description: Debug-only console summary of public/integrity.json
 * Version: 1.a
 * Revised: 10Jul26
 */

export async function runIntegrityDebug() {
  const params = new URLSearchParams(location.search);
  let debugLs = false;
  try {
    debugLs = localStorage.getItem('nano-ssg-debug') === '1';
  } catch {
    /* private mode */
  }
  if (params.get('debug') !== '1' && !debugLs) return;

  try {
    let data = null;
    for (const u of ['/integrity.json', 'integrity.json']) {
      const r = await fetch(u);
      if (r.ok) {
        data = await r.json();
        break;
      }
    }
    if (!data) throw new Error('integrity.json not found');
    console.groupCollapsed('[nano-ssg] integrity');
    console.log(data);
    console.groupEnd();
  } catch (err) {
    console.warn('[nano-ssg] integrity fetch failed', err);
  }
}
