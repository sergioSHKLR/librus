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

### Link stats (per book)

After link + compile, build prints **total** and **unique** provider links:

| Line | Meaning |
|------|---------|
| `report candidates` | Unique dictionary targets chosen in phase 1 (by `l`/`w`/`d`) |
| `report phase-1 match hits` | All scan positions (if multi-hit) |
| `links {slug} (linked MD)` | Short links baked into cache MD — total vs unique targets |
| `links {slug} (body.html)` | Final HTML `data-link-provider` anchors — **what the reader sees** |

**Policy today:** within each **heading** (h2/h4/h6 path), a concept rotates providers once (e.g. spiritism: Luz → Wiki → Dict); further mentions in that heading are plain text. The **same article×provider** may appear again under a **different** heading. There is **no** document-wide `max_same_article` / `max_occurrences` cap — so **total can exceed unique** when terms recur across sections.

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
| **Library** | Always home (relative via `data-app-base`) |
| Search + prev/next | In-book find |
| Contents | TOC panel |
| Text size | Cycle font scale → `localStorage` |
| **Links** (link icon) | Wide only: LO/MED/HI + providers (lightbulb Luz, globe Wiki, book-a Dict) |

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
- **All UI icons are [Lucide](https://lucide.dev)** (ISC), 24×24 stroke, under `src/icons/`  
- **No inline SVGs** in HTML/JS — always external files via `<img src="…/icons/….svg">` (or `href` for favicon). Do not paste Lucide markup into templates.  

| File | Lucide name | Used for |
|------|-------------|----------|
| `brand.svg` / `favicon.svg` | `columns-3` | Brand + tab icon |
| `book.svg` | `book` | Cover cards |
| `book-open.svg` | `book-open` | Library home (reader) |
| `book-a.svg` | `book-a` | Wiktionary provider |
| `lightbulb.svg` | `lightbulb` | Luz provider |
| `globe.svg` | `globe` | Wikipedia provider |
| `link.svg` | `link` | Links menu |
| `settings.svg` | `settings` | Settings |
| `device.svg` | `smartphone` | Theme: system |
| `sun.svg` / `moon.svg` | `sun` / `moon` | Theme: light / dark |
| `text-size.svg` | `type` | Font size |
| `toc.svg` | `list` | Contents |
| `up.svg` / `down.svg` | `chevron-up` / `chevron-down` | Search prev/next |
| `back.svg` | `arrow-left` | Context back |
| `reload.svg` | `refresh-cw` | Context reload |
| `close.svg` | `x` | Close panels |

Theme control: **library toolbar only**.

---

## License

Code: ISC (`package.json`). Book texts: each book’s `license` / `copyright` and Legal page.
