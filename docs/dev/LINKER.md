# Linker — LIBRUS

## Role

Build-time dictionary → Markdown. Source `book.md` stays clean. Output:

```text
.cache/linked/{slug}.md
.cache/linked/{slug}-report.json
```

## Entry points

| Path | Role |
|------|------|
| `tools/run-linker.py` | CLI for one book |
| `tools/linker/doutrina_linker/` | Shared Python package name (historical); logic is product-neutral |
| `tools/build.mjs` → `linkBook()` | Per catalog book |

## Dictionaries

```text
src/data/dictionaries/{lang}/
  wikipedia.json
  wiktionary.json
```

**No `luz-pedia.json`.** `run-linker.py` in this repo wires **wikipedia + wiktionary only** (explicit product policy: no Luz Espírita).

`lang` from catalog / front matter (`en` / `pt`).

## Providers

| Code | Provider | UI |
|------|----------|-----|
| `w` | Wikipedia | globe |
| `d` | Wiktionary | book-a |

Do not reintroduce Luz into LIBRUS UI, linker, or copy.

## Density & interest

- Build links at **hi** density.  
- Entries carry interest tiers (`hi` / `med` / `lo`).  
- Reader LO/MED/HI filters visibility (see RUNTIME).

## Matching (summary)

Dictionary → text; per-heading provider rotation; same target may recur under other headings. Code is authority if this summary drifts.

## Failure mode

Linker fail → **WARN** → compile unlinked source. Do not commit `.cache/` linked MD into `src/`.
