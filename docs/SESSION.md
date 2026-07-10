# Session handoff — L.I.B.R.U.S / nano-ssg

**Saved:** 2026-07-10  
**Resume tip:** open this file first; then `git log -5 --oneline` and `git status`.

## Where you are

| Item | Value |
|------|--------|
| Repo | `/home/user/nano-ssg` |
| Branch | **`fix/reader-chrome`** (run `git rev-parse --short HEAD`) |
| Feature tip | **`8dc8d2f`** — reader chrome (theme/settings off reader; Links dropdown) |
| Handoff tip | Commit after that: `docs: session handoff for resume` |
| Working tree | Clean (all work committed) |
| Remote | **None** — no `origin`, no GitHub push yet |
| Default branch | **No `main` yet** — linear local feature branches only |

### Branch tip history (newest first)

```text
fix/reader-chrome      (HEAD) docs: session handoff for resume
                       8dc8d2f  fix(reader): drop theme/settings; Links density dropdown
fix/ui-shell-defects   8cfb133  docs: drop maps from reader/build guides
feat/pr5-settings-pwa  0e0b8fc  … (PR 5 tip; earlier commits on lineage)
… PR 4 → PR 3 → PR 2 → PR 1 → PR 0 scaffold
```

## Done (product)

- **PR 0–5** shipped locally: scaffold, library, reader panes, MD compile + LDE, linker, settings/PWA  
- **UI shell fixes:** dark icon invert; theme toolbar-only (not in settings); maps folded into wikipedia  
- **Reader chrome (`fix/reader-chrome`):**
  - Drop **theme** + **settings** from reader  
  - Keep **font size** cycle on main toolbar  
  - **Links** dropdown (wide only): density LO/MED/HI + providers L/W/D  
  - Library stays home (`btn-library` → cover grid)  
  - Theme + full settings remain on **library** (+ site pages)  
- **Check + build green** at last save (`npm run check` / `npm run build`)

## LDE status (not missing)

| Piece | Path / note |
|-------|-------------|
| Source | `src/content/books/lde/book.md` (~1.2 MB) |
| Catalog | `src/config/catalog.json` → `slug: lde`, `enabled: true` |
| Build out | `public/books/lde/` (gitignored; rebuild with `npm run build`) |
| Reader URL | http://localhost:3000/books/lde/ after `npm start` |

Chrome work did **not** edit book content or the linker.

## Intentional product rules (remember)

- **LDE only** for now (one book in catalog)  
- **Maps** folded into **wikipedia** (no separate M provider in UI)  
- **Theme** only on toolbar (library/site), not settings panel, not reader  
- **Narrow:** book + notes only; **zero** research links; Links menu hidden  
- **Notes:** Hypothes.is only — never in app export pack  

## Deferred / next (pick one)

1. **Smoke browser** — `npm start` → library → LDE → Links menu, font, library home  
2. **PR6** — more books + version tag (+ push when remote exists)  
3. **Create `main` + GitHub remote** — first publish / `origin`  
4. **Library filter** — only when multi-book (not needed for LDE-only)  
5. Optional hygiene: `library.empty` locale still says “LDE arrives in the next build step” (stale copy; only shows if grid empty)

## Resume commands

```bash
cd /home/user/nano-ssg
git checkout fix/reader-chrome
git status                    # expect clean
git log -5 --oneline

# env if needed
source .venv/bin/activate     # Python linker
npm run check && npm run build
npm start                     # http://localhost:3000
```

## Do not re-do

- Accidental WIP on `library.html` using brand `L•I•B•R•U•S` / `annotate | read | consult` — **discarded** twice; brand remains **L.I.B.R.U.S** / `annotate / read / consult` in locales + committed templates  
- Re-implementing PR 0–5 or re-linking LDE unless content/dictionaries change  

## Docs map

| Doc | Use |
|-----|-----|
| This file | Session resume |
| `CHANGELOG.md` | What landed |
| `docs/GUIDE-READER.md` | Reader chrome after fix |
| `docs/GUIDE-SETTINGS.md` | Library-only settings + theme location |
| `docs/ARCHITECTURE.md` | Pipeline + layout modes |
| `docs/GUIDE-CONTRIBUTING.md` | PR / commit hygiene |

## One-line status for tomorrow’s agent

> Continue nano-ssg (L.I.B.R.U.S) on `fix/reader-chrome` (clean; tip after `8dc8d2f` chrome + session handoff). PR 0–5 + UI defects + reader chrome done; check/build green. LDE only; maps→wiki; theme library toolbar only. No remote/main. Read `docs/SESSION.md`. Next: smoke, or PR6 (books+tag), or create main+GitHub remote.
