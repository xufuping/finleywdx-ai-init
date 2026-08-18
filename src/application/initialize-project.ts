import { inspectEnvironment } from "../services/inspect-environment.js";
import { provisionSpecKit, DEFAULT_INTEGRATIONS } from "../services/provision-speckit.js";
import { installFinleyAssets } from "../services/install-finley-assets.js";
import { consoleUi } from "../presentation/console.js";
import pc from "picocolors";

export interface InitializationRequest {
  cwd?: string;
  integrations?: string[];
  /** 跳过 spec-kit 编排（只安装 Finley 交付基线）。 */
  skipSpeckit?: boolean;
  ignoreAgentTools?: boolean;
  dryRun?: boolean;
}

/**
 * `ai-init init` 主流程：编排 1→4。
 *   1. 环境检测（缺失则阻断并非零退出）
 *   2. 编排 spec-kit（循环逐个 integration）
 *   3. 安装 Finley 工具
 *   4. 更新 AGENTS.md
 */
export async function initializeProject(options: InitializationRequest = {}): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const integrations = options.integrations?.length
    ? options.integrations
    : [...DEFAULT_INTEGRATIONS];

  consoleUi.title("\nFinley · AI 工程化工作流初始化器\n");
  consoleUi.info(`目标目录：${pc.bold(cwd)}`);
  if (options.dryRun) consoleUi.warn("dry-run 模式：不会真正调用 specify，也不会污染目录。");

  // 1. 环境检测 —— 硬性依赖缺失则阻断
  const envOk = await inspectEnvironment();
  if (!envOk) {
    consoleUi.error("\n初始化已中止：请安装上面列出的依赖后重试。");
    return 1;
  }

  // 2. 编排 spec-kit
  let speckitSkipped = false;
  if (options.skipSpeckit) {
    consoleUi.step("阶段 2/4：准备 spec-kit");
    consoleUi.warn("已通过 --skip-speckit 跳过 spec-kit 编排。");
    speckitSkipped = true;
  } else {
    const res = await provisionSpecKit({
      cwd,
      integrations,
      ignoreAgentTools: options.ignoreAgentTools ?? true,
      dryRun: options.dryRun,
    });
    speckitSkipped = res.skipped;
  }

  // 3 + 4. 安装工具并更新 AGENTS.md（dry-run 时也跳过写盘）
  if (options.dryRun) {
    consoleUi.step("阶段 3/4：安装 Finley 工具");
    consoleUi.warn("dry-run：跳过复制模板。");
    consoleUi.step("阶段 4/4：更新 AI 协作说明");
    consoleUi.warn("dry-run：跳过写入 AGENTS.md。");
  } else {
    installFinleyAssets({ cwd });
  }

  // 收尾报告
  console.log();
  consoleUi.title("初始化完成");
  printNextSteps(speckitSkipped);
  return 0;
}

function printNextSteps(speckitSkipped: boolean): void {
  console.log(pc.bold("\n接下来："));
  const lines: string[] = [];
  if (speckitSkipped) {
    lines.push(
      "先安装 spec-kit 后重跑以补全命令：",
      "  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@<tag>",
    );
  }
  lines.push(
    "编辑 .finley/config.yaml，把 quality 里的占位替换成项目真实命令（也可留给 verify_project.py 自动探测）。",
    "在 AI 助手里按 spec-kit 流程推进：",
    "  /speckit.constitution → /speckit.specify → /speckit.clarify → /speckit.plan →",
    "  /speckit.tasks → /speckit.analyze → /speckit.implement",
    "实现完成、提交前必须跑交付检查：",
    "  python .finley/tools/verify_project.py",
    "一段工作收尾时记录工作结果：",
    "  python .finley/tools/record_work.py --title \"...\" --summary \"...\"",
  );
  for (const l of lines) console.log(`  ${pc.cyan("›")} ${l}`);
  console.log(pc.dim("\n详见项目根目录的 AGENTS.md 与 .agents/skills/。"));
}
