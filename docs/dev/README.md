# Developer documentation — LIBRUS

**Docs revision:** 2026-07-24 · app **0.2.3-beta** (`BUILD_ID` 260724a)

**Audience:** contributors and maintainers only.  
**Not for:** end users, publicists, or marketing.

This tree is the developer handbook for **LIBRUS**: an **agnostic** static study-library engine (annotate · read · consult).  

**Demo corpus only:** *The Adventures of Sherlock Holmes* (and a small `demo` book). There is **no** separate content monorepo and **no** domain-specific encyclopedia pack. Long-form MD in `src/content/` is sample material to exercise the SSG.

Sibling product **DOUTRINA** is a Spiritism-oriented packaging of the same architecture. Deltas: [PRODUCT-DELTAS.md](./PRODUCT-DELTAS.md).

## Read order

| # | Doc | When you need it |
|---|-----|------------------|
| 1 | [OVERVIEW.md](./OVERVIEW.md) | What this repo is |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) | Source tree, `public/`, runtime layout |
| 3 | [BUILD.md](./BUILD.md) | Install, check, build, serve, deploy notes |
| 4 | [AUTHORING.md](./AUTHORING.md) | Book MD, front matter, catalog, demo corpus |
| 5 | [LINKER.md](./LINKER.md) | Dictionary → link bake (Wiki + Wiktionary) |
| 6 | [RUNTIME.md](./RUNTIME.md) | Reader/library UI, storage, i18n, prefs URL |
| 7 | [PRODUCT-DELTAS.md](./PRODUCT-DELTAS.md) | LIBRUS vs DOUTRINA |
| 8 | [CONTRIBUTING.md](./CONTRIBUTING.md) | Checks, block headers, workflow |

## Sibling repos

| Repo | Role |
|------|------|
| `sergioSHKLR/librus` | **This app** — generic engine + demo books |
| `sergioSHKLR/doutrina` | Spiritism product (Kardec shelf, Luz, PT-first) |
| `sergioSHKLR/doutrina-content` | **DOUTRINA only** — not used by LIBRUS |

## UI brand constraints

[../BRAND.md](../BRAND.md) — implementer constraints (lockup, colors, no Luz, Holmes cover mark only on covers).

## Conflict rule

When docs and code disagree: **code wins**. Fix the doc in the same change when you notice drift.
