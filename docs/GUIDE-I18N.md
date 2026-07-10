# UI i18n (EN first, PT second)

Only chrome strings. Book text is not translated by this system.

## Files

- `src/locales/en.json` — complete default  
- `src/locales/pt.json` — full parity  

## Usage

```html
<span data-i18n="library.title">Library</span>
```

```js
import { loadLocale, applyI18n } from '../i18n/i18n.js';
const strings = await loadLocale('en');
applyI18n(document, strings);
```

## Adding a key

1. Add to `en.json`  
2. Add to `pt.json`  
3. Use `data-i18n="key"` or `t(strings, key)`  
