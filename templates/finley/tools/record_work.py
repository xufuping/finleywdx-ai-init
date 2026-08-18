#!/usr/bin/env python3
"""Record one Finley delivery note in a compact, append-only work log."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def git_value(root: Path, *args: str) -> str:
    try:
        result = subprocess.run(["git", *args], cwd=root, text=True,
                                capture_output=True, check=False)
    except OSError:
        return ""
    return result.stdout.strip()


def identity(root: Path, supplied: str | None) -> str:
    raw = supplied or os.getenv("FINLEY_DEVELOPER") or git_value(root, "config", "user.name")
    raw = raw or os.getenv("USER") or os.getenv("USERNAME") or "anonymous"
    return "".join(ch if ch.isalnum() or ch in "._-" else "-" for ch in raw.strip()) or "anonymous"


def read_details(args: argparse.Namespace) -> str:
    if args.file:
        path = Path(args.file)
        if not path.is_file():
            raise ValueError(f"找不到说明文件：{path}")
        return path.read_text(encoding="utf-8").strip()
    if args.stdin:
        return sys.stdin.read().strip()
    return ""


def clean(value: str) -> str:
    return " ".join(value.replace("\n", " ").split())


def append_note(root: Path, args: argparse.Namespace, detail: str) -> Path:
    author = identity(root, args.developer)
    folder = root / ".finley" / "workspace" / author
    folder.mkdir(parents=True, exist_ok=True)
    log_path = folder / "worklog.md"
    if not log_path.exists():
        log_path.write_text(f"# Finley 工作记录\n\n> 记录人：{author}\n\n", encoding="utf-8")

    branch = args.branch or git_value(root, "branch", "--show-current") or "未指定"
    commit = args.commit or "未关联提交"
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %z")
    lines = [
        f"## {timestamp} · {clean(args.title)}",
        f"- 负责人：{author}",
        f"- 分支：`{clean(branch)}`",
        f"- 提交：`{clean(commit)}`",
        f"- 摘要：{clean(args.summary)}",
    ]
    if detail:
        lines.extend(["", detail])
    with log_path.open("a", encoding="utf-8") as stream:
        stream.write("\n" + "\n".join(lines) + "\n")
    return log_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Finley：记录一次工作的结果")
    parser.add_argument("--title", required=True, help="工作标题")
    parser.add_argument("--summary", required=True, help="一句话结果摘要")
    parser.add_argument("--commit", help="关联提交，可用逗号分隔")
    parser.add_argument("--branch", help="分支名")
    parser.add_argument("--developer", help="记录人标识")
    parser.add_argument("--file", help="从 Markdown 文件读取详细说明")
    parser.add_argument("--stdin", action="store_true", help="从标准输入读取详细说明")
    args = parser.parse_args()
    try:
        path = append_note(project_root(), args, read_details(args))
    except (OSError, ValueError) as error:
        print(f"[Finley] 无法记录工作：{error}", file=sys.stderr)
        return 1
    print(f"[Finley] 已写入工作记录：{path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
