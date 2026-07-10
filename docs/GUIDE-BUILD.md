# Build guide

## Dependencies

### Node (package.json)

| Package | Role |
|---------|------|
| `markdown-it` | MD → HTML |
| `markdown-it-container` | Custom containers |
| `markdown-it-footnote` | Footnotes |
| `gray-matter` | YAML front matter |

### Python (requirements.txt)

| Package | Role |
|---------|------|
| `PyYAML` | Linker config (PR 4+) |

### System

Node 20+, npm, Python 3.10+, Git.

### Third-party (not installed)

Hypothes.is embed; Wikipedia / Luz / Wiktionary / maps at runtime (wide consult).

## Commands

```bash
npm install
npm run check   # headers
npm run build   # check + write public/
npm start       # serve public/
```

## Build steps (target)

0. `check-blocks` (+ later front-matter hard checks)  
1. Link MD → `.cache/linked/` (cache-only)  
2. Compile → `body.html`, `toc.json`, mirror `images/`  
3. Library stamp + `library.json`  
4. Reader stamp per book  
5. Mirror static `css` `js` `locales` …  
6. Write `integrity.json`  

PR 0 implements 0 + static mirror + library stub only.

## Output

`public/` is **gitignored**. Do not commit it.
