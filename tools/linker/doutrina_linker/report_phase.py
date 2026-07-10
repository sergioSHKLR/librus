"""Phase 1 — build link-candidate report JSON."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import load_config
from .dictionaries import load_all
from .matcher import Candidate, build_indexes, scan_document
from .md_regions import build_document_map
from .providers import interest_tier


def aggregate_hits(hits) -> list[Candidate]:
    buckets: dict[tuple[str, str, str], Candidate] = {}
    for hit in hits:
        key = (hit.provider, hit.label, hit.url)
        if key not in buckets:
            buckets[key] = Candidate(
                provider=hit.provider,
                term=hit.label,
                url=hit.url,
                slug=hit.slug,
                count=0,
                normalized=hit.normalized,
                concept_norm=hit.concept_norm,
                interest=hit.interest or "med",
                domain=getattr(hit, "domain", None) or "general",
            )
        cand = buckets[key]
        cand.count += 1
        if hit.interest == "hi":
            cand.interest = "hi"
        elif hit.interest == "med" and cand.interest == "lo":
            cand.interest = "med"
        cand.positions.append(
            {
                "line": hit.line,
                "col": hit.col,
                "end_col": hit.end_col,
                "matched_text": hit.matched_text,
                "h2_section": hit.h2_section,
                "h6_section": hit.h6_section,
                "paragraph_id": hit.paragraph_id,
            }
        )
    for cand in buckets.values():
        if not cand.interest:
            cand.interest = interest_tier(cand.count)
    return list(buckets.values())


def build_report(cfg: dict[str, Any]) -> dict[str, Any]:
    input_path = Path(cfg["input"])
    text = input_path.read_text(encoding="utf-8")
    doc = build_document_map(text, cfg.get("protect"))

    dictionaries = load_all(cfg)
    providers = list(cfg.get("providers") or ["wikipedia", "wiktionary", "maps"])
    active = [p for p in providers if dictionaries.get(p)]

    indexes_by_provider = build_indexes(dictionaries, active)
    max_uses = int(cfg.get("max_uses_per_provider", 1))
    hits = scan_document(
        doc,
        indexes_by_provider,
        provider_order=active,
        max_uses_per_provider=max_uses,
    )
    candidates = aggregate_hits(hits)
    candidates.sort(key=lambda c: (c.count, c.term.lower()))

    by_provider: dict[str, int] = {}
    by_interest: dict[str, int] = {}
    by_domain: dict[str, int] = {}
    for c in candidates:
        by_provider[c.provider] = by_provider.get(c.provider, 0) + 1
        by_interest[c.interest] = by_interest.get(c.interest, 0) + 1
        by_domain[c.domain] = by_domain.get(c.domain, 0) + 1

    return {
        "meta": {
            "source": str(input_path),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "phase": 1,
            "candidate_count": len(candidates),
            "match_count": sum(c.count for c in candidates),
            "sort": "frequency_asc",
            "providers_enabled": active,
            "provider_codes": {
                "luz": "l",
                "wikipedia": "w",
                "wiktionary": "d",
                "maps": "m",
            },
            "domain_provider_order": {
                "spiritism": ["luz", "wikipedia", "wiktionary"],
                "general": ["wikipedia", "luz", "wiktionary"],
                "definition": ["wiktionary"],
                "place": ["maps", "wikipedia", "luz", "wiktionary"],
            },
            "interest": {
                "meaning": "per_article_completeness",
                "note": "Interest is completeness of that provider's article, not a Wiki-vs-Luz rank",
            },
            "linking_rules": {
                "provider_rotation": "domain_order_once_each_per_concept",
                "spiritism_example": "1st Luz, 2nd Wiki, 3rd Dic; further mentions unlinked",
                "same_provider_url": "once_per_document",
            },
        },
        "stats": {
            "candidates_by_provider": by_provider,
            "candidates_by_interest": by_interest,
            "candidates_by_domain": by_domain,
            "h2_sections": len(doc.h2_sections),
        },
        "candidates": [c.to_dict() for c in candidates],
    }


def run_report(config_path: str | Path, report_path: str | Path | None = None) -> Path:
    cfg = load_config(config_path)
    report = build_report(cfg)
    out = Path(report_path or cfg.get("report") or "output/link-report.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out
