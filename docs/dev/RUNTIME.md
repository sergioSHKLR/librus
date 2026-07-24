# Runtime — LIBRUS

## Layout

| Mode | Condition | Behaviour |
|------|-----------|-----------|
| Wide | ≥ `LAYOUT_WIDE_MIN` (1200px) | Annotate · read · consult |
| Narrow | below | Book + Hypothesis; **no** research links; Links menu hidden |

## Chrome placement

| Control | Where |
|---------|--------|
| Theme | Library toolbar only |
| Settings | Library only |
| Typography | Reader |
| Link density / providers | Reader Links menu (wide) |
| Search / TOC | Reader |

## Storage keys

| Key | Purpose |
|-----|---------|
| `librus-settings` | Theme, lang, typography, density, providers, custom search |
| `librus-viewport-alert-dismissed` | Narrow notice |
| `librus-study-note-dismissed` | Splash dismissed |

Never put Hypothesis note bodies into export packs.

## URL query → localStorage

| Param | Example values |
|-------|----------------|
| `lang` | `en` \| `pt` |
| `theme` | `light` \| `dark` \| `system` |
| `density` | `lo` \| `med` \| `hi` |
| `font` | `0.875` … `1.25` |
| `line` | `1.45` … `1.75` |
| `w` `d` | `0` \| `1` |
| `prov` | e.g. `w,d` |

Locale may stay **EN-primary** until PT literary bodies are complete — check settings/i18n locks in code.

## i18n

`src/locales/en.json`, `pt.json` — chrome only. Book text is not translated by this system. Catalog `lang` filters which demo books appear.

## Icons

- Lucide files under `src/icons/`; **no inline SVGs**  
- Brand: **columns-3** (`brand.svg` / favicon)  
- **holmes.svg**: book covers only  

## Hypothesis / PWA

Hypothesis for notes; `manifest.webmanifest` + `sw.js` copied to `public/`. Verify SW cache after releases.
