"""Text normalization for Portuguese matching."""

from __future__ import annotations

import re
import unicodedata

_NON_WORD = re.compile(r"[^\wÀ-ÿ]+", re.UNICODE)
# Word chars in *folded* space (ASCII + still keep latin letters)
_FOLDED_WORD = re.compile(r"[0-9A-Za-z_]")


def strip_accents(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def normalize_key(text: str) -> str:
    return strip_accents((text or "").casefold()).strip()


def collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def fold_match_index(text: str) -> tuple[str, list[int]]:
    """Accent-fold *text* for matching; return (folded, orig_index_per_folded_char).

    Patterns built with strip_accents() can then run on `folded`. Map a match
    span [fs, fe) back to original with:
        orig_start = index_map[fs]
        orig_end   = index_map[fe - 1] + 1
    """
    folded_chars: list[str] = []
    index_map: list[int] = []
    for i, ch in enumerate(text):
        base = strip_accents(ch)
        if not base:
            # Combining mark alone — skip in folded view
            continue
        for b in base:
            folded_chars.append(b)
            index_map.append(i)
    return "".join(folded_chars), index_map


def map_folded_span(index_map: list[int], start: int, end: int) -> tuple[int, int]:
    """Map a half-open span in folded space to the original string."""
    if start >= end or not index_map or start >= len(index_map):
        return start, end
    orig_start = index_map[start]
    orig_end = index_map[min(end, len(index_map)) - 1] + 1
    return orig_start, orig_end


def word_boundary_pattern(term: str) -> re.Pattern[str]:
    """Match *term* on word boundaries against an *accent-folded* body string."""
    parts = [re.escape(strip_accents(p)) for p in collapse_ws(term).split(" ") if p]
    if not parts:
        return re.compile(r"(?!x)x")
    inner = r"\s+".join(parts)
    # Boundaries in folded ASCII-ish space
    return re.compile(rf"(?<![0-9A-Za-z_À-ÿ]){inner}(?![0-9A-Za-z_À-ÿ])", re.IGNORECASE | re.UNICODE)


def slugify_anchor(text: str) -> str:
    base = strip_accents(text.casefold())
    base = _NON_WORD.sub("-", base)
    return base.strip("-")
