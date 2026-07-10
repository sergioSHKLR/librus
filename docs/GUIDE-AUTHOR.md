# Author guide — book Markdown

## Paths

```text
src/content/books/{slug}/book.md
src/content/books/{slug}/images/optional.webp
```

Images in MD: `![alt](images/optional.webp)` → `/books/{slug}/images/optional.webp`.

## Front matter

### Hard-required (build FAIL)

| Field | Rules |
|-------|--------|
| `title` | Display title |
| `slug` | Must match folder name |

### Soft (WARN + fallback, build continues)

| Field | Fallback |
|-------|----------|
| `lang` | `pt` |
| `author` | `Unknown` |
| `emoji` | `📖` |
| `cover.colors` | `["#4a5568"]` |
| `cover.angle` | `135` |
| `license` | `unknown` |
| `copyright` | `""` |

### Cover

- **1 color** → solid  
- **2 colors** → linear gradient  
- Bad/missing → slate solid + warning  

### License

`license`: `public-domain` | `cc-by` | `cc-by-sa` | `all-rights-reserved` | `unknown`  
`copyright`: free-text notice  

### Optional

`subtitle`, `order`, `description`, `draft`, `year`, `translator`, `edition`, `source`, `tags`

### Example

```yaml
---
title: O Livro dos Espíritos
slug: lde
lang: pt
author: Allan Kardec
emoji: "✨"
cover:
  colors: ["#1a4a7a", "#2d6a9f"]
  angle: 135
license: public-domain
copyright: "Study edition; see legal page"
translator: Guillon Ribeiro
order: 1
---
```

## Conventions

- Stable `{#id}` anchors on headings when needed  
- Prefer pure MD; protected regions for linker (headings, existing links, code)  
- Content language ≠ UI language (`lang` is content only)
