/**
 * Block 1 of 1 — reader/typography.js
 * Description: Display menu — book typography sliders (chrome-safe)
 * Version: 1.b
 * Revised: 21Jul26
 */

import {
  loadSettings,
  saveSettings,
  FONT_SCALES,
  FONT_SCALE_LABELS,
  LINE_HEIGHTS,
  LINE_HEIGHT_LABELS,
  MEASURES,
  MEASURE_LABELS
} from '../shared/storage.js';
import { applyTypography } from '../shared/theme.js';
import { assetBase } from '../shared/paths.js';

/** @type {Record<string, string>} */
let strings = {};

/**
 * @param {Record<string, string>} s
 */
export function setTypographyStrings(s) {
  strings = s || {};
  syncTypographyUi(loadSettings());
}

function t(key, fallback) {
  return strings[key] || fallback;
}

function idxOf(list, value, fallback = 0) {
  const i = list.indexOf(value);
  return i < 0 ? fallback : i;
}

function semanticFont(scale) {
  const i = idxOf(FONT_SCALES, scale, 2);
  const key = 'reader.font.' + (FONT_SCALE_LABELS[i] || 'M').toLowerCase();
  return t(key, FONT_SCALE_LABELS[i] || 'M');
}

function semanticLh(lh) {
  const i = idxOf(LINE_HEIGHTS, lh, 1);
  const keys = ['reader.lhTight', 'reader.lhSnug', 'reader.lhNormal', 'reader.lhRelaxed', 'reader.lhAiry'];
  const fallbacks = LINE_HEIGHT_LABELS;
  return t(keys[i] || 'reader.lhNormal', fallbacks[i] || 'Normal');
}

function semanticMeasure(m) {
  const i = idxOf(MEASURES, m || 'md', 1);
  const keys = ['reader.measureNarrow', 'reader.measureNormal', 'reader.measureWide'];
  return t(keys[i] || 'reader.measureNormal', MEASURE_LABELS[i] || 'Normal');
}

/**
 * Sync sliders / labels / justify from settings.
 * @param {ReturnType<typeof loadSettings>} settings
 */
export function syncTypographyUi(settings) {
  const fi = idxOf(FONT_SCALES, settings.fontScale, 2);
  const fontSlider = document.getElementById('font-scale-slider');
  const fontLabel = document.getElementById('font-scale-label');
  if (fontSlider) fontSlider.value = String(fi);
  if (fontLabel) fontLabel.textContent = semanticFont(FONT_SCALES[fi]);

  const li = idxOf(LINE_HEIGHTS, settings.lineHeight, 1);
  const lhSlider = document.getElementById('line-height-slider');
  const lhLabel = document.getElementById('line-height-label');
  if (lhSlider) lhSlider.value = String(li);
  if (lhLabel) lhLabel.textContent = semanticLh(LINE_HEIGHTS[li]);

  const mi = idxOf(MEASURES, settings.measure || 'md', 1);
  const mSlider = document.getElementById('measure-slider');
  const mLabel = document.getElementById('measure-label');
  if (mSlider) mSlider.value = String(mi);
  if (mLabel) mLabel.textContent = semanticMeasure(MEASURES[mi]);

  const justBtn = document.getElementById('btn-justify-toggle');
  const justIcon = document.getElementById('justify-toggle-icon');
  const on = settings.textJustify === true;
  if (justBtn) {
    justBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    justBtn.classList.toggle('is-on', on);
    const tip = on
      ? t('reader.justifyOn', 'Justified — click for left align')
      : t('reader.justifyOff', 'Left align — click for justify');
    justBtn.title = tip;
    justBtn.setAttribute('aria-label', tip);
  }
  if (justIcon) {
    justIcon.src = assetBase() + 'icons/' + (on ? 'align-justify.svg' : 'align-left.svg');
  }
}

/**
 * Wire display-menu typography controls (book only; chrome unaffected).
 */
export function wireTypography() {
  let settings = loadSettings();
  applyTypography(settings);
  syncTypographyUi(settings);

  const stop = (e) => e.stopPropagation();

  const bindSlider = (id, onChange) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      stop(e);
      onChange(Number(el.value));
    });
    el.addEventListener('click', stop);
    el.addEventListener('pointerdown', stop);
  };

  bindSlider('font-scale-slider', (i) => {
    settings = loadSettings();
    settings.fontScale = FONT_SCALES[Math.max(0, Math.min(FONT_SCALES.length - 1, i))];
    settings = saveSettings(settings);
    applyTypography(settings);
    syncTypographyUi(settings);
  });

  bindSlider('line-height-slider', (i) => {
    settings = loadSettings();
    settings.lineHeight = LINE_HEIGHTS[Math.max(0, Math.min(LINE_HEIGHTS.length - 1, i))];
    settings = saveSettings(settings);
    applyTypography(settings);
    syncTypographyUi(settings);
  });

  bindSlider('measure-slider', (i) => {
    settings = loadSettings();
    settings.measure = MEASURES[Math.max(0, Math.min(MEASURES.length - 1, i))];
    settings = saveSettings(settings);
    applyTypography(settings);
    syncTypographyUi(settings);
  });

  document.getElementById('btn-justify-toggle')?.addEventListener('click', (e) => {
    stop(e);
    settings = loadSettings();
    settings.textJustify = !settings.textJustify;
    settings = saveSettings(settings);
    applyTypography(settings);
    syncTypographyUi(settings);
  });
}
