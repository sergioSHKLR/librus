# nano-ssg → **L.I.B.R.U.S**

**annotate / read / consult**

Minimal static site generator + library reader for long-form study texts (Kardec first: *O Livro dos Espíritos*). Combines content, offline linking, and a three-pane desktop reader. Notes live in **[Hypothes.is](https://web.hypothes.is/)** (no custom notes server).

| Layer | Role |
|-------|------|
| `src/content` | Book Markdown (source of truth) |
| `tools/linker` | Dictionary → MD links (PR 4) |
| `tools/build` | Link → HTML → `public/` |
| Browser | Library + reader (wide: 3 panes; narrow: main + notes only, **zero research links**) |

Repo name: **nano-ssg**. Product brand: **L.I.B.R.U.S**.

## Requirements

- **Node.js 20+**
- **Python 3.10+** (linker, later)
- Git

## Quick start

```bash
cd nano-ssg
npm install
python3 -m venv .venv && source .venv/bin/activate   # when linker lands
pip install -r requirements.txt                      # when linker lands

npm run check    # block-header PASS/FAIL
npm run build    # fails if check fails; writes public/ (gitignored)
npm start        # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run check` | Scan CSS/JS/HTML block headers |
| `npm run build` | check → emit `public/` |
| `npm start` | Serve `public/` |

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Pipeline, layout modes, storage |
| [docs/TREE.md](docs/TREE.md) | `src` ↔ `public` map |
| [docs/GUIDE-AUTHOR.md](docs/GUIDE-AUTHOR.md) | MD + front matter |
| [docs/GUIDE-BUILD.md](docs/GUIDE-BUILD.md) | Build & deps |
| [docs/GUIDE-READER.md](docs/GUIDE-READER.md) | Panes, Hypothesis, mobile |
| [docs/GUIDE-SETTINGS.md](docs/GUIDE-SETTINGS.md) | Settings (library export only) |
| [docs/GUIDE-I18N.md](docs/GUIDE-I18N.md) | UI strings EN/PT |
| [docs/GUIDE-COMMENT-HEADERS.md](docs/GUIDE-COMMENT-HEADERS.md) | Block headers + checks |
| [docs/GUIDE-CONTRIBUTING.md](docs/GUIDE-CONTRIBUTING.md) | **PRs, hygiene, commits** |
| [docs/SESSION.md](docs/SESSION.md) | **Session handoff / resume state** |

## Dependencies (summary)

**Node:** `markdown-it`, `markdown-it-container`, `markdown-it-footnote`, `gray-matter`  
**Python:** `PyYAML` (linker)  
**Browser:** evergreen + Hypothes.is embed (no npm UI framework)

See [docs/GUIDE-BUILD.md](docs/GUIDE-BUILD.md).

## License

Code: ISC (see package.json). Book texts: see each book’s `license` / `copyright` front matter and legal page.
