# Contributing — LIBRUS

## Workflow

```bash
npm run check
npm run build
npm start   # :3000
```

Branch → check → build → merge. Prefer a green tip before large jumps.

## Block headers

Numbered headers on major CSS/HTML/JS/tools files (`Version`, `Revised` `DDMMMYY`).  
Enforced by `npm run check` / `tools/check-blocks.mjs` (allowlist: `tools/check-blocks.allowlist`).

## Commit

| Commit | Avoid |
|--------|--------|
| `src/`, `tools/`, docs, demo books | `public/`, `.cache/`, `.venv/` |

## Product boundary

This repo stays **domain-agnostic**. Spiritism features (Luz, Kardec shelf, doutrina-content) belong in **DOUTRINA**.

## Docs

Developer docs: `docs/dev/`. Update them when pipeline, keys, ports, or authoring rules change.

## Conflict rule

**Code > docs.**
