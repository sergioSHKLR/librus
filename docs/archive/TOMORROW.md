# For tomorrow — open items

**Updated:** 2026-07-16  
**Repos:** `/home/user/doutrina-ssg` · `/home/user/librus-ssg`

---

## Deploy status

| Item | Status | Notes |
|------|--------|--------|
| **Product remotes** | **Done** | `origin` → `sergioSHKLR/librus` / `sergioSHKLR/doutrina` |
| **main + dev pushed** | **Done** | 2026-07-16 session close |
| **Pages workflow** | **Green** | Deploy Pages succeeded on both repos (workflow_dispatch / main) |
| **Live URLs** | **Up** | https://sergioshklr.github.io/librus/ · https://sergioshklr.github.io/doutrina/ |
| **Custom domains** | **Pending** | CNAME files ship `librus.app` / `doutrina.org` — wire DNS + GH Pages custom domain |

**Follow-up:** DNS A/CNAME for custom domains; optional `dev` preview environment later.

---

## Polish list — completion check

| Item | Status | Notes |
|------|--------|--------|
| Remotes exist, deploy dev, prod | **Done** | main+dev pushed; Pages green |
| Check context toolbar height | **Done** | Unified chrome; now `--toolbar-height: 39px` |
| Consult blank → PT | **Done** (DOUTRINA) | `Selecione um termo…`; LIBRUS stays EN (product lock) |
| AI analyze splash slide shows | **Done** | Analysis delivered in session |
| LIBRUS splash polaroid | **Done** | `watson.png` + caption *The game is afoot!* |
| Remove Luz from Librus | **Done** | UI, linker, dict removed; **DOUTRINA keeps Luz** |
| Wikipedia dark mode via storage | **Done** (workaround) | Cross-origin LS impossible; use `?vectornightmode=1` when app dark |
| Fix Librus dark mode favicon | **Done** | Lucide `columns-3` + `prefers-color-scheme` |
| Sherlock Holmes Lucide-style icon | **Done** | `icons/holmes.svg` on covers (not brand mark) |
| Librus search strings to PT | **Partial / blocked** | PT strings exist; UI EN-locked until PT content unlock |
| Teach PR in VS Code | **Done** | Walkthrough delivered in session |
| Locale changes search strings | **Done** | `applyI18n` + placeholders; settings custom search URLs |

---

## Future improvements

1. **Custom domain DNS** — `librus.app` / `doutrina.org` → GitHub Pages  
2. **Lighthouse CI** — Actions after build; soft thresholds (e.g. A11y ≥ 0.90, Perf ≥ 0.70–0.80); fail PR if below; optional notify; audit library + one reader URL only (iframes skew scores)  
3. **Full literary PT Sherlock bodies** (LIBRUS) — then unlock PT locale  
4. **Unlock second locale** when content ready (DOUTRINA EN / LIBRUS PT)  
5. **Richer linker dictionaries** (Holmes EN/PT; DOUTRINA EN if unlocked)  
6. **Handbook pass** — dual-product docs, deploy, locale locks, custom search URLs  
7. **Optional branding** — Hypo colours per product; marketing assets  
8. **Inline mini-TOCs** — deferred (keep recommended)  
9. **SW / cache tuning** after first Pages deploy  

---

## Recently finished (session arc — don’t re-do)

- Product split, storage keys, CNAME sources, splash (DOUTRINA Kardec polaroid / LIBRUS Watson polaroid *The game is afoot!*)  
- Locale locks, library taglines (*Read. Consult. Annotate.* / *Leia. Consulte. Anote.*)  
- Luz removed from LIBRUS only  
- Custom search URL overrides + extra consult provider in Settings  
- Export/import removed from Settings  
- Holmes covers: solid/gradient rules (not leather/gold); white icon  
- Contact/legal copy polish; GitHub Pages line on Legal  
- Brand guidelines (`docs/BRAND.md` both products)  
- GitHub remotes + Actions Pages deploy (both products live on github.io)  

## Local serve

```bash
cd /home/user/librus-ssg && npm start     # :3000
cd /home/user/doutrina-ssg && npm start   # :3001
```
