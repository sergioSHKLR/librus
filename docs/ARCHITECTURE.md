# Architecture — L.I.B.R.U.S / nano-ssg

## Pipeline

```text
src/content/books/{slug}/book.md  (+ images/)
        │
        ▼  (PR 4) linker → .cache/linked/
        ▼  compile MD → HTML + toc.json
        ▼  mirror static + stamp templates
public/books/{slug}/  public/css|js|…  public/index.html
```

`public/` is **gitignored**. Always `npm run build` before `npm start`.

## Layout modes

| Mode | When | Panes |
|------|------|--------|
| **Wide** | ≥ ~1200px landscape | notes · main · consult |
| **Narrow** | tablet / phone / portrait / below threshold | main + Hypothesis standard sidebar only |

**Narrow rules (product):**

- No consult/context panel
- **Zero** in-book provider links (l/w/d/m) — mobile is for reading and annotating, not research
- Limited-experience notice; dismiss → `localStorage`

Brand tagline maps to wide panes: **annotate / read / consult**.

## Notes

Hypothes.is owns notes. App never export/imports annotation bodies.

## Storage keys

| Key | Purpose |
|-----|---------|
| `nano-ssg-settings` | Theme, lang, typography, density (wide), … |
| `nano-ssg-viewport-alert-dismissed` | Narrow notice dismissed |
| `nano-ssg-debug` | Integrity console when `1` |

## Integrity

- `npm run check` — headers in `src/` + `tools/`
- Build runs check first; writes `public/integrity.json`
- Browser: `?debug=1` loads integrity summary
