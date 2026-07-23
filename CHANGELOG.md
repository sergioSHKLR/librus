# Changelog

## 0.2.2-beta (2026-07-23)

### Changed

- Settings: hide provider URL / custom-provider fields (built-in providers only)
- 5px top brand bar — **black**

---

## 0.2.1-beta (2026-07-21)

### Added

- **Display** menu (sliders): link density + providers, then typography (size, line height, justify, width)
- Book-only typography CSS vars (chrome stays fixed size)
- PDF page jump control when `pages.json` is present
- YouTube / external links open in consult pane (wide); fullscreen-friendly embeds
- Generic **Reader Demo** book (non-religious sample walkthrough)
- `serve-public.mjs` fixed ports (LIBRUS :3000)

### Changed

- Link density **None** (lo) = **zero** research links
- Range sliders: dark track, black handle (light theme)
- Consult `selected_term` min-width 25%; opaque loading overlay
- Providers stay next to selected term + clear

### Fixed

- Template token fallback when book body stamp is partial
- Service worker stuck on old shell CSS/HTML (cache-first) — bump cache + network-first for reader chrome

---

## 0.2.0-beta (2026-07-13)

### Added

- Brand **beta** superscript on library home  
- First-load Kardec study post-it (dismiss → `localStorage`)  
- Library book filter; cover icons/colors per title (LDE/LDM/ESE/CEU/GEN)  
- Stubs: LDM, ESE, CEU, GEN  
- Contact / Contato page  
- Cascading off-screen TOC sidebar with filter  
- Provider keyboard shortcuts (Alt+1/L, Alt+2/W, Alt+3/D)  
- Settings **Update** button (disabled until SW update available)  
- Full EN/PT for site pages, chrome labels, blank consult pane  
- Bible cites: prophet · Wikipedia chapter · Wikisource Almeida verse · ARC  

### Changed

- Wide layout: screen width only (no portrait gate)  
- Research links: blue underlines for all providers  
- Toolbar height 39px; search border/bg removed; quieter button chrome  
- Narrow main toolbar: extra right padding for Hypo chrome  
- Line height no longer stored in localStorage  
- Stop icon: Lucide square  

### Fixed

- Link double percent-encoding (W/D diacritics; Luz single encode)  
- Settings overlay PT strings; Apply footer always visible  
- PT search placeholder **Procurar**; Links → **Ligações**  

---

## 0.1.0-dev (prior)

### Added

- PR 0–5 scaffold through settings/PWA  
- Brand **L∙I∙B∙R∙U∙S** — *annotate to assimilate*  
- Reader three-pane, linker, LDE compile, Hypothesis  
- Collapsible related-terms; link stats; Lucide icons  

See git history for full detail before 0.2.0-beta.
