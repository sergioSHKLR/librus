# Architecture — LIBRUS

## Pipeline

```text
src/content/books/{slug}/book.md   (+ images/)
        │
        ▼  tools/run-linker.py  (Wiki + Wiktionary; no Luz)
   .cache/linked/{slug}.md
        │
        ▼  tools/compile-md.mjs
   public/books/{slug}/body.html
   public/books/{slug}/toc.json
   public/books/{slug}/index.html
        │
        ▼  mirror static + templates
   public/index.html
   public/library.json
   public/integrity.json
```

**Always build before serve.** `public/` is generated.

## Source layout (`src/`)

| Path | Role |
|------|------|
| `config/catalog.json` | Brand + ordered books (demo + Holmes EN/PT rows) |
| `content/books/{slug}/book.md` | Demo / sample book source |
| `templates/library.html` | → `public/index.html` |
| `templates/reader.html` | → `public/books/{slug}/index.html` |
| `css/` | Layers `00-tokens` … `10-study-note` |
| `js/library/`, `js/reader/`, `js/settings/`, `js/shared/`, `js/i18n/` | App modules |
| `locales/en.json`, `pt.json` | Chrome strings only |
| `data/dictionaries/{lang}/` | `wikipedia.json`, `wiktionary.json` only |
| `pages/` | about / help / contact / legal / blank |
| `icons/` | Lucide files; brand = **columns-3**; `holmes.svg` for **covers only** |
| `CNAME` | `librus.app` |

## Served URLs

Document root = `public/`. Books: `/books/{slug}/`.

## Runtime model

| Concern | Design |
|---------|--------|
| Notes | Hypothes.is — app never stores note bodies |
| Prefs | `localStorage` with `librus-*` keys |
| Wide | ≥ `LAYOUT_WIDE_MIN` (1200px): annotate · read · consult |
| Narrow | Book + Hypothesis; **no** research links |
| Accounts | None on the static site |

## JS entry areas

| Area | Path |
|------|------|
| Library | `js/library/main.js`, `site.js` |
| Reader | `js/reader/main.js` (+ book, toc, search, links, context, layout, …) |
| Settings | `js/settings/` |
| Shared | `constants.js`, `storage.js`, `theme.js`, `paths.js`, `prefs-query.js`, … |
