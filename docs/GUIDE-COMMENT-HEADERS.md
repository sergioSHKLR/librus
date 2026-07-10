# Block comment headers

Every major CSS / HTML / JS block uses a numbered header.

## Format

**Version:** major = **number**, minor = **letter(s)** → `1.a`, `1.b`, `2.a`  
**Revised:** `YYMMDD HH:MM`

### CSS

```css
/* ==========================================================================
 * Block N of M — Short title
 * Description: one line
 * Version: 1.a
 * Revised: 260710 16:00
 * ========================================================================== */
```

### HTML

```html
<!--
  Block N of M — Short title
  Description: one line
  Version: 1.a
  Revised: 260710 16:00
-->
```

### JS

```js
/**
 * Block 1 of 1 — path/name.js
 * Description: one line
 * Version: 1.a
 * Revised: 260710 16:00
 */
```

## Checks

```bash
npm run check          # pre-build / anytime
npm run build          # runs check first; FAIL aborts
```

Browser: `?debug=1` or `localStorage nano-ssg-debug=1` → integrity summary.

Allowlist: `tools/check-blocks.allowlist`
