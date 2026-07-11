#!/usr/bin/env python3
"""Block 1 of 1 — tools/run-linker.py
Description: Run report+insert for one book into .cache/linked (source untouched)
Version: 1.a
Revised: 10Jul26
"""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LINKER_ROOT = ROOT / "linker"
if str(LINKER_ROOT) not in sys.path:
    sys.path.insert(0, str(LINKER_ROOT))

from doutrina_linker.config import load_config  # noqa: E402
from doutrina_linker.insert_phase import run_insert  # noqa: E402
from doutrina_linker.report_phase import run_report  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description="nano-ssg linker: dictionary → linked MD (cache)")
    p.add_argument("--input", required=True, help="Source book.md (unlinked)")
    p.add_argument("--output", required=True, help="Linked MD output path")
    p.add_argument("--report", required=True, help="Report JSON path")
    p.add_argument("--dicts", required=True, help="Directory with provider JSON files")
    p.add_argument("--lang", default="pt", choices=("pt", "en"))
    p.add_argument("--density", default="hi", choices=("low", "med", "hi"))
    args = p.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    report_path = Path(args.report).resolve()
    dicts = Path(args.dicts).resolve()

    if not input_path.is_file():
        print(f"error: input not found: {input_path}", file=sys.stderr)
        return 1

    providers = ["wikipedia", "wiktionary"]
    dictionaries: dict[str, str] = {
        "wikipedia": str(dicts / "wikipedia.json"),
        "wiktionary": str(dicts / "wiktionary.json"),
    }
    luz = dicts / "luz-pedia.json"
    if args.lang == "pt" and luz.is_file():
        providers = ["luz", "wikipedia", "wiktionary"]
        dictionaries["luz"] = str(luz)

    for name, path in list(dictionaries.items()):
        if not Path(path).is_file():
            print(f"warn: missing dictionary {name}: {path}", file=sys.stderr)
            dictionaries.pop(name, None)
            if name in providers:
                providers.remove(name)

    if not providers:
        print("error: no provider dictionaries available", file=sys.stderr)
        return 1

    cfg = {
        "input": str(input_path),
        "output": str(output_path),
        "report": str(report_path),
        "backup": False,
        "dry_run": False,
        "link_format": "md",
        "language": args.lang,
        "dictionaries": dictionaries,
        "providers": providers,
        "density": args.density,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False, encoding="utf-8") as fh:
        import yaml

        yaml.safe_dump(cfg, fh, allow_unicode=True)
        cfg_path = Path(fh.name)

    try:
        # load_config adds density defaults
        load_config(cfg_path)
        run_report(cfg_path, report_path)
        out = run_insert(cfg_path, report_path, output_path)
        report = json.loads(report_path.read_text(encoding="utf-8"))
        n_cand = len(report.get("candidates") or report.get("hits") or [])
        print(f"linked → {out} (candidates~{n_cand})")
        return 0
    except Exception as exc:
        print(f"error: linker failed: {exc}", file=sys.stderr)
        return 1
    finally:
        try:
            cfg_path.unlink(missing_ok=True)
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
