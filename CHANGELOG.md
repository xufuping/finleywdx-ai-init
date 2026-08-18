# 更新日志

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 优化
- 重写 README，提升视觉体验和信息层次
- 添加 CONTRIBUTING.md 贡献指南
- 添加 CHANGELOG.md 变更日志

## [0.1.1] - 2024-07-07

### Changed
- 重构代码架构，采用分层设计（application/services/platform/presentation）
- 优化用户体验和错误提示
- 改进环境检测逻辑

### Added
- 完善的环境检测和中文错误提示
- 幂等的文件安装逻辑，保护用户自定义配置

### Fixed
- 修复多个 integration 安装时的错误处理

## [0.1.0] - 2024-07-04

### Added
- 初始版本发布
- 集成 spec-kit 工作流命令（支持 Cursor、Claude、Codex、Gemini、Copilot）
- Finley 质量门禁工具（verify_project.py）
- Finley 工作记录工具（record_work.py）
- 自动环境检测（Node.js、Git、Python、uv）
- 幂等的 AGENTS.md 合并机制
- 命令行选项：--integration、--skip-speckit、--dry-run

[Unreleased]: https://github.com/xufuping/Finley-main/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/xufuping/Finley-main/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xufuping/Finley-main/releases/tag/v0.1.0
