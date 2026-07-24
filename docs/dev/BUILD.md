# Build & serve — LIBRUS

## Requirements

| Tool | Version |
|------|---------|
| Node | ≥ 20 |
| Python | ≥ 3.10 (linker) |
| pip | `requirements.txt` (PyYAML) |

## Install

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Commands

| Script | Purpose |
|--------|---------|
| `npm run check` | Block-header lint (`src/` + `tools/`) |
| `npm run build` | check → preflight → link → compile → stamp `public/` |
| `npm start` | Serve **`public/`** on port **3000** |

### Build (`tools/build.mjs`)

1. check-blocks (fail on bad headers)  
2. preflight (log-only catalog vs disk)  
3. recreate `public/`  
4. mirror css, js, locales, icons, images, pages, CNAME, manifest, sw, hypothesis-boot  
5. per book: link → compile → body.html + toc + images  
6. `library.json`, stamp templates, `integrity.json`  

Linker failure for a book → **WARN**, compile **unlinked** source.

### Serve (`tools/serve-public.mjs`)

| Product | Port |
|---------|------|
| **LIBRUS** | **3000** |
| DOUTRINA | 3001 |

Port is chosen from `package.json` `name` (`librus` → 3000). Serves absolute `public/` path.

```bash
npm run build && npm start
# http://localhost:3000
# http://localhost:3000/books/demo/
```

**Wrong:** serve the repo root. Books live under `public/books/…`.

## Deploy

Ship `public/` (e.g. GitHub Pages). `src/CNAME` → `public/CNAME` (`librus.app`).

## Git hygiene

| Tracked | Not tracked |
|---------|-------------|
| `src/`, `tools/`, docs | `public/`, `.cache/`, `.venv/`, `node_modules/` |
