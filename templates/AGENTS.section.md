<!-- FINLEY:START -->
# Finley 工作基线

本项目使用 Finley 建立可复核的 AI 开发节奏：先让 spec-kit 明确需求和计划，再由 Finley 验证交付结果、记录关键决策。

## 工作方式

1. 使用 spec-kit 逐步完成原则、规格、澄清、方案、任务和实现。各平台命令名称不同，以当前 agent 的 spec-kit 集成为准。
2. 每批实现结束、提交之前运行：
   ```bash
   python .finley/tools/verify_project.py
   ```
   发现失败先修复，再验证；没有可执行检查也不能视为完成。
3. 一个有价值的工作阶段结束后，记录结果和上下文：
   ```bash
   python .finley/tools/record_work.py --title "..." --summary "..." --commit "..."
   ```
   新会话开始时阅读 `.finley/workspace/<开发者>/worklog.md` 的最近记录。

## 文件职责

- `.finley/config.yaml`：项目检查命令。
- `.finley/tools/verify_project.py`：执行交付检查。
- `.finley/tools/record_work.py`：记录工作结论和关联提交。
- `.finley/workspace/`：按记录人保存工作日志。
- `.agents/skills/`：给 AI 助手的 Finley 操作说明。

本区块由 Finley 管理；FINLEY 标记之外的内容会被保留。
<!-- FINLEY:END -->
