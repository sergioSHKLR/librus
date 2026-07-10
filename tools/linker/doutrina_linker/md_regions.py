"""Markdown region model — what may be scanned or linked."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Iterator

HEADING_RE = re.compile(r"^#{1,6}\s+")
FRONTMATTER_END = re.compile(r"^---\s*$")
FENCE_OPEN = re.compile(r"^:::\s*(.+)$")
FENCE_CLOSE = re.compile(r"^:::\s*$")
TERMOS_RE = re.compile(r"termos\s+relacionados", re.IGNORECASE)
INDICE_START_RE = re.compile(r"^###\s+6\.02\.\s+.*[Íí]ndice\s+geral", re.IGNORECASE)
INDICE_END_RE = re.compile(r"^###\s+6\.03\.", re.IGNORECASE)
LINK_RE = re.compile(r"\[[^\]]+\]\([^)]+\)")
CODE_RE = re.compile(r"`[^`]+`")
FOOTNOTE_RE = re.compile(r"\[\^[^\]]+\]")
HTML_LINK_RE = re.compile(r"<a\b[^>]*>.*?</a>", re.IGNORECASE)

# Fence types whose *inner* prose is still linkable (spirit messages, quotes, …)
LINKABLE_FENCE_TYPES = frozenset({"spirit", "quote", "aside", "note"})
# Fence types that stay fully protected even when fenced_blocks is refined
OPAQUE_FENCE_PREFIXES = (
    "expand",
    "center",
    "info",
    "warning",
    "tip",
    "details",
)


class RegionKind(str, Enum):
    FRONTMATTER = "frontmatter"
    HEADING = "heading"
    FENCED = "fenced"
    TERMOS = "termos_relacionados"
    INDICE_GERAL = "indice_geral"
    BODY = "body"


@dataclass
class LineContext:
    line_no: int
    text: str
    kind: RegionKind
    h2_section: str = ""
    h4_section: str = ""
    h6_section: str = ""
    paragraph_id: int = 0
    linkable_spans: list[tuple[int, int]] = field(default_factory=list)


@dataclass
class DocumentMap:
    lines: list[LineContext] = field(default_factory=list)
    h2_sections: list[str] = field(default_factory=list)


def _is_termos_block(title: str) -> bool:
    return bool(TERMOS_RE.search(title or ""))


def _fence_is_opaque(title: str, protect: dict) -> bool:
    """Return True if fence contents must not be scanned for links."""
    raw = (title or "").strip()
    kind = raw.split()[0].lower() if raw else ""

    if protect.get("termos_relacionados", True) and _is_termos_block(raw):
        return True
    if kind in LINKABLE_FENCE_TYPES:
        return False
    if any(kind.startswith(p) for p in OPAQUE_FENCE_PREFIXES):
        return True
    # Default: treat unknown fences as opaque when fenced_blocks protection is on
    return bool(protect.get("fenced_blocks", True))


def _linkable_slices(line: str, protect: dict) -> list[tuple[int, int]]:
    if not line.strip():
        return []
    blocked: list[tuple[int, int]] = []
    if protect.get("existing_links", True):
        for m in LINK_RE.finditer(line):
            blocked.append((m.start(), m.end()))
        for m in HTML_LINK_RE.finditer(line):
            blocked.append((m.start(), m.end()))
    if protect.get("inline_code", True):
        for m in CODE_RE.finditer(line):
            blocked.append((m.start(), m.end()))
    if protect.get("footnotes", True):
        for m in FOOTNOTE_RE.finditer(line):
            blocked.append((m.start(), m.end()))

    blocked.sort()
    merged: list[tuple[int, int]] = []
    for start, end in blocked:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))

    spans: list[tuple[int, int]] = []
    cursor = 0
    for start, end in merged:
        if cursor < start:
            spans.append((cursor, start))
        cursor = max(cursor, end)
    if cursor < len(line):
        spans.append((cursor, len(line)))
    return [(s, e) for s, e in spans if e > s]


def build_document_map(text: str, protect: dict | None = None) -> DocumentMap:
    protect = protect or {}
    lines = text.splitlines()
    doc = DocumentMap()
    in_frontmatter = False
    frontmatter_done = False
    fence_depth = 0
    fence_is_termos = False
    fence_opaque = False
    in_indice_geral = False
    current_h2 = ""
    current_h4 = ""
    current_h6 = ""
    paragraph_id = 0
    in_paragraph = False

    for idx, raw in enumerate(lines, start=1):
        line = raw

        if protect.get("frontmatter", True) and not frontmatter_done:
            if idx == 1 and line.strip() == "---":
                in_frontmatter = True
                doc.lines.append(
                    LineContext(idx, line, RegionKind.FRONTMATTER, current_h2, current_h4, current_h6, 0)
                )
                continue
            if in_frontmatter:
                doc.lines.append(
                    LineContext(idx, line, RegionKind.FRONTMATTER, current_h2, current_h4, current_h6, 0)
                )
                if FRONTMATTER_END.match(line):
                    in_frontmatter = False
                    frontmatter_done = True
                continue
            frontmatter_done = True

        if protect.get("indice_geral", True) and INDICE_START_RE.match(line.strip()):
            in_indice_geral = True
        elif in_indice_geral and INDICE_END_RE.match(line.strip()):
            in_indice_geral = False

        close_match = FENCE_CLOSE.match(line.strip())
        open_match = FENCE_OPEN.match(line.strip()) if not close_match else None

        if fence_depth > 0:
            if close_match:
                # Fence delimiter itself never linked
                kind = RegionKind.TERMOS if fence_is_termos else RegionKind.FENCED
                doc.lines.append(
                    LineContext(idx, line, kind, current_h2, current_h4, current_h6, 0)
                )
                fence_depth = 0
                fence_is_termos = False
                fence_opaque = False
                in_paragraph = False
                continue

            if fence_opaque:
                kind = RegionKind.TERMOS if fence_is_termos else RegionKind.FENCED
                doc.lines.append(
                    LineContext(idx, line, kind, current_h2, current_h4, current_h6, paragraph_id)
                )
                continue

            # Transparent fence (e.g. ::: spirit) — treat inner lines as body
            if line.strip():
                if not in_paragraph:
                    paragraph_id += 1
                    in_paragraph = True
                spans = _linkable_slices(line, protect)
                doc.lines.append(
                    LineContext(
                        idx,
                        line,
                        RegionKind.BODY,
                        current_h2,
                        current_h4,
                        current_h6,
                        paragraph_id,
                        spans,
                    )
                )
            else:
                in_paragraph = False
                doc.lines.append(
                    LineContext(idx, line, RegionKind.BODY, current_h2, current_h4, current_h6, 0, [])
                )
            continue

        if open_match:
            title = open_match.group(1).strip()
            fence_is_termos = protect.get("termos_relacionados", True) and _is_termos_block(title)
            fence_opaque = fence_is_termos or _fence_is_opaque(title, protect)
            kind = RegionKind.TERMOS if fence_is_termos else RegionKind.FENCED
            doc.lines.append(
                LineContext(idx, line, kind, current_h2, current_h4, current_h6, 0)
            )
            fence_depth = 1
            in_paragraph = False
            continue

        if protect.get("headings", True) and HEADING_RE.match(line):
            if line.startswith("## ") and not line.startswith("### "):
                current_h2 = line.lstrip("#").strip()
                doc.h2_sections.append(current_h2)
            if line.startswith("#### ") and not line.startswith("##### "):
                current_h4 = line.lstrip("#").strip()
            if line.startswith("###### "):
                current_h6 = line.lstrip("#").strip()
            doc.lines.append(
                LineContext(
                    idx, line, RegionKind.HEADING,
                    current_h2, current_h4, current_h6, 0,
                )
            )
            in_paragraph = False
            continue

        if in_indice_geral and protect.get("indice_geral", True):
            doc.lines.append(
                LineContext(idx, line, RegionKind.INDICE_GERAL, current_h2, current_h4, current_h6, 0)
            )
            in_paragraph = False
            continue

        if line.strip():
            if not in_paragraph:
                paragraph_id += 1
                in_paragraph = True
            spans = _linkable_slices(line, protect)
            doc.lines.append(
                LineContext(
                    idx,
                    line,
                    RegionKind.BODY,
                    current_h2,
                    current_h4,
                    current_h6,
                    paragraph_id,
                    spans,
                )
            )
        else:
            in_paragraph = False
            doc.lines.append(
                LineContext(idx, line, RegionKind.BODY, current_h2, current_h4, current_h6, 0, [])
            )

    return doc


def iter_linkable_text(
    doc: DocumentMap,
) -> Iterator[tuple[int, int, int, str, str, str, str, int]]:
    """Yield (line_no, col_start, col_end, text, h2, h4, h6, paragraph_id)."""
    for ctx in doc.lines:
        if ctx.kind != RegionKind.BODY:
            continue
        if ctx.paragraph_id <= 0:
            continue
        for start, end in ctx.linkable_spans:
            chunk = ctx.text[start:end]
            if chunk.strip():
                yield (
                    ctx.line_no,
                    start,
                    end,
                    chunk,
                    ctx.h2_section,
                    ctx.h4_section,
                    ctx.h6_section,
                    ctx.paragraph_id,
                )
