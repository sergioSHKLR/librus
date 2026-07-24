# Authoring — LIBRUS (demo corpus)

Books live **only** in this repo:

```text
src/content/books/{slug}/book.md
src/content/books/{slug}/images/   # optional
```

There is **no** external content pipeline. Sherlock Holmes and `demo` are **samples** for the engine.

## Catalog

`src/config/catalog.json` lists demo + Adventure rows (often paired `*-en` / `*-pt` for locale filtering).

- `slug`, `path`, `title`, `lang`, `cover`, `enabled`, `order`, …  
- Library UI language filters books by front matter / catalog `lang`.

## Front matter

**Hard-required (compile FAIL):** `title`, `slug` (match folder)

**Soft (WARN + fallback):** `lang`, `author`, `emoji`, `cover`, `license`, `copyright`, `abstract`, `categories`, …

Aliases: `description` → `abstract`; `tags` → `categories`.

Example (demo-style):

```yaml
---
title: A Scandal in Bohemia
slug: adv-01-scandal-en
lang: en
author: Arthur Conan Doyle
license: public-domain
abstract: "…"
categories:
  - holmes
  - demo
---
```

## Images

`![alt](images/file.webp)` → `/books/{slug}/images/file.webp`

## Markdown features

Headings → TOC; footnotes; containers via `markdown-it-container` (`::: expand`, `::: center`, …). Match existing demo books; add compiler support before inventing new containers.

## Linker opt-out

Catalog `"link": false` skips dictionary linking for that book.

## Covers

- Gradients / solid from `cover.colors` + `cover.angle`  
- Cover stamp may use **Holmes** silhouette (`holmes.svg`) — **covers only**, never brand chrome  
- Brand mark remains **columns-3**

## Adding a new demo book

1. `src/content/books/{slug}/book.md` + front matter  
2. Catalog entry with `lang` if using locale filter  
3. Optional EN dict terms under `src/data/dictionaries/en/`  
4. `npm run build` and open `/books/{slug}/`  

Do **not** add Kardec obras or Luz dictionaries to LIBRUS; that is DOUTRINA’s job.
