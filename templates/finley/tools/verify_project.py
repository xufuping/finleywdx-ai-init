#!/usr/bin/env python3
"""Run the checks a project declares as its definition of done."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path


PLACEHOLDER = "<占位"
CHECKS = ("lint", "typecheck", "test")


@dataclass(frozen=True)
class Check:
    area: str
    kind: str
    command: str

    @property
    def label(self) -> str:
        return f"{self.area}:{self.kind}"


def scalar_config(path: Path) -> dict[str, object]:
    """Read the small YAML subset used by Finley without adding a dependency."""
    data: dict[str, object] = {}
    section: dict[str, object] | None = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line.strip() or ":" not in line:
            continue
        indent = len(line) - len(line.lstrip())
        key, value = (part.strip() for part in line.strip().split(":", 1))
        value = value.strip(" \'\"")
        if indent == 0:
            if value:
                data[key] = value
                section = None
            else:
                section = {}
                data[key] = section
        elif section is not None:
            section[key] = value
    return data


def package_runner(root: Path) -> str:
    for lock, runner in (("pnpm-lock.yaml", "pnpm"), ("yarn.lock", "yarn"), ("bun.lockb", "bun")):
        if (root / lock).exists():
            return runner
    return "npm"


def node_commands(root: Path) -> dict[str, str]:
    package = root / "package.json"
    if not package.exists():
        return {}
    try:
        scripts = json.loads(package.read_text(encoding="utf-8")).get("scripts", {})
    except (OSError, json.JSONDecodeError):
        return {}
    runner = package_runner(root)
    names = {"lint": ("lint",), "typecheck": ("typecheck", "type-check", "tsc"), "test": ("test",)}
    found: dict[str, str] = {}
    for kind, candidates in names.items():
        match = next((name for name in candidates if name in scripts), None)
        if match:
            found[kind] = f"{runner} test" if match == "test" else f"{runner} run {match}"
    return found


def python_commands(root: Path) -> dict[str, str]:
    path = root / "pyproject.toml"
    if not path.exists():
        return {}
    try:
        data = tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError):
        return {}
    blob = json.dumps(data).lower()
    tools = data.get("tool", {})
    found: dict[str, str] = {}
    if "ruff" in blob or isinstance(tools, dict) and "ruff" in tools:
        found["lint"] = "ruff check ."
    if "mypy" in blob or isinstance(tools, dict) and "mypy" in tools:
        found["typecheck"] = "mypy ."
    if "pytest" in blob:
        found["test"] = "pytest"
    return found


def configured_checks(root: Path, config: dict[str, object], area: str) -> list[Check]:
    section = config.get("quality", {})
    explicit = section.get(area, {}) if isinstance(section, dict) else {}
    discovered = node_commands(root) if area == "frontend" else python_commands(root)
    checks: list[Check] = []
    for kind in CHECKS:
        command = explicit.get(kind) if isinstance(explicit, dict) else None
        if not command or str(command).startswith(PLACEHOLDER):
            command = discovered.get(kind)
        if command and not str(command).startswith(PLACEHOLDER):
            checks.append(Check(area, kind, str(command)))
    return checks


def execute(check: Check, root: Path, preview: bool) -> bool:
    print(f"\n▶ [{check.label}] {check.command}")
    if preview:
        print("   (dry-run 跳过执行)")
        return True
    result = subprocess.run(check.command, shell=True, cwd=root, check=False)
    mark = "✔" if result.returncode == 0 else "✗"
    print(f"   {mark} {check.label} {'通过' if result.returncode == 0 else '失败'}")
    return result.returncode == 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Finley：执行项目定义的交付检查")
    parser.add_argument("--only", choices=("frontend", "backend"), help="只检查一侧")
    parser.add_argument("--dry-run", action="store_true", help="只展示命令")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    config_path = root / ".finley" / "config.yaml"
    if not config_path.exists():
        print(f"[Finley] 缺少配置：{config_path}", file=sys.stderr)
        return 1
    config = scalar_config(config_path)
    areas = (args.only,) if args.only else ("frontend", "backend")
    checks = [check for area in areas for check in configured_checks(root, config, area)]
    print("=" * 60 + "\nFinley 项目检查\n" + "=" * 60)
    if not checks:
        print("\n[Finley] 没有发现可执行检查，请在 .finley/config.yaml 中配置命令。", file=sys.stderr)
        return 2
    failed = [check.label for check in checks if not execute(check, root, args.dry_run)]
    print("\n" + "=" * 60)
    if failed:
        print(f"检查失败：{len(failed)}/{len(checks)} 项")
        return 1
    print(f"检查通过：{len(checks)}/{len(checks)} 项")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
