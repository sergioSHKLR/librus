/**
 * Block 1 of 1 — shared/theme.js
 * Description: Apply light/dark/system theme and cycle helper
 * Version: 1.a
 * Revised: 10Jul26
 */

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
}

export function applyTypography(settings) {
  const root = document.documentElement;
  if (settings.fontScale) root.style.setProperty('--font-scale', String(settings.fontScale));
  if (settings.lineHeight) root.style.setProperty('--line-height', String(settings.lineHeight));
}
