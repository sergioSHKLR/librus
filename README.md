# L∙I∙B∙R∙U∙S

**annotate to assimilate** · short name **LIBRUS** · [librus.app](https://librus.app)

Study library for long-form reading and annotation. First collection: *The Adventures of Sherlock Holmes* (12 stories, EN + PT UI editions). Notes live in **[Hypothes.is](https://web.hypothes.is/)**.

Built with **Grok Build**.

## Quick start

```bash
npm install
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

npm run check
npm run build    # emits public/
npm start        # http://localhost:3000 — serves public/
```

Serve **`public/`** as the document root (not the repo root).

| Command | Purpose |
|---------|---------|
| `npm run check` | Block-header lint |
| `npm run build` | check → link → compile → `public/` |
| `npm start` | Serve `public/` on port 3000 |

## Locale + books

Language (splash flags or Settings) filters the library to books with matching `lang` front matter. Switch EN ↔ PT to swap the story set.

## Deploy (GitHub Pages)

- Custom domain: `librus.app` (`src/CNAME` → `public/CNAME` on build)
- Publish the `public/` tree (or `gh-pages` branch)

## Documentation

**Developers:** **[docs/dev/](docs/dev/)** — architecture, build, authoring (demo corpus), linker, runtime, product deltas.

Holmes texts in-repo are **demo only**; there is no external content monorepo for LIBRUS.

**[CHANGELOG.md](CHANGELOG.md)** — release history.

## License

Code: ISC. Book texts: public-domain Doyle; see front matter and Legal page.
