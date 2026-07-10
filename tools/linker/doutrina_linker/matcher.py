"""Dictionary matching against linkable Markdown text.

Matching direction: dictionary → text (smaller curated set).

When a term appears multiple times, providers rotate in domain order —
each provider used at most once per concept:

  spiritism  → 1st Luz, 2nd Wiki, 3rd Dic
  general    → 1st Wiki, 2nd Luz, 3rd Dic
  definition → Dic only
  place      → Maps first, then Wiki/Luz/Dic if present

Further mentions of the same term stay unlinked once the rotation is spent.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field

from .dictionaries import DictEntry
from .md_regions import DocumentMap, iter_linkable_text
from .normalize import fold_match_index, map_folded_span, normalize_key, word_boundary_pattern
from .providers import (
    PROVIDER_PRIORITY,
    classify_hit_group_domain,
    provider_order_for_domain,
)


@dataclass
class MatchHit:
    provider: str
    label: str
    url: str
    matched_text: str
    line: int
    col: int
    end_col: int
    h2_section: str = ""
    h6_section: str = ""
    paragraph_id: int = 0
    normalized: str = ""
    concept_norm: str = ""
    slug: str = ""
    interest: str = "med"
    domain: str = "general"


@dataclass
class TermIndex:
    provider: str
    label: str
    url: str
    slug: str
    pattern_label: str
    regex: object
    normalized: str
    concept_norm: str
    interest: str = "med"
    domain: str = "general"


def _entry_patterns(entry: DictEntry) -> tuple[list[tuple[str, object]], str]:
    labels = [entry.label] + list(entry.aliases)
    seen: set[str] = set()
    out: list[tuple[str, object]] = []
    concept = normalize_key(entry.label)
    for label in labels:
        key = normalize_key(label)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append((label, word_boundary_pattern(label)))
    return out, concept


def build_indexes(
    dictionaries: dict[str, list[DictEntry]],
    providers: list[str],
) -> dict[str, list[TermIndex]]:
    by_provider: dict[str, list[TermIndex]] = {}
    for provider in providers:
        indexes: list[TermIndex] = []
        for entry in dictionaries.get(provider, []):
            patterns, concept = _entry_patterns(entry)
            for label, regex in patterns:
                indexes.append(
                    TermIndex(
                        provider=provider,
                        label=entry.label,
                        url=entry.url,
                        slug=entry.slug,
                        pattern_label=label,
                        regex=regex,
                        normalized=normalize_key(label),
                        concept_norm=concept,
                        interest=entry.interest,
                        domain=entry.domain,
                    )
                )
        indexes.sort(key=lambda i: len(i.pattern_label), reverse=True)
        by_provider[provider] = indexes
    return by_provider


def _find_raw_matches(
    chunk: str,
    line: int,
    col_offset: int,
    h2: str,
    h6: str,
    paragraph_id: int,
    indexes: list[TermIndex],
) -> list[MatchHit]:
    hits: list[MatchHit] = []
    occupied: list[tuple[int, int]] = []
    folded, index_map = fold_match_index(chunk)

    for index in indexes:
        for m in index.regex.finditer(folded):
            f_start, f_end = m.start(), m.end()
            start, end = map_folded_span(index_map, f_start, f_end)
            if any(start < oe and end > os for os, oe in occupied):
                continue
            matched = chunk[start:end]
            hits.append(
                MatchHit(
                    provider=index.provider,
                    label=index.label,
                    url=index.url,
                    slug=index.slug,
                    matched_text=matched,
                    line=line,
                    col=col_offset + start,
                    end_col=col_offset + end,
                    h2_section=h2,
                    h6_section=h6,
                    paragraph_id=paragraph_id,
                    normalized=index.normalized,
                    concept_norm=index.concept_norm,
                    interest=index.interest,
                    domain=index.domain,
                )
            )
            occupied.append((start, end))

    return hits


def _drop_overlapping_concepts(candidates: list[MatchHit]) -> list[MatchHit]:
    """Keep multi-provider hits on the same span; drop overlapping *different* concepts.

    Longer spans win. Same-span multi-provider groups are all retained for rotation.
    """
    if not candidates:
        return []

    by_span: dict[tuple[int, int, int], list[MatchHit]] = defaultdict(list)
    for hit in candidates:
        by_span[(hit.line, hit.col, hit.end_col)].append(hit)

    # One concept per span (if conflicting labels somehow, keep longest label group)
    span_groups: list[list[MatchHit]] = []
    for group in by_span.values():
        by_concept: dict[str, list[MatchHit]] = defaultdict(list)
        for h in group:
            by_concept[h.concept_norm].append(h)
        if len(by_concept) == 1:
            span_groups.append(group)
        else:
            best = max(
                by_concept.values(),
                key=lambda g: (g[0].end_col - g[0].col, len(g[0].matched_text)),
            )
            span_groups.append(best)

    # Greedy non-overlap across different spans (longest first)
    span_groups.sort(
        key=lambda g: (-(g[0].end_col - g[0].col), g[0].line, g[0].col)
    )
    kept_groups: list[list[MatchHit]] = []
    occupied: list[tuple[int, int, int, str]] = []
    for group in span_groups:
        h0 = group[0]
        conflict = False
        for line, col, end, concept in occupied:
            if h0.line != line:
                continue
            if not (h0.end_col <= col or h0.col >= end):
                if h0.concept_norm != concept:
                    conflict = True
                    break
                # same concept overlapping — should not happen for distinct spans
                conflict = True
                break
        if conflict:
            continue
        kept_groups.append(group)
        occupied.append((h0.line, h0.col, h0.end_col, h0.concept_norm))

    flat = [h for g in kept_groups for h in g]
    flat.sort(key=lambda h: (h.line, h.col, h.provider))
    return flat


def _assign_provider_rotation(
    hits: list[MatchHit],
    *,
    max_uses_per_provider: int = 1,
) -> list[MatchHit]:
    """For each concept, walk occurrences in document order and assign
    domain order (e.g. Luz → Wiki → Dic), one provider per occurrence.

    ``max_uses_per_provider`` how many times each provider may be used for
    the same concept in the whole document (1 = Prefácio-style; higher for
    long novels so the cycle can repeat).
    """
    max_uses = max(1, int(max_uses_per_provider))

    by_span: dict[tuple[int, int, int, str], list[MatchHit]] = defaultdict(list)
    for h in hits:
        by_span[(h.line, h.col, h.end_col, h.concept_norm)].append(h)

    concept_spans: dict[str, list[tuple[int, int, int]]] = defaultdict(list)
    seen_span: set[tuple[str, int, int, int]] = set()
    for h in sorted(hits, key=lambda x: (x.line, x.col)):
        key = (h.concept_norm, h.line, h.col, h.end_col)
        if key in seen_span:
            continue
        seen_span.add(key)
        concept_spans[h.concept_norm].append((h.line, h.col, h.end_col))

    assigned: list[MatchHit] = []
    for concept, spans in concept_spans.items():
        all_hits = [h for h in hits if h.concept_norm == concept]
        domain = classify_hit_group_domain(
            [h.domain for h in all_hits],
            [h.provider for h in all_hits],
        )
        order = provider_order_for_domain(domain)
        used_counts: dict[str, int] = defaultdict(int)
        # Round-robin index into domain order among still-available providers
        rr = 0

        for line, col, end in spans:
            group = by_span.get((line, col, end, concept), [])
            if not group:
                continue
            available = {h.provider: h for h in group}
            chosen = None
            # Prefer next provider in cycle that still has budget
            for offset in range(len(order)):
                prov = order[(rr + offset) % len(order)]
                if prov in available and used_counts[prov] < max_uses:
                    chosen = available[prov]
                    rr = (rr + offset + 1) % len(order)
                    break
            if chosen is None:
                continue
            used_counts[chosen.provider] += 1
            assigned.append(chosen)

    assigned.sort(key=lambda h: (h.line, h.col))
    return assigned


def scan_document(
    doc: DocumentMap,
    indexes_by_provider: dict[str, list[TermIndex]],
    provider_order: list[str] | None = None,
    max_uses_per_provider: int = 1,
) -> list[MatchHit]:
    active = provider_order or [
        p for p in PROVIDER_PRIORITY if p in indexes_by_provider
    ]
    active = [p for p in active if p in indexes_by_provider]

    raw: list[MatchHit] = []
    for line_no, col_start, _col_end, chunk, h2, _h4, h6, para_id in iter_linkable_text(
        doc
    ):
        for provider in active:
            raw.extend(
                _find_raw_matches(
                    chunk,
                    line_no,
                    col_start,
                    h2,
                    h6,
                    para_id,
                    indexes_by_provider.get(provider, []),
                )
            )

    multi = _drop_overlapping_concepts(raw)
    return _assign_provider_rotation(
        multi, max_uses_per_provider=max_uses_per_provider
    )


@dataclass
class Candidate:
    provider: str
    term: str
    url: str
    count: int
    positions: list[dict] = field(default_factory=list)
    normalized: str = ""
    concept_norm: str = ""
    interest: str = "med"
    domain: str = "general"
    slug: str = ""

    def to_dict(self) -> dict:
        return {
            "provider": self.provider,
            "term": self.term,
            "normalized": self.normalized,
            "concept_norm": self.concept_norm,
            "url": self.url,
            "slug": self.slug,
            "count": self.count,
            "interest": self.interest,
            "domain": self.domain,
            "positions": self.positions,
        }
