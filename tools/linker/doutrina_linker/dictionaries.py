"""Load provider JSON dictionaries — only explicit entries, no auto-fabrication."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

from .normalize import normalize_key
from .providers import interest_from_completeness, normalize_domain, provider_code


@dataclass
class DictEntry:
    provider: str
    label: str
    url: str
    slug: str
    aliases: list[str] = field(default_factory=list)
    interest: str = "med"  # hi|med|lo — completeness of *this* article
    domain: str = "general"  # spiritism | general | definition | place
    normalized: str = ""

    def __post_init__(self) -> None:
        self.normalized = normalize_key(self.label)


def _coerce_entries(provider: str, raw: Any) -> list[dict[str, Any]]:
    if isinstance(raw, dict) and "entries" in raw:
        entries = raw["entries"]
        if isinstance(entries, dict):
            out = []
            for key, value in entries.items():
                if isinstance(value, dict):
                    item = dict(value)
                    item.setdefault("label", key)
                    out.append(item)
            return out
        if isinstance(entries, list):
            return entries
    if isinstance(raw, dict):
        out = []
        for key, value in raw.items():
            if key in {
                "meta",
                "entries",
                "version",
                "source",
                "baseUrl",
                "encyclopedia",
                "language",
                "description",
                "priority",
                "provider",
            }:
                continue
            if isinstance(value, dict):
                item = dict(value)
                item.setdefault("label", key)
                out.append(item)
        return out
    if isinstance(raw, list):
        return raw
    raise ValueError(f"Unsupported dictionary shape for provider {provider!r}")


def _slug_for_entry(provider: str, item: dict[str, Any], label: str) -> str:
    if item.get("slug"):
        return unquote(str(item["slug"]))
    url = str(item.get("url") or "")
    if provider == "luz" and "item=" in url:
        return unquote(url.split("item=", 1)[1])
    if provider in {"wikipedia", "wiktionary"}:
        path = urlparse(url).path
        if "/wiki/" in path:
            return unquote(path.split("/wiki/", 1)[1])
    if provider == "maps":
        return label
    return label


def _interest_for_entry(item: dict[str, Any], provider: str) -> str:
    """Per-article grade: hi | med | lo (notability / completeness of *this* entry).

    Prefer explicit interest/completeness on the JSON entry. Defaults are
    conservative so density filters actually separate:
      hi  — notable core (e.g. Deus, Cristo on Luz)
      med — standard article
      lo  — thin, peripheral, or definition filler
    """
    if item.get("interest") is not None:
        return interest_from_completeness(item.get("interest"))
    if item.get("completeness") is not None:
        return interest_from_completeness(item.get("completeness"))
    defaults = {
        "luz": "med",
        "wikipedia": "med",
        "wiktionary": "lo",
        "maps": "lo",
    }
    return defaults.get(provider, "med")

def _domain_for_entry(item: dict[str, Any], provider: str) -> str:
    raw = item.get("domain") or item.get("kind") or item.get("type")
    # maps JSON uses type: city|country|street — those are places
    if provider == "maps":
        return "place"
    if provider == "wiktionary":
        if raw in (None, "", "definition"):
            return "definition"
    if isinstance(raw, str) and raw.lower() in {
        "city",
        "country",
        "region",
        "street",
        "district",
        "landmark",
        "station",
        "park",
        "ocean",
        "address",
        "fictional",
    }:
        return "place"
    return normalize_domain(raw if isinstance(raw, str) else None, provider=provider)


def load_dictionary(path: str | Path, provider: str) -> list[DictEntry]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    entries: list[DictEntry] = []
    for item in _coerce_entries(provider, data):
        label = str(item.get("label") or item.get("term") or "").strip()
        url = str(item.get("url") or "").strip()
        if not label or not url:
            continue
        aliases = [str(a).strip() for a in item.get("aliases", []) if str(a).strip()]
        slug = _slug_for_entry(provider, item, label)
        interest = _interest_for_entry(item, provider)
        domain = _domain_for_entry(item, provider)
        entries.append(
            DictEntry(
                provider=provider,
                label=label,
                url=url,
                slug=slug,
                aliases=aliases,
                interest=interest,
                domain=domain,
            )
        )
    return entries


def load_all(cfg: dict) -> dict[str, list[DictEntry]]:
    paths = cfg.get("dictionaries") or {}
    loaded: dict[str, list[DictEntry]] = {}
    for provider, spec in paths.items():
        files = spec if isinstance(spec, (list, tuple)) else [spec]
        merged: list[DictEntry] = []
        seen: set[tuple[str, str]] = set()
        for rel in files:
            if not Path(rel).is_file():
                continue
            for entry in load_dictionary(rel, provider):
                key = (entry.normalized, entry.url)
                if key in seen:
                    continue
                seen.add(key)
                merged.append(entry)
        loaded[provider] = merged
    return loaded


def short_href(provider: str, slug: str) -> str:
    return f"{provider_code(provider)}:{slug}"
