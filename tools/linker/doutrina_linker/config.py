"""Load YAML config with defaults."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

# Insert-time density: how many links to *bake into* the MD.
# UI density (lo/med/hi) later filters by interest tags — insert at "hi" (max)
# so the reader can dial down without re-running the pipeline.
#
# No max_same_article_per_document / max_occurrences_per_term:
# same article+provider is limited to once **per heading** (see matcher + insert).
DEFAULT_DENSITIES = {
    "low": {
        "min_term_length": 3,
        "max_links_per_paragraph": 8,
        "min_chars_between_links": 40,
    },
    "med": {
        "min_term_length": 3,
        "max_links_per_paragraph": 16,
        "min_chars_between_links": 12,
    },
    "hi": {
        "min_term_length": 2,
        "max_links_per_paragraph": 40,
        "min_chars_between_links": 0,
    },
}

DEFAULT_PROVIDERS = ["wikipedia", "wiktionary", "maps"]


def load_config(path: str | Path) -> dict[str, Any]:
    cfg_path = Path(path)
    with cfg_path.open(encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh) or {}
    cfg.setdefault("providers", list(DEFAULT_PROVIDERS))
    cfg.setdefault("language", "pt")  # pt | en — dictionaries should match
    # Default bake-in is max density; UI checkboxes filter visibility
    cfg.setdefault("density", "hi")
    densities = dict(DEFAULT_DENSITIES)
    for tier, defaults in DEFAULT_DENSITIES.items():
        user = (cfg.get("densities") or {}).get(tier) or {}
        # Drop obsolete keys if present in user YAML
        cleaned = {
            k: v
            for k, v in user.items()
            if k
            not in (
                "max_occurrences_per_term",
                "max_same_article_per_document",
            )
        }
        densities[tier] = {**defaults, **cleaned}
    for tier, user in (cfg.get("densities") or {}).items():
        if tier not in densities and isinstance(user, dict):
            densities[tier] = {**DEFAULT_DENSITIES.get("med", {}), **user}
    cfg["densities"] = densities
    cfg.setdefault(
        "protect",
        {
            "frontmatter": True,
            "headings": True,
            "fenced_blocks": True,  # opaque fences; spirit/quote stay transparent
            "termos_relacionados": True,
            "indice_geral": True,
            "existing_links": True,
            "inline_code": True,
            "footnotes": True,
        },
    )
    cfg.setdefault("link_format", "md")
    return cfg


def density_settings(cfg: dict[str, Any]) -> dict[str, Any]:
    key = str(cfg.get("density", "hi")).lower()
    if key == "low":
        key = "low"
    return cfg["densities"].get(key, cfg["densities"]["hi"])
