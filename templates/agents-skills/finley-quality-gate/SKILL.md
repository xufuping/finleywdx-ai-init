---
name: finley-quality-gate
description: "在提交前执行项目可用的 lint、类型检查与测试；有失败时修复并重新验证。"
---

# Finley 交付检查

每次代码改动进入收尾阶段时，在项目根目录运行：

```bash
python .finley/tools/verify_project.py
```

工具从 `.finley/config.yaml` 读取检查命令；仍是占位时，会尝试读取项目的 Node 或 Python 工具链。所有已解析检查都必须通过。

- `--only frontend` 或 `--only backend` 适合局部开发；提交前应跑完整检查。
- `--dry-run` 可预览将执行的命令。
- 没有解析到任何命令会失败，要求项目明确配置检查方式，避免假通过。

检查通过且一个工作阶段已经结束时，使用 `finley-memory` 记录结果。
