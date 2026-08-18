<div align="center">

# @finleywdx/ai-init

🤖 **AI 工程化工作流初始化器**

一条命令，把「spec-kit 规范驱动开发 + 跨会话记忆层 + 质量门禁」铺进你的新项目

[![npm version](https://img.shields.io/npm/v/@finleywdx/ai-init.svg)](https://www.npmjs.com/package/@finleywdx/ai-init)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

[快速开始](#-快速开始) · [核心特性](#-核心特性) · [工作流程](#-工作流程)

</div>

---

## ⚡ 快速开始

在项目根目录运行一条命令：

```bash
npx @finleywdx/ai-init init
```

**就这么简单！** 它会自动：

✅ 检查运行环境（Node.js、Git、Python、uv）  
✅ 安装 spec-kit 工作流命令  
✅ 配置质量门禁工具  
✅ 设置跨会话工作记录  

## 🎯 核心特性

| 特性 | 说明 |
|:-----|:-----|
| 🔧 **规范驱动开发** | 集成 [spec-kit](https://github.com/github/spec-kit)，将「规范 → 计划 → 任务 → 实现」流程引入项目 |
| 🧠 **跨会话记忆** | 内置工作记录系统，让 AI 助手记住上次的决策和进展 |
| ✅ **质量门禁** | 提交前自动执行 lint、类型检查、测试 |
| 🎯 **多 Agent 支持** | 一次为 5 个主流 AI 编码助手配置命令（Cursor、Claude、Codex、Gemini、Copilot） |
| 🪶 **轻量无依赖** | 核心工具使用 Python 标准库实现，零第三方依赖 |
| 🔄 **幂等安装** | 可重复运行，不会覆盖用户自定义配置 |

## 📦 安装

### 作为项目依赖

```bash
npm install -D @finleywdx/ai-init
```

### 全局安装

```bash
npm install -g @finleywdx/ai-init
```

### 无需安装（推荐）

```bash
npx @finleywdx/ai-init init
```

## 🔧 环境要求

| 依赖 | 版本 | 说明 |
|:-----|:-----|:-----|
| Node.js | ≥ 18 | 运行本 CLI |
| Git | 任意版本 | 版本控制 |
| Python | ≥ 3.11 | 运行质量门禁和记录工具（需标准库 `tomllib`） |
| uv | 最新版 | 安装 spec-kit 的 `specify` CLI |

### 安装 uv

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# macOS (Homebrew)
brew install uv
```

```powershell
# Windows (PowerShell)
irm https://astral.sh/uv/install.ps1 | iex

# Windows (WinGet)
winget install --id=astral-sh.uv -e
```

安装后重启终端并确认：

```bash
uv --version
```

更多平台请参考 [uv 官方文档](https://docs.astral.sh/uv/getting-started/installation/)。

## 🚀 使用方法

### 基础用法

在目标项目根目录：

```bash
ai-init init
```

### 高级选项

```bash
# 只安装指定的 AI agent 集成
ai-init init --integration cursor-agent,claude

# 跳过 spec-kit，只安装 Finley 工具
ai-init init --skip-speckit

# 预览将执行的操作（不实际修改文件）
ai-init init --dry-run

# 不忽略 agent 工具检查
ai-init init --no-ignore-agent-tools
```

### 查看帮助

```bash
ai-init --help
ai-init --version
```

## 🛠️ 工作流程

### 1. 使用 spec-kit 明确需求

```bash
/speckit.constitution  # 定义项目治理原则
/speckit.specify       # 描述功能需求（专注"做什么"）
/speckit.clarify       # 澄清模糊点
/speckit.plan          # 制定技术方案
/speckit.tasks         # 拆解任务清单
/speckit.implement     # 实现代码
```

> 💡 命令格式因 AI 平台而异，以你使用的 agent 为准

### 2. 提交前运行质量门禁

```bash
python .finley/tools/verify_project.py
```

确保所有检查通过（lint、类型检查、测试）才能提交。

### 3. 记录工作结果

```bash
python .finley/tools/record_work.py \
  --title "实现用户登录功能" \
  --summary "完成 OAuth 集成和 JWT 验证" \
  --commit abc1234
```

新会话开始时，AI 助手会读取 `.finley/workspace/<开发者>/worklog.md` 了解项目历史。

## ⚙️ 配置

编辑 `.finley/config.yaml` 定义项目检查命令：

```yaml
quality:
  frontend:
    lint: "npm run lint"
    typecheck: "npm run typecheck"
    test: "npm test"
  backend:
    lint: "ruff check ."
    typecheck: "mypy ."
    test: "pytest"

developer: ""  # 留空自动探测
```

如果保留占位符，`verify_project.py` 会自动探测：
- **前端**: 从 `package.json` 的 `scripts` 探测
- **后端**: 从 `pyproject.toml` 探测 ruff、mypy、pytest

## 📁 初始化后的目录结构

```
你的项目/
├── .specify/                    # spec-kit 规范和模板
├── .cursor/ .claude/ ...        # 各 AI agent 的命令
├── .finley/
│   ├── config.yaml              # 质量检查配置
│   ├── tools/
│   │   ├── verify_project.py    # 质量门禁
│   │   └── record_work.py       # 工作记录
│   └── workspace/<开发者>/      # 工作日志
├── .agents/skills/
│   ├── finley-quality-gate/SKILL.md
│   └── finley-memory/SKILL.md
└── AGENTS.md                    # AI 助手使用说明
```

## 🤔 与 spec-kit 的关系

spec-kit 负责**规范驱动开发的主流程**（constitution → specify → plan → tasks → implement）。

`ai-init` **不重造**这套流程，而是**编排调用** spec-kit 的 `specify` CLI 完成安装，再在其之上补充 spec-kit 不覆盖的工程纪律：

- **交付检查（Quality Gate）**: 在提交前统一跑 lint / typecheck / test
- **工作记录（Worklog）**: 把阶段结果、决策和提交写入可读的 `worklog.md`

Finley 的设计重点是**小而明确**：把规范交给 spec-kit，把项目检查和协作记录留在自己的工具边界内。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

[MIT](./LICENSE) © 2026 xfp

