#!/usr/bin/env python3
"""Phase 2 — insert links from report + density config."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from doutrina_linker.config import load_config  # noqa: E402
from doutrina_linker.insert_phase import run_insert, select_candidates  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Phase 2: insert provider links using report + density settings."
    )
    parser.add_argument(
        "-c",
        "--config",
        default="config.yaml",
        help="YAML config path (default: config.yaml)",
    )
    parser.add_argument(
        "-r",
        "--report",
        default=None,
        help="Report JSON path (overrides config report:)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Linked Markdown output (overrides config output:)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print insertion count without writing output",
    )
    args = parser.parse_args()

    config_path = Path(args.config)
    if not config_path.is_file():
        print(f"error: config not found: {config_path}", file=sys.stderr)
        print("hint: cp config.example.yaml config.yaml", file=sys.stderr)
        return 1

    cfg = load_config(config_path)
    if args.dry_run:
        cfg = dict(cfg)
        cfg["dry_run"] = True

    report_path = Path(args.report or cfg.get("report") or "output/link-report.json")
    if not report_path.is_file():
        print(f"error: report not found: {report_path}", file=sys.stderr)
        print("hint: run report.py first", file=sys.stderr)
        return 1

    if cfg.get("dry_run"):
        report = json.loads(report_path.read_text(encoding="utf-8"))
        insertions = select_candidates(report, cfg)
        print(f"[dry-run] Would insert {len(insertions)} links")
        providers: dict[str, int] = {}
        for ins in insertions:
            providers[ins["provider"]] = providers.get(ins["provider"], 0) + 1
        for name, count in sorted(providers.items()):
            print(f"  {name}: {count}")
        return 0

    out = run_insert(config_path, report_path, args.output)
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
