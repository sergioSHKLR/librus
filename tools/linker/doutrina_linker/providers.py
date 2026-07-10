"""Provider codes, domains, and interest tiers (article completeness)."""

from __future__ import annotations

PROVIDER_CODES: dict[str, str] = {
    "luz": "l",
    "wikipedia": "w",
    "wiktionary": "d",
    "dictionary": "d",
    "maps": "m",
}

# Fallback list order when domain is unknown
PROVIDER_PRIORITY: list[str] = ["luz", "wikipedia", "wiktionary"]

# Term kind → preferred provider order when several providers hit the same span
DOMAIN_PROVIDER_ORDER: dict[str, list[str]] = {
    # Spiritism-related concepts
    "spiritism": ["luz", "wikipedia", "wiktionary"],
    # General encyclopedic interest
    "general": ["wikipedia", "luz", "wiktionary"],
    # Word only merits a definition
    "definition": ["wiktionary"],
    # Place, region, country, city (maps folded into wikipedia pack)
    "place": ["wikipedia", "luz", "wiktionary"],
}

DOMAIN_ALIASES: dict[str, str] = {
    "spiritism": "spiritism",
    "spiritist": "spiritism",
    "espiritismo": "spiritism",
    "spiritualist": "spiritism",
    "general": "general",
    "encyclopedia": "general",
    "encyclopaedia": "general",
    "definition": "definition",
    "dictionary": "definition",
    "dic": "definition",
    "place": "place",
    "map": "place",
    "maps": "place",
    "geo": "place",
    "geography": "place",
    "city": "place",
    "country": "place",
    "region": "place",
}

# Defaults when entry omits domain
PROVIDER_DEFAULT_DOMAIN: dict[str, str] = {
    "luz": "spiritism",
    "wikipedia": "general",
    "wiktionary": "definition",
    "maps": "place",  # legacy code still recognized if old MD has m: links
}

INTEREST_ORDER = {"hi": 0, "med": 1, "lo": 2}

DENSITY_VISIBLE_TIERS: dict[str, set[str]] = {
    "lo": {"hi"},
    "low": {"hi"},
    "med": {"hi", "med"},
    "md": {"hi", "med"},
    "hi": {"hi", "med", "lo"},
    "high": {"hi", "med", "lo"},
}


def provider_code(name: str) -> str:
    return PROVIDER_CODES.get(name, name[:1])


def normalize_domain(value: str | None, *, provider: str = "") -> str:
    if value:
        key = str(value).strip().lower()
        if key in DOMAIN_ALIASES:
            return DOMAIN_ALIASES[key]
        if key in DOMAIN_PROVIDER_ORDER:
            return key
    return PROVIDER_DEFAULT_DOMAIN.get(provider, "general")


def provider_order_for_domain(domain: str) -> list[str]:
    return list(DOMAIN_PROVIDER_ORDER.get(domain, PROVIDER_PRIORITY))


def classify_hit_group_domain(domains: list[str], providers: list[str]) -> str:
    """Pick the governing domain for a multi-provider span.

    place > definition-only > spiritism (if Luz or explicit) > general
    """
    ds = set(domains)
    ps = set(providers)
    if "place" in ds or "maps" in ps:
        return "place"
    if ds and ds <= {"definition"} and ps <= {"wiktionary", "dictionary"}:
        return "definition"
    if "spiritism" in ds or "luz" in ps:
        return "spiritism"
    if "definition" in ds and not (ds - {"definition", "general"}):
        # definition + general → treat as general (article preferred over bare def)
        if "general" in ds or "wikipedia" in ps:
            return "general"
        return "definition"
    return "general"


def normalize_interest(value: str | None, default: str = "med") -> str:
    v = (value or default).strip().lower()
    if v in {"hi", "high"}:
        return "hi"
    if v in {"lo", "low"}:
        return "lo"
    if v in {"med", "md", "medium"}:
        return "med"
    return default


def interest_from_completeness(
    completeness: str | float | int | None,
    *,
    default: str = "med",
) -> str:
    """Map article completeness → hi | med | lo for UI density filters.

    Completeness is about the *target resource*, not term frequency:
      hi  — full/notable article
      med — standard entry
      lo  — thin / low-priority
    """
    if completeness is None or completeness == "":
        return default
    if isinstance(completeness, (int, float)):
        score = float(completeness)
        if score > 1.0:
            score = score / 100.0
        if score >= 0.75:
            return "hi"
        if score >= 0.4:
            return "med"
        return "lo"
    return normalize_interest(str(completeness), default=default)


def tiers_for_density(density: str) -> set[str]:
    return set(DENSITY_VISIBLE_TIERS.get(str(density).lower(), DENSITY_VISIBLE_TIERS["med"]))


def interest_tier(global_count: int) -> str:
    """Legacy frequency fallback only."""
    if global_count <= 10:
        return "hi"
    if global_count <= 100:
        return "med"
    return "lo"
