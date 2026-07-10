"""Phase 2 — insert links from report + density config.

Provider rotation (Luz → Wiki → Dic for spiritism, etc.) is already resolved
in Phase 1: each assigned hit is a distinct provider for that concept.
Insert only needs paragraph density caps — do not collapse multi-provider
cycles for the same term.
"""

from __future__ import annotations

import json
import shutil
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

from .config import density_settings, load_config
from .link_markup import render_link
from .md_regions import RegionKind, build_document_map
from .providers import normalize_interest, provider_code, tiers_for_density


def select_candidates(report: dict, cfg: dict[str, Any]) -> list[dict]:
    density = density_settings(cfg)
    min_len = int(density.get("min_term_length", 3))
    max_per_para = int(density.get("max_links_per_paragraph", 40))
    # Same *provider* for same concept: once (rotation already unique per provider)
    max_same_article = int(density.get("max_same_article_per_document", 1))
    min_chars = int(density.get("min_chars_between_links", 0))

    enabled = set(cfg.get("providers") or [])
    only_tiers = cfg.get("insert_interest_tiers")
    if only_tiers is None and cfg.get("filter_by_density_tiers"):
        only_tiers = tiers_for_density(str(cfg.get("density", "hi")))
    only_tiers_set = {normalize_interest(t) for t in only_tiers} if only_tiers else None

    flat: list[dict] = []
    for cand in report.get("candidates", []):
        provider = cand.get("provider", "")
        if enabled and provider not in enabled:
            continue
        term = cand.get("term", "")
        if len(term) < min_len:
            continue
        norm = cand.get("concept_norm") or cand.get("normalized") or term.casefold()
        interest = normalize_interest(cand.get("interest"), default="med")
        if only_tiers_set is not None and interest not in only_tiers_set:
            continue
        pcode = provider_code(provider)
        url = cand["url"]
        slug = cand.get("slug") or term
        domain = cand.get("domain") or "general"

        for pos in cand.get("positions") or []:
            flat.append(
                {
                    "provider": provider,
                    "provider_code": pcode,
                    "interest": interest,
                    "domain": domain,
                    "term": term,
                    "concept_norm": norm,
                    "url": url,
                    "slug": slug,
                    "line": int(pos["line"]),
                    "col": int(pos["col"]),
                    "end_col": int(pos["end_col"]),
                    "matched_text": pos.get("matched_text") or term,
                    "h2_section": pos.get("h2_section") or "",
                    "h6_section": pos.get("h6_section") or "",
                    "paragraph_id": int(pos.get("paragraph_id") or 0),
                }
            )

    flat.sort(key=lambda c: (c["line"], c["col"]))

    chosen: list[dict] = []
    links_in_para: dict[int, int] = defaultdict(int)
    last_end_in_para: dict[int, int] = {}
    # Each provider+url once; each concept+provider once (keeps Luz/Wiki/Dic rotation)
    article_uses: dict[tuple[str, str], int] = defaultdict(int)
    concept_provider_uses: dict[tuple[str, str], int] = defaultdict(int)

    for item in flat:
        para = item["paragraph_id"]
        concept = item["concept_norm"]
        article_key = (item["provider_code"], item["url"])
        cp_key = (concept, item["provider"])

        if links_in_para[para] >= max_per_para:
            continue
        if article_uses[article_key] >= max_same_article:
            continue
        if concept_provider_uses[cp_key] >= max_same_article:
            continue
        if min_chars > 0 and para in last_end_in_para:
            prev = last_end_in_para[para]
            prev_line, prev_col = divmod(prev, 1_000_000)
            if item["line"] == prev_line and item["col"] - prev_col < min_chars:
                continue

        chosen.append(item)
        links_in_para[para] += 1
        article_uses[article_key] += 1
        concept_provider_uses[cp_key] += 1
        last_end_in_para[para] = item["line"] * 1_000_000 + item["end_col"]

    return chosen


def apply_insertions(
    text: str,
    insertions: list[dict],
    protect: dict,
    link_format: str = "md",
) -> str:
    lines = text.splitlines()
    by_line: dict[int, list[dict]] = defaultdict(list)
    for ins in insertions:
        by_line[ins["line"]].append(ins)

    doc = build_document_map(text, protect)
    protected_lines = {
        ctx.line_no
        for ctx in doc.lines
        if ctx.kind
        in {
            RegionKind.FRONTMATTER,
            RegionKind.HEADING,
            RegionKind.FENCED,
            RegionKind.TERMOS,
            RegionKind.INDICE_GERAL,
        }
    }

    for line_no in sorted(by_line):
        if line_no in protected_lines:
            continue
        row_insertions = sorted(by_line[line_no], key=lambda i: i["col"], reverse=True)
        line = lines[line_no - 1]
        for ins in row_insertions:
            start, end = ins["col"], ins["end_col"]
            if start < 0 or end > len(line) or start >= end:
                continue
            original = line[start:end]
            matched = ins.get("matched_text")
            if matched and original != matched:
                if matched not in line[max(0, start - 5) : end + 5]:
                    continue
                original = matched
            linked = render_link(
                original,
                ins.get("slug") or ins["term"],
                ins["provider"],
                ins["term"],
                ins.get("interest", "med"),
                link_format,
                full_url=ins["url"],
            )
            line = line[:start] + linked + line[end:]
        lines[line_no - 1] = line

    return "\n".join(lines) + ("\n" if text.endswith("\n") else "")


def run_insert(
    config_path: str | Path,
    report_path: str | Path | None = None,
    output_path: str | Path | None = None,
) -> Path:
    cfg = load_config(config_path)
    report_file = Path(report_path or cfg.get("report") or "output/link-report.json")
    report = json.loads(report_file.read_text(encoding="utf-8"))

    input_path = Path(cfg["input"])
    text = input_path.read_text(encoding="utf-8")
    insertions = select_candidates(report, cfg)

    if cfg.get("dry_run"):
        print(f"[dry-run] Would insert {len(insertions)} links into {input_path}")
        return Path(output_path or cfg.get("output") or "output/book-linked.md")

    output = Path(output_path or cfg.get("output") or "output/book-linked.md")
    output.parent.mkdir(parents=True, exist_ok=True)

    if cfg.get("backup", True) and input_path.is_file():
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup = input_path.with_suffix(input_path.suffix + f".bak.{stamp}")
        shutil.copy2(input_path, backup)

    result = apply_insertions(
        text,
        insertions,
        cfg.get("protect") or {},
        cfg.get("link_format", "md"),
    )
    output.write_text(result, encoding="utf-8")
    return output
