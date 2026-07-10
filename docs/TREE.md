# Tree map — src ↔ public

| Source | Served as |
|--------|-----------|
| `src/templates/library.html` | `public/index.html` |
| `src/templates/reader.html` | `public/books/{slug}/index.html` (later) |
| `src/content/books/{slug}/book.md` | → `public/books/{slug}/body.html` (compile) |
| `src/content/books/{slug}/images/*` | `public/books/{slug}/images/*` |
| `src/css/*` | `public/css/*` |
| `src/js/**` | `public/js/**` |
| `src/locales/*` | `public/locales/*` |
| `src/pages/*` | `public/pages/*` |
| `src/icons/*` | `public/icons/*` |
| `src/manifest.webmanifest` | `public/manifest.webmanifest` |
| `src/sw.js` | `public/sw.js` |
| (build) | `public/integrity.json` |
| (build) | `public/library.json` |

Runtime book URLs are always `/books/{slug}/…` (not `/content/…`).
