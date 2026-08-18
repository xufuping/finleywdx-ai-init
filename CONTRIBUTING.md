# 贡献指南

感谢你对 Finley 项目的关注！我们欢迎各种形式的贡献。

## 🚀 开发环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/xufuping/Finley-main.git
cd Finley-main
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
# 监听模式编译
npm run dev

# 构建
npm run build
```

### 4. 本地测试

```bash
# 在本仓库链接
npm link

# 在测试项目中使用
cd /path/to/test-project
npm link @finleywdx/ai-init
ai-init init --dry-run
```

## 📝 代码规范

### TypeScript 风格

- 使用现代 ES 模块语法（`import/export`）
- 优先使用函数式编程风格
- 为公共 API 添加 JSDoc 注释
- 保持类型安全，避免使用 `any`

### 项目架构

项目采用分层架构，请遵循以下原则：

```
src/
├── application/     # 应用层：编排业务流程
├── services/        # 服务层：核心业务逻辑
├── platform/        # 平台层：文件操作、命令执行等基础设施
└── presentation/    # 表现层：用户界面（控制台输出）
```

**依赖规则**：
- `application` 可以依赖所有其他层
- `services` 可以依赖 `platform` 和 `presentation`
- `platform` 和 `presentation` 不依赖上层

### 提交信息规范

使用语义化的提交信息：

```
类型: 简短描述

详细说明（可选）
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构代码
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**：
```
feat: 添加 --verbose 选项显示详细日志

在执行 spec-kit 编排时，用户可能需要查看详细的命令输出
以便调试问题。本提交添加 --verbose 标志来控制日志级别。
```

## 🔄 提交流程

### 1. Fork 和分支

```bash
# Fork 仓库后克隆你的 fork
git clone https://github.com/YOUR_USERNAME/Finley-main.git
cd Finley-main

# 创建特性分支
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

```bash
# 进行修改
# ...

# 构建验证
npm run build

# 本地测试
node dist/cli.js --version
```

### 3. 提交变更

```bash
git add .
git commit -m "feat: 你的功能描述"
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request，描述：
- 变更的目的和背景
- 实现方案
- 测试方法
- 相关 Issue（如有）

## 🧪 测试

### 手动测试清单

在提交 PR 前，请确保：

- [ ] `npm run build` 成功
- [ ] `node dist/cli.js --version` 输出正确版本
- [ ] `node dist/cli.js --help` 显示帮助信息
- [ ] 在干净的测试项目中运行 `ai-init init --dry-run` 无报错
- [ ] 实际运行 `ai-init init` 能正确创建文件

## 📦 发布流程（维护者）

### 准备发布

1. **更新版本号**

```bash
npm version patch  # 或 minor / major
```

2. **更新 CHANGELOG.md**

记录本次版本的所有变更。

3. **本地构建和测试**

```bash
# 清理并构建
npm run clean
npm run build

# 本地自检
node dist/cli.js --version
node dist/cli.js --help

# 预览将要发布的文件
npm pack --dry-run
```

### 发布到 npm

1. **登录 npm**

```bash
npm login
```

2. **发布包**

```bash
npm publish --access public
```

> 注意：由于是 scoped 包（`@finleywdx/`），默认是私有的，必须加 `--access public` 标志。

3. **验证发布**

```bash
# 等待几分钟后测试
npx @finleywdx/ai-init@latest --version
```

4. **创建 GitHub Release**

在 GitHub 上创建对应的 Release 和 Tag。

### 发布内容控制

发布内容由 `package.json` 的 `files` 字段控制：

```json
{
  "files": [
    "dist",
    "templates",
    "README.md",
    "LICENSE"
  ]
}
```

只有这些文件/目录会被发布到 npm。

### 本地联调技巧

```bash
# 在 Finley 项目中
npm run build
npm link

# 在测试项目中
npm link @finleywdx/ai-init
ai-init init --dry-run

# 测试完成后取消链接
npm unlink @finleywdx/ai-init
```

## 💡 开发技巧

### 调试

在代码中添加 `console.log`，然后：

```bash
npm run build
node dist/cli.js init --dry-run
```

### 快速迭代

使用监听模式：

```bash
# 终端 1
npm run dev

# 终端 2
node dist/cli.js init --dry-run
```

## 📚 相关资源

- [spec-kit 仓库](https://github.com/github/spec-kit)
- [uv 文档](https://docs.astral.sh/uv/)
- [commander.js 文档](https://github.com/tj/commander.js)

## ❓ 问题反馈

如果遇到问题：

1. 查看 [Issues](https://github.com/xufuping/Finley-main/issues)
2. 创建新 Issue 并提供：
   - 操作系统和版本
   - Node.js 版本
   - 完整的错误信息
   - 重现步骤

感谢你的贡献！🎉

