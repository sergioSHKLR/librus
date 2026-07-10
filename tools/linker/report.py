#!/usr/bin/env python3
"""Phase 1 — scan a Markdown book and emit a link-candidate report."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from doutrina_linker.report_phase import run_report  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Phase 1: build link candidate report from enabled providers "
            "(wikipedia, wiktionary, maps, luz, …)."
        )
    )
    parser.add_argument(
        "-c",
        "--config",
        default="config.yaml",
        help="YAML config path (default: config.yaml)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Report JSON path (overrides config report:)",
    )
    args = parser.parse_args()

    config_path = Path(args.config)
    if not config_path.is_file():
        print(f"error: config not found: {config_path}", file=sys.stderr)
        print("hint: cp config.example.yaml config.yaml", file=sys.stderr)
        return 1

    out = run_report(config_path, args.output)
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
