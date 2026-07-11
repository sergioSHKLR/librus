# L∙I∙B∙R∙U∙S handbook (nano-ssg)

**Short name:** LIBRUS · **Tagline:** *annotate to assimilate* (PT: *anotar para assimilar*)

Minimal static site generator + library reader for long-form study texts (Kardec first: *O Livro dos Espíritos*). Notes live in **[Hypothes.is](https://web.hypothes.is/)** — the app never stores annotation bodies.

---

## 1. Product

| Layer | Role |
|-------|------|
| `src/content` | Book Markdown (source of truth) |
| `tools/linker` | Dictionary → MD links (cache only) |
| `tools/build` | Link → HTML → `public/` |
| Browser | Library + reader |

**Wide (≥ ~1200px landscape):** annotate · read · consult  
**Narrow:** main book + Hypothesis standard sidebar; **zero** research links; Links menu hidden

---

## 2. Quick start

```bash
cd nano-ssg
npm install
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

npm run check    # block-header PASS/FAIL
npm run build    # writes public/ (gitignored)
npm start        # serves public/ on http://localhost:3000
```

**Important:** the document root is **`public/`**, not the repo root.  
VS Code Live Preview or any server pointed at the repository root will 404 book and library paths (`/books/…` lives under `public/books/…`). Always use `npm start` (or serve `public/` explicitly).

| Command | Purpose |
|---------|---------|
| `npm run check` | Scan CSS/JS/HTML block headers in `src/` + `tools/` |
| `npm run build` | check → preflight → link → compile → stamp `public/` |
| `npm start` | `npx serve public -l 3000` |

---

## 3. Architecture

```text
src/content/books/{slug}/book.md  (+ images/)
        │
        ▼  linker → .cache/linked/
        ▼  compile MD → HTML + toc.json
        ▼  mirror static + stamp templates
public/books/{slug}/  public/css|js|…  public/index.html
```

`public/` is **gitignored**. Always `npm run build` before `npm start`.

### Storage keys

| Key | Purpose |
|-----|---------|
| `nano-ssg-settings` | Theme, lang, typography, density, providers |
| `nano-ssg-viewport-alert-dismissed` | Narrow notice dismissed |
| `nano-ssg-debug` | Integrity console when `1` |

### Integrity

- Build runs check first; writes `public/integrity.json`
- Browser: `?debug=1` loads integrity summary

---

## 4. Tree (`src` ↔ `public`)

| Source | Served as |
|--------|-----------|
| `src/templates/library.html` | `public/index.html` |
| `src/templates/reader.html` | `public/books/{slug}/index.html` |
| `src/content/books/{slug}/book.md` | → `public/books/{slug}/body.html` |
| `src/content/books/{slug}/images/*` | `public/books/{slug}/images/*` |
| `src/css/*` | `public/css/*` |
| `src/js/**` | `public/js/**` |
| `src/locales/*` | `public/locales/*` |
| `src/pages/*` | `public/pages/*` |
| `src/icons/*` | `public/icons/*` |
| `src/manifest.webmanifest` | `public/manifest.webmanifest` |
| `src/sw.js` | `public/sw.js` |
| (build) | `public/library.json`, `public/integrity.json` |

Runtime book URLs: `/books/{slug}/…`

---

## 5. Build

### Dependencies

**Node 20+:** `markdown-it`, `markdown-it-container`, `markdown-it-footnote`, `gray-matter`  
**Python 3.10+:** `PyYAML` (linker)

### Preflight (log-only)

Build prints a checklist (never interactive):

- Books as MD under `src/content/books/{slug}/book.md`?
- Front matter valid/complete?
- Catalog vs disk folders

### Summary

End of build reports **`public/` total size in MB** (plus major subfolders).

### Maps / providers

Place names from the old maps pack are folded into `wikipedia.json`. UI providers: **L / W / D** only.

---

## 6. Authoring books

```text
src/content/books/{slug}/book.md
src/content/books/{slug}/images/optional.webp
```

Images in MD: `![alt](images/optional.webp)` → `/books/{slug}/images/optional.webp`.

### Front matter

**Hard-required (build FAIL):** `title`, `slug` (must match folder)

**Soft (WARN + fallback):** `lang`, `author`, `emoji`, `cover`, `license`, `copyright`, **`abstract`**, **`categories`**

Also optional: `subtitle`, `order`, `description` (alias for abstract), `tags` (alias for categories), `translator`, …

```yaml
---
title: O Livro dos Espíritos
slug: lde
lang: pt
author: Allan Kardec
emoji: "✨"
cover:
  colors: ["#1a4a7a", "#2d6a9f"]
  angle: 135
license: public-domain
abstract: "…"
categories:
  - kardec
  - doutrina
---
```

`library.json` includes abstract + categories for future filters.

---

## 7. Reader

### Wide toolbar

| Control | Role |
|---------|------|
| **Library** | Always home (`/`) |
| Search + prev/next | In-book find |
| Contents | TOC panel |
| Text size | Cycle font scale → `localStorage` |
| **Links** (link icon) | Wide only: LO/MED/HI + L/W/D |

No theme or settings on the reader.

### Narrow

Book + notes only; no consult; no provider links; Links menu hidden.

---

## 8. Library & settings

| Control | Where |
|---------|--------|
| Theme (light/dark/system) | **Library toolbar only** |
| Settings panel | **Library only** — language, export/import pack, force update, clear data |
| Typography | **Reader** |
| Link density / providers | **Reader Links menu** (+ settings pack export still includes prefs) |

### URL query → `localStorage`

Query strings are applied and **saved**:

| Param | Example |
|-------|---------|
| `lang` | `en` \| `pt` |
| `theme` | `light` \| `dark` \| `system` |
| `density` | `lo` \| `med` \| `hi` |
| `font` | `0.875` \| `1` \| `1.125` \| `1.25` |
| `line` | `1.45` \| `1.6` \| `1.75` (stored; no reader control) |
| `l` `w` `d` | `0` \| `1` |
| `prov` | `l,w` or `l,w,d` |

Example: `/?lang=pt&theme=dark` or `/books/lde/?density=hi&prov=l,w`

---

## 9. UI i18n

- `src/locales/en.json` — complete default  
- `src/locales/pt.json` — full parity  

Only chrome strings. Book text is not translated by this system. Content `lang` in front matter is independent of UI language.

---

## 10. Block comment headers

Every major CSS / HTML / JS block uses a numbered header.

**Version:** major = number, minor = letter(s) → `1.a`, `1.b`  
**Revised:** `DDMMMYY` (e.g. `11Jul26`)

`npm run check` enforces headers under `src/` and `tools/`.

---

## 11. Contributing

Even solo: **branch → check → merge**. Prefer a green tip before large jumps.

```text
main (when created)
  └── fix/… or feat/…
```

No git remote yet in early local history; add `origin` when ready to publish.

**Notes:** Hypothesis owns annotations — never put note bodies in app export packs.

---

## 12. Brand & assets

- Display: **L∙I∙B∙R∙U∙S** (Unicode DOT OPERATOR U+2219)  
- Short / app: **LIBRUS** (`manifest.short_name`)  
- Favicon: Lucide **columns-3**, transparent; black stroke (light) / white stroke (dark via `prefers-color-scheme`)  
- Theme icon on library only  

---

## License

Code: ISC (`package.json`). Book texts: each book’s `license` / `copyright` and Legal page.
