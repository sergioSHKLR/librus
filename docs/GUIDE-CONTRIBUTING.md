# Contributing — hygiene (required)

Even as a solo maintainer: **branch → PR → check → merge**. `main` stays green.

## Branch model

```text
main
 └── feat/… | fix/… | docs/… | chore/…
```

Never develop long-lived work only on `main`.

## Before every PR

```bash
npm run check
npm run build
```

Use `.github/PULL_REQUEST_TEMPLATE.md` checklist.

## Commits

```text
feat(reader): hide provider links in narrow mode
fix(build): warn on missing cover colors
docs(author): document license field
chore(check): allowlist tiny glue file
```

## Product rules (do not regress)

- Notes = Hypothes.is only (no notes export/import in app)  
- Wide = 3 panes; narrow = main + notes, **zero research links**  
- `public/` never committed  
- Soft front-matter fallbacks; hard FAIL only `title` / `slug`  

## Review

Self-review the full diff. Prefer squash merge for clean history.
