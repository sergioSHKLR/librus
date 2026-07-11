# nano-ssg → **L∙I∙B∙R∙U∙S**

**annotate to assimilate** · short name **LIBRUS**

Minimal static site generator + library reader for long-form study texts (Kardec first: *O Livro dos Espíritos*). Notes live in **[Hypothes.is](https://web.hypothes.is/)** (no custom notes server).

## Quick start

```bash
npm install
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

npm run check
npm run build    # emits public/ (gitignored)
npm start        # http://localhost:3000 — serves public/ only
```

Serve **`public/`** as the document root (not the repo root), or library/reader navigation will 404.

| Command | Purpose |
|---------|---------|
| `npm run check` | Block-header lint |
| `npm run build` | check → link → compile → `public/` |
| `npm start` | Serve `public/` on port 3000 |

## Documentation

**[docs/HANDBOOK.md](docs/HANDBOOK.md)** — architecture, authoring, reader, settings, query prefs, build, contributing.

**[CHANGELOG.md](CHANGELOG.md)** — release history.

## License

Code: ISC. Book texts: see each book’s front matter and the Legal page.
