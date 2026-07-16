# Split backlog — LIBRUS + DOUTRINA

Status after local split (2026-07-15).

## Done
- Sibling repo `/home/user/doutrina-ssg` (copy with git history)
- **DOUTRINA**: brand DOUTRINA, droplet (deepskyblue), `doutrina-*` keys, green splash + CSS post-it + polaroid, Kardec books, CNAME `doutrina.org`, powered by librus.app + Grok Build, GH-ready `public/`
- **LIBRUS** (`librus-ssg` workspace): `librus-*` keys, charcoal splash + CSS post-it + Watson polaroid (*The game is afoot!*), 12 Adventures EN+PT catalog entries, locale filters books, EN linker JSON, CNAME `librus.app`, Grok Build credit, GH-ready `public/`
- Linker uses front matter / catalog `lang` → `src/data/dictionaries/{lang}/`
- Workspace renamed: `nano-ssg` → `librus-ssg`

## Remaining
See **[TOMORROW.md](./TOMORROW.md)** for the current open list (updated 2026-07-16).

1. **Full literary PT Sherlock bodies** — PT editions currently ship PD English narrative with PT titles/UI framing. Replace when PD PT sourced; then unlock PT locale.
2. **Richer EN/PT dictionaries** for Holmes.
3. **GitHub remotes + Pages deploy** (`librus.app` / `doutrina.org`).
4. **Handbook** dual-product pass.
5. **Hypothesis / branding** colours per product if desired.
6. Optional: `sherlock.png` marketing; mini-TOC keep/remove decision.

## Local serve
```bash
# LIBRUS
cd /home/user/librus-ssg && npm start        # :3000

# DOUTRINA
cd /home/user/doutrina-ssg && npm start      # :3001
```
