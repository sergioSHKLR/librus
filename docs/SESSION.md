# Session handoff — L∙I∙B∙R∙U∙S / nano-ssg

**Saved:** 2026-07-11  
**Resume tip:** open this file first; then `git log -5 --oneline` and `git status`.

## Where you are

| Item | Value |
|------|--------|
| Repo | `/home/user/nano-ssg` |
| Branch | **`fix/polish-batch`** (run `git rev-parse --short HEAD`) |
| Tip features | Collapsible related-terms; expanded wiki/wiktionary; per-heading link rotation; link stats on build |
| Working tree | Expect clean after this handoff commit |
| Remote / `main` | **Still none** |

### Resume commands

```bash
cd /home/user/nano-ssg
git checkout fix/polish-batch
git status
npm run build && npm start   # http://localhost:3000  — serve public/, not file://
```

**Library:** http://localhost:3000/  
**LDE:** http://localhost:3000/books/lde/  
Do **not** open `public/index.html` via file path or Live Preview on repo root.

---

## Done this session (high level)

- Reader chrome, Lucide icons (no inline SVG; `stroke=currentColor`), brand L∙I∙B∙R∙U∙S  
- Nav: relative page links; provider home on empty selection; back/reload disabled until load  
- Linker: per-**heading** L→W→D rotation; no document-wide max_same_article / max_occurrences  
- Build: total + unique links per provider per book  
- Multi-word short links fixed (`<l:…>` for spaces)  
- **`::: expand` Termos relacionados** → closed-by-default `<details>`  
- Dict expansion: wiktionary ~218 entries; wikipedia ~308 (ideologies + places)  
- LDE ~**3947** baked links, ~**279** unique (after dict growth; dict-heavy)

---

## Agreed next work (not implemented)

### 1. Context toolbar: Reload → Stop while loading

- While consult iframe is loading: show **Stop** (cancel navigation) instead of Reload  
- When idle / loaded: **Reload** as today  
- Use Lucide icon if available (`square` / `circle-stop` / similar — pick one consistent with set)  
- Wire to abort: set `iframe.src = about:blank` or blank page; clear loading state; re-enable nav rules  

Files: `src/js/reader/context.js`, `src/templates/reader.html`, maybe `src/icons/*`, CSS disabled/active.

### 2. WebAIM contrast for colored provider links

- In-text `l` / `w` / `d` colors (`--provider-luz`, `--provider-wiki`, `--provider-dict` in tokens)  
- Check **light + dark** themes against body background (WCAG AA at least)  
- Adjust CSS variables in `src/css/00-tokens.css` / dark theme; re-check underlines/hover  
- Optional: document pass/fail in handbook  

### 3. Locale (EN/PT) limited on Reader

- **Library:** settings language works (reload)  
- **Reader:** many chrome strings may stay English or miss `data-i18n` / re-apply after boot  
- Fix: ensure `applyI18n` covers reader template + dynamic UI (TOC, Links menu, density, viewport alert, context labels); settings not on reader — language only via library settings or `?lang=` query (already write-through)  
- After `lang` change from library, reader pages should pick up on next visit; if user expects live switch on reader, either add a path or document “set language on library”  
- Files: `src/templates/reader.html`, `src/locales/*.json`, `src/js/reader/main.js`, `src/js/i18n/i18n.js`, maybe context/toc/links  

---

## Product notes (don’t re-litigate)

- Theme button: **library only**  
- Settings: library (lang + pack I/O); typography + links on reader  
- Serve **`public/`** only (`npm start`)  
- Unique link count bounded by dictionary size; section related-terms are collapsible internal anchors (multi-icon chips still optional later)  

---

## One-line for tomorrow’s agent

> Continue nano-ssg on `fix/polish-batch`. Next: (1) reload→stop while consult loading, (2) WebAIM contrast for colored L/W/D links, (3) full EN/PT i18n on reader chrome. Serve via `npm run build && npm start` → localhost:3000. Read `docs/SESSION.md`.
