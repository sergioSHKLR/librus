# Overview — LIBRUS (developers)

## What this is

**LIBRUS** (display lockup **L∙I∙B∙R∙U∙S**) is a **domain-agnostic** static site generator + multi-pane study reader:

- Long-form Markdown → linked HTML library  
- Wide viewport: **annotate** (Hypothes.is) · **read** · **consult**  
- Narrow: book + notes; no research links  

It is **not** a Spiritism product. Domain packaging for Kardec lives in **DOUTRINA**.

## Demo corpus (not a content product)

| Fact | Detail |
|------|--------|
| Purpose | Prove the engine: catalog, locale filter, linker, reader |
| Material | *Adventures of Sherlock Holmes* (EN + PT catalog entries) + `demo` |
| SoT | **In-repo** `src/content/books/` only |
| External content repo | **None** — do not wire `doutrina-content` into LIBRUS |
| Literary status | Public-domain Doyle; PT rows may still be UI-framed / incomplete literary bodies |

Treat Holmes as **replaceable sample data**. New generic collections should follow the same `book.md` + `catalog.json` pattern without assuming Spiritist structure (no LDE question codex, no Luz).

## Sibling relationship

```text
librus (this repo)     Agnostic engine + demo books
        │
        │  same architecture, different packaging
        ▼
doutrina               Spiritism product (Kardec + Luz + content pipeline)
        │
        ▼
doutrina-content       Kardec corpus SoT (DOUTRINA only)
```

## This repository

| Item | Value |
|------|--------|
| package.json `name` | `librus` |
| Site | `librus.app` (`src/CNAME`) |
| Local port | **3000** |
| Document root | `public/` after build (gitignored) |

## Non-goals

- Storing annotation bodies in the app  
- Server-side user accounts  
- Shipping Kardec / Luz / centre branding here  
- Maintaining a parallel “content monorepo” for Holmes  

## Version stamp

`package.json` `version` and `src/js/shared/constants.js` (`APP_VERSION`, `BUILD_ID`) — keep aligned on release.
