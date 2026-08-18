import { Command } from "commander";
import { readPackageManifest } from "./platform/package-files.js";
import { initializeProject } from "./application/initialize-project.js";
import { consoleUi } from "./presentation/console.js";

function main(): void {
  const pkg = readPackageManifest();
  const program = new Command();

  program
    .name("ai-init")
    .description(
      "AI 工程化工作流初始化器：把 spec-kit 工作流 + 记忆层 + 质量门禁初始化进你的项目。",
    )
    .version(pkg.version, "-v, --version", "输出版本号");

  program
    .command("init")
    .description("在当前目录初始化 Finley 工作基线（准备 spec-kit + 安装工具 + 更新 AGENTS.md）")
    .option(
      "-i, --integration <names>",
      "以逗号分隔指定要安装的 spec-kit integration（默认 cursor-agent,claude,codex,gemini,copilot）",
    )
    .option("--skip-speckit", "跳过 spec-kit 编排，仅安装 Finley 工具")
    .option("--no-ignore-agent-tools", "不向 specify 传 --ignore-agent-tools（默认会传）")
    .option("--dry-run", "只打印将执行的操作，不真正调用 specify、不写盘")
    .action(async (opts) => {
      const integrations =
        typeof opts.integration === "string"
          ? opts.integration
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : undefined;
      try {
        const code = await initializeProject({
          integrations,
          skipSpeckit: opts.skipSpeckit,
          // commander 的 --no-ignore-agent-tools 会把 ignoreAgentTools 置为 false
          ignoreAgentTools: opts.ignoreAgentTools,
          dryRun: opts.dryRun,
        });
        process.exit(code);
      } catch (err) {
        consoleUi.error(`初始化过程中发生未预期错误：${(err as Error).message}`);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

main();
