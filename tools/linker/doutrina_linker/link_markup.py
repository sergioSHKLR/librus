"""Compact MD link markup — slug only; full URL resolved in markdown-to-html.js."""

from __future__ import annotations

import html
import re

from .dictionaries import short_href
from .providers import provider_code

_MD_ESCAPE = re.compile(r"([\\[\]])")


def _escape_md_label(text: str) -> str:
    return _MD_ESCAPE.sub(r"\\\1", text)


def _meta_title(provider: str, interest: str) -> str:
    return f"{provider_code(provider)}:{interest}"


def render_link_md(
    matched: str,
    slug: str,
    provider: str,
    term_label: str,
    interest: str = "med",
) -> str:
    """[text](l:Espírito "l:lo") — UTF-8 slug, no full URL in source.

    Destinations with spaces/parens use CommonMark <...> form so markdown-it
    does not truncate multi-word Luz/Wiki titles.
    """
    label = _escape_md_label(matched)
    title = _meta_title(provider, interest)
    href = short_href(provider, slug)
    if re.search(r"[\s()]", href):
        dest = f"<{href}>"
    else:
        dest = href
    return f'[{label}]({dest} "{title}")'


def render_link_html(
    matched: str,
    url: str,
    provider: str,
    term_label: str,
    interest: str = "med",
) -> str:
    code = provider_code(provider)
    return (
        f'<a href="{html.escape(url, quote=True)}"'
        f' data-doutrina-link="1"'
        f' data-link-provider="{html.escape(code, quote=True)}"'
        f' data-link-interest="{html.escape(interest, quote=True)}"'
        f' data-link-term="{html.escape(term_label, quote=True)}"'
        f'>{html.escape(matched)}</a>'
    )


def render_link(
    matched: str,
    slug_or_url: str,
    provider: str,
    term_label: str,
    interest: str = "med",
    fmt: str = "md",
    full_url: str = "",
) -> str:
    if str(fmt).lower() == "html":
        return render_link_html(matched, full_url or slug_or_url, provider, term_label, interest)
    return render_link_md(matched, slug_or_url, provider, term_label, interest)