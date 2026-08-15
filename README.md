# librus

**Published site host only** — not application source.

| | |
|--|--|
| **Role** | GitHub Pages (or equivalent) deploy target for `dist/` |
| **Engine** | Built from [`librus-shell`](https://github.com/sergioSHKLR/librus-shell) |
| **Content** | Books from [`doutrina-content`](https://github.com/sergioSHKLR/doutrina-content) via [`librus-linker`](https://github.com/sergioSHKLR/librus-linker) (when wired) |

Do not develop the SPA here. CI from **librus-shell** will overwrite published artifacts.

## Repo map

| Repo | Role |
|------|------|
| [librus-shell](https://github.com/sergioSHKLR/librus-shell) | SPA, flavors, PWA |
| [librus-linker](https://github.com/sergioSHKLR/librus-linker) | Provider link injection |
| [doutrina-content](https://github.com/sergioSHKLR/doutrina-content) | Editorial source |
| [librus](https://github.com/sergioSHKLR/librus) | Host for librus.app |
| [doutrina](https://github.com/sergioSHKLR/doutrina) | Host for doutrina.org |
| `center-*` | Center manual + flavor.json |
