# L∙I∙B∙R∙U∙S — Brand guidelines

**Product lockup:** `L∙I∙B∙R∙U∙S` (U+2219 dots) — **logo only**, not running prose  
**Prose name:** **LIBRUS** · **Domain / URLs:** **librus.app** (lowercase)  
**Brand slogan (splash):** *annotate to assimilate* (PT: *anotar para assimilar*)  
**Library CTA (under wordmark):** *Read. Consult. Annotate.* (PT: *Leia. Consulte. Anote.*)  
**Mark:** Lucide **columns-3** · colors **black / white** (invert in dark)  
**Locale default:** English (PT “Soon” until unlocked)  
**Espírita product on this engine:** [DOUTRINA](https://doutrina.org) (content + packaging; CTA *Hidrate seu espírito*)

This document is the source of truth for splash, library, reader chrome, and marketing. When splash and library disagree, **change code to match this file**.

---

## 0. Name origin

| Layer | Meaning |
|-------|---------|
| **Echo** | Close to Latin **librīs** / *liber* — **books** (the feel of a library, not a news portal) |
| **Backronym** | **L**oosely **I**ntegrated **B**ook **R**eading **U**niversal **S**ystem |

**How to use in copy**

- Prefer the **Latin echo** in human-facing prose (“a system for books”).  
- The **backronym** is fine in About, docs, and talks — not required in every sentence.  
- **Loosely integrated** = notes, book, and consult are coordinated panes, not one monolith CMS; **universal** = any long-form corpus (Holmes, codificação, center house book), not one religion or publisher only.

Do **not** invent alternate expansions (e.g. random words for each letter) in official materials.

---

## 1. Positioning

| | |
|--|--|
| **One-liner** | Study library: annotate to assimilate — notes, book, and consult side by side. |
| **Feeling** | Charcoal desk · method · deduction · quiet focus |
| **Audience** | Readers annotating long-form texts (Holmes first; platform is generic) |

---

## 2. Wordmark & icons

| Element | Spec |
|---------|------|
| **Wordmark** | `L∙I∙B∙R∙U∙S` — capital letters separated by **DOT OPERATOR** (U+2219 `∙`) |
| **Short** | `LIBRUS` (code, domains, speech) |
| **Beta** | lowercase `beta` as superscript |
| **Product mark** | Lucide **columns-3** — `icons/brand.svg`, `icons/favicon.svg` |
| **Cover mark** | **Holmes** silhouette — `icons/holmes.svg` **only on book covers** |

**Do not** put Holmes on the library header, splash brand lockup, favicon, or toolbar.  
**Do not** put columns-3 on Holmes cover faces.

**Lockup (splash + library):**  
`[columns-3 32px]  L∙I∙B∙R∙U∙S<sup>beta</sup>`  
        `annotate to assimilate`

Same order, same hierarchy, same **brand** icon asset in **splash** and **library header**.

---

## 3. Tagline

| Lang | Tagline |
|------|---------|
| Surface | EN | PT |
|---------|----|----|
| **Splash (brand slogan)** | annotate to assimilate | anotar para assimilar |
| **Library (under wordmark)** | Read. Consult. Annotate. | Leia. Consulte. Anote. |

- Library locales: `tagline` key (action triad; no “wide screen” lead)  
- Splash: `.study-note-brand-tagline` from constants  
- Do not put a “research on a wide screen” line on the library home

---

## 4. Color system

### 4.1 Splash (charcoal field)

| Token | Hex | Use |
|-------|-----|-----|
| Splash deep | `#1a1c1e` | Backdrop edge |
| Splash mid | `#2c3036` – `#3a3f46` | Radial vignette |
| Emboss text | `rgba(230, 234, 240, 0.4)` | Brand name |
| Brand icon on splash | Lightened columns-3 (CSS invert + emboss shadow) |

Backdrop: charcoal radial vignette (`.study-note-modal--charcoal`).

### 4.2 App chrome (library + reader)

| Token | Light | Dark | CSS var |
|-------|-------|------|---------|
| Background | `#ffffff` | `#1a1a1a` | `--bg` |
| Surface | `#f8f8f8` | `#242424` | `--surface` |
| Text | `#333333` | `#eeeeee` | `--text` |
| Muted | `#666666` | `#aaaaaa` | `--text-muted` |
| Border | `#dddddd` | `#333333` | `--border` |
| Accent | `#0066cc` | `#4da6ff` | `--accent` |
| Mark highlight | `#fff3a8` | `#5c4d00` | `--mark-bg` |
| Research links | `#3d5cff` | `#7aacff` | `--provider-*` |

### 4.3 Book covers (same rules as DOUTRINA)

| `cover.colors` | Result |
|----------------|--------|
| **1 color** | Solid fill |
| **2+ colors** | Linear gradient; `cover.angle` (default **135**) |

| Field | Spec |
|-------|------|
| Icon | `holmes` → white stroke on the face (`filter: brightness(0) invert(1)`) |
| Catalog | Per-title `colors` + `angle` + `icon` (no leather/gold finish) |

### 4.4 Splash post-it

| Spec | Value |
|------|--------|
| Size | 3in × 3in |
| Paper | `#fbf9aa` (charcoal mock) / soft yellow |
| Type | Oooh Baby · ~21–23px |
| Ink | `#313d42` |

---

## 5. Typography

| Role | Family | Notes |
|------|--------|--------|
| **UI / brand name** | system-ui (`--font-ui`) | Library & reader |
| **Splash brand** | Same stack, embossed | Letter-spacing ~0.08em |
| **Hand note** | **Oooh Baby** | Splash post-it only |
| **Book body** | `--font-book` | Reader |

**Library brand title:** ~1.35rem, weight 700, letter-spacing ~0.08em (match splash).  
**Tagline:** ~0.85rem, muted.

---

## 6. Surfaces: splash vs library

| | Splash | Library / reader |
|--|--------|------------------|
| **Background** | Charcoal vignette | Neutral `--bg` |
| **Brand treatment** | Embossed light-on-charcoal | Flat (dark mode: invert icons) |
| **Icon** | columns-3 (`brand.svg`) | columns-3 (`brand.svg`) |
| **Wordmark** | L∙I∙B∙R∙U∙S + beta | L∙I∙B∙R∙U∙S + beta |
| **Tagline** | annotate to assimilate | annotate to assimilate |
| **Covers** | — | Leather + gold Holmes |

**Rule:** Only *treatment* (emboss vs flat, charcoal field vs paper UI) may differ. **Name, product icon, tagline, and letterforms must not diverge.**

Reference HTML mock (`librus.html`) should use **columns-3** and the same tagline — not a one-off icon or typeface for the lockup.

---

## 7. Icon roles (do not mix)

| Asset | Role |
|-------|------|
| `brand.svg` / `favicon.svg` | Product identity (columns-3) |
| `holmes.svg` | Book cover stamp only |
| Lucide UI set | Toolbar (search, theme, links, …) |

---

## 8. Voice & copy

- EN primary; dry, precise, slightly literary  
- Tagline verb pair: *annotate* → *assimilate*  
- Prefer *consult / annotate / read* for the three panes  
- **No Luz Espírita** in LIBRUS (UI, linker, or copy). Luz remains **DOUTRINA-only**.

---

## 9. Checklist (new UI)

- [ ] Wordmark uses U+2219 dots: `L∙I∙B∙R∙U∙S`  
- [ ] Product icon is columns-3  
- [ ] Tagline is *annotate to assimilate*  
- [ ] Splash charcoal emboss; library neutral tokens  
- [ ] Holmes covers: leather + gold foil only  
- [ ] No droplet / DOUTRINA marks  
