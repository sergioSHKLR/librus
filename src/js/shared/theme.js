/**
 * Block 1 of 1 — shared/theme.js
 * Description: Apply light/dark/system theme and book typography
 * Version: 1.c
 * Revised: 21Jul26
 */

/** PWA / browser chrome colors (status bar, title bar) */
const THEME_COLOR_DARK = '#000000';
const THEME_COLOR_LIGHT = '#ffffff';

export function isEffectivelyDark(theme) {
  return (
    theme === 'dark' ||
    (theme === 'system' &&
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

export function nextTheme(theme) {
  if (theme === 'light') return 'dark';
  if (theme === 'dark') return 'system';
  return 'light';
}

/**
 * Keep <meta name="theme-color"> in sync so PWA window chrome matches theme.
 * @param {'light'|'dark'|'system'} theme
 */
function applyThemeColor(theme) {
  if (typeof document === 'undefined') return;
  const color = isEffectivelyDark(theme) ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

/**
 * Swap favicon when effective dark mode changes (SVG media queries
 * often fail to refresh on OS theme switch).
 * @param {'light'|'dark'|'system'} theme
 * @param {string} [base] asset base e.g. '' or '../'
 */
export function syncFavicon(theme, base = '') {
  const dark = isEffectivelyDark(theme);
  const href = base + 'icons/' + (dark ? 'favicon-dark.svg' : 'favicon.svg');
  let link = document.querySelector('link[rel="icon"][data-app-favicon]');
  if (!link) {
    link = document.querySelector('link[rel="icon"]');
  }
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.setAttribute('data-app-favicon', '1');
  link.type = 'image/svg+xml';
  /* cache-bust so browsers re-fetch on scheme change */
  link.href = href + (href.includes('?') ? '&' : '?') + 't=' + (dark ? 'd' : 'l');
}

/**
 * @param {'light'|'dark'|'system'} theme
 * @param {{ iconEl?: HTMLImageElement|null, btnEl?: HTMLElement|null, assetBase?: string, labels?: { light: string, dark: string, system: string } }} ui
 */
export function applyTheme(theme, ui = {}) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
    root.style.colorScheme = 'light dark';
  } else {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }

  applyThemeColor(theme);

  const base = ui.assetBase || '';
  const labels = ui.labels || {
    light: 'Theme: light — click for dark',
    dark: 'Theme: dark — click for system',
    system: 'Theme: system — click for light'
  };
  const tip = labels[theme] || labels.system;
  const iconName = theme === 'system' ? 'device.svg' : theme === 'dark' ? 'moon.svg' : 'sun.svg';

  if (ui.iconEl) {
    ui.iconEl.src = base + 'icons/' + iconName;
    ui.iconEl.alt = '';
  }
  if (ui.btnEl) {
    ui.btnEl.title = tip;
    ui.btnEl.setAttribute('aria-label', tip);
    ui.btnEl.setAttribute('data-theme-mode', theme);
  }

  if (base !== undefined) syncFavicon(theme, base);
}

/**
 * Apply **book** typography only (--book-*). Chrome UI stays fixed size.
 * @param {{ fontScale?: number, lineHeight?: number, textJustify?: boolean, measure?: string }} settings
 */
export function applyTypography(settings = {}) {
  const root = document.documentElement;
  const font = settings.fontScale != null ? settings.fontScale : 1;
  const lh = settings.lineHeight != null ? settings.lineHeight : 1.6;
  const measure = settings.measure || 'md';
  const measureRem = { sm: 32, md: 42, lg: 56 }[measure] || 42;

  root.style.setProperty('--book-font-scale', String(font));
  root.style.setProperty('--book-line-height', String(lh));
  root.style.setProperty('--reader-measure', measureRem + 'rem');
  root.style.setProperty('--book-text-align', settings.textJustify ? 'justify' : 'start');
  root.setAttribute('data-text-justify', settings.textJustify ? '1' : '0');
  root.setAttribute('data-measure', measure);
}
