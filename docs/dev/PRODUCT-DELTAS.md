# Product deltas — LIBRUS vs DOUTRINA

Same SSG architecture. **Different product intent.**

| | **LIBRUS (this repo)** | **DOUTRINA** |
|--|------------------------|--------------|
| Intent | Agnostic study engine | Spiritism study library |
| Domain content | **None** (Holmes = **demo only**) | Kardec obras |
| External corpus repo | No | `doutrina-content` |
| package `name` | `librus` | `doutrina` |
| Domain | `librus.app` | `doutrina.org` |
| Brand | `L∙I∙B∙R∙U∙S` / columns-3 | `DOUTRINA` / droplet |
| Tagline | *annotate to assimilate* | *hidrate seu espírito* |
| Splash | Charcoal + Watson polaroid | Green + Kardec polaroid |
| Locale intent | EN first | PT first |
| Port | **3000** | **3001** |
| Storage prefix | `librus-*` | `doutrina-*` |
| Luz provider | **No** | **Yes** |
| Dictionaries | wiki + wiktionary | luz + wiki + wiktionary |
| Cover mark | Holmes on covers only | Kardec title icons |

## Rules for contributors

1. **Do not** add Kardec books, Luz, or droplet branding to LIBRUS “for parity.”  
2. **Do not** treat Holmes as a long-term content obligation—replaceable demo data.  
3. Engine-generic bugfixes may be ported to DOUTRINA deliberately; product-specific UI stays put.  
4. Full brand tokens: [../BRAND.md](../BRAND.md) vs doutrina’s `docs/BRAND.md`.
